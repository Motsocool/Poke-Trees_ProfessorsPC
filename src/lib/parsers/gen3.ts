/**
 * Gen 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen) save file parser
 * Based on: https://github.com/pret/pokeemerald
 */

import { calcGen3HP, calcGen3Stat, applyNatureModifier } from './statCalculations';
import { getBaseStats } from './baseStats';
import { calculateLevelFromExp } from './experienceCalculations';
import { determineGen3Gender } from './genderDetermination';
import { detectGen3Version } from './versionDetection';
import {
  GEN3_SAVE_SIZE,
  GEN3_SAVE_SLOT_SIZE,
  GEN3_NUM_SAVE_BLOCKS,
  GEN3_SECTION_SIZE,
  GEN3_SECTION_DATA_SIZE,
  GEN3_NUM_PC_BOXES,
  GEN3_POKEMON_PER_BOX,
  GEN3_POKEMON_DATA_SIZE,
  GEN3_POKEMON_PERSONALITY_OFFSET,
  GEN3_POKEMON_OT_ID_OFFSET,
  GEN3_POKEMON_NICKNAME_OFFSET,
  GEN3_POKEMON_OT_NAME_OFFSET,
  GEN3_POKEMON_ENCRYPTED_DATA_OFFSET,
  GEN3_POKEMON_CHECKSUM_OFFSET,
  GEN3_SUBSTRUCT_SIZE,
  GEN3_SUBSTRUCT_ORDERS,
  GEN3_GROWTH_SPECIES_OFFSET,
  GEN3_GROWTH_HELD_ITEM_OFFSET,
  GEN3_GROWTH_EXP_OFFSET,
  GEN3_GROWTH_FRIENDSHIP_OFFSET,
  GEN3_ATTACKS_MOVES_OFFSET,
  GEN3_ATTACKS_PP_OFFSET,
  GEN3_EV_HP_OFFSET,
  GEN3_EV_ATTACK_OFFSET,
  GEN3_EV_DEFENSE_OFFSET,
  GEN3_EV_SPEED_OFFSET,
  GEN3_EV_SPATK_OFFSET,
  GEN3_EV_SPDEF_OFFSET,
  GEN3_MISC_IVS_OFFSET,
  GEN3_IV_MAX,
  GEN3_SHINY_THRESHOLD,
  GEN3_PLAYER_NAME_LENGTH,
  Gen3Section,
  getGen3EncryptionKey,
} from '../constants/gen3';
import {
  readU8,
  readU16LE,
  readU32LE,
  writeU16LE,
  writeU32LE,
  decodeGen3String,
  calculateGen3SectionChecksum,
} from './utils';
import type {
  ParsedSaveFile,
  Box,
  Gen3Pokemon,
  SaveFileMetadata,
  IVs,
  EVs,
  Stats,
  Move,
} from '../types';
import { GameVersion, StatusCondition } from '../types';

/**
 * Parse a Gen 3 save file
 */
export function parseGen3Save(buffer: Uint8Array): ParsedSaveFile {
  // Validate file size
  if (buffer.length !== GEN3_SAVE_SIZE) {
    throw new Error(`Invalid Gen 3 save file size: ${buffer.length} bytes (expected ${GEN3_SAVE_SIZE})`);
  }

  // Gen 3 has two save slots for redundancy - find the most recent one
  const slot0SaveIndex = readU32LE(buffer, 0x0FFC);
  const slot1SaveIndex = readU32LE(buffer, GEN3_SAVE_SLOT_SIZE + 0x0FFC);
  
  // Use >= to give slot 0 precedence when counters are equal (edge case but per pokeemerald spec)
  // Reference: https://github.com/pret/pokeemerald and Bulbapedia Gen 3 save structure
  const activeSaveOffset = slot0SaveIndex >= slot1SaveIndex ? 0 : GEN3_SAVE_SLOT_SIZE;

  // Parse sections
  const sections = parseSections(buffer, activeSaveOffset);

  // Validate section checksums
  validateSections(sections);

  // Parse trainer info from Section 0
  const trainerSection = sections.find(s => s.id === Gen3Section.TRAINER_INFO);
  if (!trainerSection) {
    throw new Error('Trainer info section not found');
  }

  const metadata = parseTrainerInfo(trainerSection.data, buffer);

  // Parse PC boxes from Sections 5-13
  const boxes = parsePCBoxes(sections);

  return {
    metadata,
    boxes,
  };
}

/**
 * Section structure
 */
interface Section {
  id: number;
  checksum: number;
  data: Uint8Array;
  saveIndex: number;
}

/**
 * Parse all sections from a save slot
 */
function parseSections(buffer: Uint8Array, offset: number): Section[] {
  const sections: Section[] = [];

  for (let i = 0; i < GEN3_NUM_SAVE_BLOCKS; i++) {
    const sectionOffset = offset + (i * GEN3_SECTION_SIZE);
    
    // Section footer is at the end
    const footerOffset = sectionOffset + GEN3_SECTION_DATA_SIZE;
    const sectionId = readU16LE(buffer, footerOffset);
    const checksum = readU16LE(buffer, footerOffset + 2);
    const saveIndex = readU32LE(buffer, footerOffset + 8);
    
    // Extract section data
    const data = buffer.slice(sectionOffset, sectionOffset + GEN3_SECTION_DATA_SIZE);
    
    sections.push({
      id: sectionId,
      checksum,
      data,
      saveIndex,
    });
  }

  return sections;
}

/**
 * Validate section checksums and IDs
 */
function validateSections(sections: Section[]): void {
  // First, validate that all section IDs are within valid range (0-13)
  const invalidSections: number[] = [];
  const sectionIds: number[] = [];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section) continue; // Skip if section is undefined
    
    sectionIds.push(section.id);
    
    // Check if section ID is out of range
    if (section.id < 0 || section.id >= GEN3_NUM_SAVE_BLOCKS) {
      invalidSections.push(i);
    }
  }
  
  // If any sections have invalid IDs, throw an error with diagnostic info
  if (invalidSections.length > 0) {
    const invalidList = invalidSections.map(i => {
      const section = sections[i];
      return section ? `position ${i}: ID ${section.id}` : `position ${i}: undefined`;
    }).join(', ');
    throw new Error(
      `Corrupted save file: Found ${invalidSections.length} section(s) with invalid IDs. ` +
      `Invalid sections at ${invalidList}. ` +
      `All section IDs must be in range 0-13. ` +
      `Found IDs: [${sectionIds.join(', ')}]. ` +
      `This save file may be corrupted or from an incompatible game.`
    );
  }
  
  // Verify all required section IDs (0-13) are present
  const expectedIds = Array.from({ length: GEN3_NUM_SAVE_BLOCKS }, (_, i) => i);
  const missingIds = expectedIds.filter(id => !sectionIds.includes(id));
  
  if (missingIds.length > 0) {
    throw new Error(
      `Corrupted save file: Missing required section IDs: [${missingIds.join(', ')}]. ` +
      `Found section IDs: [${sectionIds.join(', ')}]. ` +
      `All sections 0-13 must be present. ` +
      `This save file may be corrupted or from an incompatible game.`
    );
  }
  
  // Check for duplicate section IDs
  const duplicates = sectionIds.filter((id, index) => sectionIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    throw new Error(
      `Corrupted save file: Found duplicate section IDs: [${uniqueDuplicates.join(', ')}]. ` +
      `Each section ID (0-13) must appear exactly once. ` +
      `Found section IDs: [${sectionIds.join(', ')}]. ` +
      `This save file may be corrupted.`
    );
  }
  
  // Now validate checksums (warnings only, as some saves may have checksum issues but still be usable)
  for (const section of sections) {
    const view = new DataView(section.data.buffer, section.data.byteOffset, section.data.byteLength);
    const calculated = calculateGen3SectionChecksum(view, 0, section.data.length);
    if (calculated !== section.checksum) {
      console.warn(`Section ${section.id} checksum mismatch: stored=${section.checksum}, calculated=${calculated}`);
    }
  }
}

/**
 * Parse trainer info from Section 0
 */
function parseTrainerInfo(data: Uint8Array, fullSaveBuffer: Uint8Array): SaveFileMetadata {
  const trainerName = decodeGen3String(data, 0, GEN3_PLAYER_NAME_LENGTH);
  const trainerId = readU16LE(data, 0x0A);
  const secretId = readU16LE(data, 0x0C);
  
  // Detect game version using full save buffer for accurate detection
  const gameVersion = detectGen3Version(fullSaveBuffer);

  return {
    game: gameVersion,
    generation: 3,
    trainerName,
    trainerId,
    secretId,
    playTime: 0,
  };
}

/**
 * Parse PC boxes from sections 5-13
 */
function parsePCBoxes(sections: Section[]): Box[] {
  const boxes: Box[] = [];
  
  // Collect PC buffer sections (5-13)
  const pcSections = sections
    .filter(s => s.id >= Gen3Section.PC_BUFFER_A && s.id <= Gen3Section.PC_BUFFER_I)
    .sort((a, b) => a.id - b.id);

  // Combine all PC data into one buffer
  const pcDataSize = pcSections.reduce((sum, s) => sum + s.data.length, 0);
  const pcData = new Uint8Array(pcDataSize);
  let offset = 0;
  for (const section of pcSections) {
    pcData.set(section.data, offset);
    offset += section.data.length;
  }

  // Parse each box (skip first 4 bytes which is current box number)
  let boxOffset = 4;
  
  for (let i = 0; i < GEN3_NUM_PC_BOXES; i++) {
    const pokemon: (Gen3Pokemon | null)[] = [];
    
    for (let j = 0; j < GEN3_POKEMON_PER_BOX; j++) {
      const pkmnData = pcData.slice(boxOffset, boxOffset + GEN3_POKEMON_DATA_SIZE);
      
      // Check if slot is empty (personality value of 0)
      const personality = readU32LE(pkmnData, GEN3_POKEMON_PERSONALITY_OFFSET);
      
      if (personality === 0) {
        pokemon.push(null);
      } else {
        try {
          const pkmnObj = parseGen3Pokemon(pkmnData);
          pokemon.push(pkmnObj);
        } catch (e) {
          console.error(`Failed to parse Pokémon at box ${i}, slot ${j}:`, e);
          pokemon.push(null);
        }
      }
      
      boxOffset += GEN3_POKEMON_DATA_SIZE;
    }
    
    // Box names are stored after the Pokémon data
    boxes.push({
      name: `Box ${i + 1}`,
      pokemon,
    });
  }

  return boxes;
}

/**
 * Parse a single Gen 3 Pokémon
 */
function parseGen3Pokemon(data: Uint8Array): Gen3Pokemon {
  // Unencrypted data
  const personalityValue = readU32LE(data, GEN3_POKEMON_PERSONALITY_OFFSET);
  const otId = readU32LE(data, GEN3_POKEMON_OT_ID_OFFSET);
  const nickname = decodeGen3String(data, GEN3_POKEMON_NICKNAME_OFFSET, 10);
  const ot = decodeGen3String(data, GEN3_POKEMON_OT_NAME_OFFSET, GEN3_PLAYER_NAME_LENGTH);
  
  // Decrypt the encrypted data section
  const encryptedData = data.slice(GEN3_POKEMON_ENCRYPTED_DATA_OFFSET, GEN3_POKEMON_ENCRYPTED_DATA_OFFSET + 48);
  const decryptedData = decryptPokemonData(encryptedData, personalityValue, otId);
  
  // Determine substructure order
  const order = GEN3_SUBSTRUCT_ORDERS[personalityValue % 24];
  
  // Parse each substructure
  const growth = decryptedData.slice(order[0] * GEN3_SUBSTRUCT_SIZE, (order[0] + 1) * GEN3_SUBSTRUCT_SIZE);
  const attacks = decryptedData.slice(order[1] * GEN3_SUBSTRUCT_SIZE, (order[1] + 1) * GEN3_SUBSTRUCT_SIZE);
  const evCondition = decryptedData.slice(order[2] * GEN3_SUBSTRUCT_SIZE, (order[2] + 1) * GEN3_SUBSTRUCT_SIZE);
  const misc = decryptedData.slice(order[3] * GEN3_SUBSTRUCT_SIZE, (order[3] + 1) * GEN3_SUBSTRUCT_SIZE);
  
  // Parse growth substructure
  const species = readU16LE(growth, GEN3_GROWTH_SPECIES_OFFSET);
  const heldItem = readU16LE(growth, GEN3_GROWTH_HELD_ITEM_OFFSET);
  const exp = readU32LE(growth, GEN3_GROWTH_EXP_OFFSET);
  const friendship = readU8(growth, GEN3_GROWTH_FRIENDSHIP_OFFSET);
  
  // Parse attacks substructure
  const moves: Move[] = [];
  for (let i = 0; i < 4; i++) {
    const moveId = readU16LE(attacks, GEN3_ATTACKS_MOVES_OFFSET + (i * 2));
    const pp = readU8(attacks, GEN3_ATTACKS_PP_OFFSET + i);
    
    if (moveId > 0) {
      moves.push({
        id: moveId,
        pp: pp,
        ppUps: 0, // Would need to calculate from max PP
      });
    }
  }
  
  // Parse EVs
  const evs: EVs = {
    hp: readU8(evCondition, GEN3_EV_HP_OFFSET),
    attack: readU8(evCondition, GEN3_EV_ATTACK_OFFSET),
    defense: readU8(evCondition, GEN3_EV_DEFENSE_OFFSET),
    speed: readU8(evCondition, GEN3_EV_SPEED_OFFSET),
    specialAttack: readU8(evCondition, GEN3_EV_SPATK_OFFSET),
    specialDefense: readU8(evCondition, GEN3_EV_SPDEF_OFFSET),
  };
  
  // Parse IVs from misc substructure (packed in 32 bits)
  const ivData = readU32LE(misc, GEN3_MISC_IVS_OFFSET);
  const ivs: IVs = extractGen3IVs(ivData);
  const isEgg = (ivData & 0x40000000) !== 0;
  const abilityBit = (ivData & 0x80000000) !== 0;
  
  // Calculate level from experience
  const level = calculateLevelFromExp(species, exp);
  
  // Determine nature
  const nature = personalityValue % 25;
  
  // Calculate stats with nature modifiers
  const stats = calculateGen3Stats(species, level, ivs, evs, nature);
  
  // Determine gender using proper species-specific ratios
  const gender = determineGen3Gender(species, personalityValue);
  
  // Determine if shiny
  const shiny = isGen3Shiny(personalityValue, otId);
  
  // Extract trainer IDs
  const trainerId = otId & 0xFFFF;
  const secretId = (otId >> 16) & 0xFFFF;
  
  return {
    species,
    level,
    nickname,
    ot,
    otId: trainerId,
    otSecretId: secretId,
    exp,
    friendship,
    moves,
    ivs,
    evs,
    personalityValue,
    nature,
    ability: abilityBit ? 1 : 0,
    gender,
    shiny,
    ball: 0, // Would parse from misc
    statusCondition: StatusCondition.NONE,
    currentHP: stats.hp,
    stats,
  };
}

/**
 * Decrypt Gen 3 Pokémon data
 */
function decryptPokemonData(encrypted: Uint8Array, personality: number, otId: number): Uint8Array {
  const key = getGen3EncryptionKey(personality, otId);
  const decrypted = new Uint8Array(encrypted.length);
  
  for (let i = 0; i < encrypted.length; i += 4) {
    const encryptedWord = readU32LE(encrypted, i);
    const decryptedWord = encryptedWord ^ key;
    writeU32LE(decrypted, i, decryptedWord);
  }
  
  return decrypted;
}

/**
 * Extract IVs from packed 32-bit value
 */
function extractGen3IVs(packed: number): IVs {
  return {
    hp: packed & 0x1F,
    attack: (packed >> 5) & 0x1F,
    defense: (packed >> 10) & 0x1F,
    speed: (packed >> 15) & 0x1F,
    specialAttack: (packed >> 20) & 0x1F,
    specialDefense: (packed >> 25) & 0x1F,
  };
}

/**
 * Check if Gen 3 Pokémon is shiny
 */
function isGen3Shiny(personality: number, otId: number): boolean {
  const pidUpper = (personality >> 16) & 0xFFFF;
  const pidLower = personality & 0xFFFF;
  const tid = otId & 0xFFFF;
  const sid = (otId >> 16) & 0xFFFF;
  
  const xor = pidUpper ^ pidLower ^ tid ^ sid;
  
  return xor < GEN3_SHINY_THRESHOLD;
}

// determineGen3Gender is now imported from genderDetermination.ts

// calculateLevelFromExp is now imported from experienceCalculations.ts

/**
 * Calculate Gen 3 stats with nature modifiers
 */
function calculateGen3Stats(species: number, level: number, ivs: IVs, evs: EVs, nature: number): Stats {
  const baseStats = getBaseStats(species);
  
  // Calculate base stats before nature
  const hp = calcGen3HP(baseStats.hp, ivs.hp, evs.hp, level);
  const attack = calcGen3Stat(baseStats.attack, ivs.attack, evs.attack, level);
  const defense = calcGen3Stat(baseStats.defense, ivs.defense, evs.defense, level);
  const speed = calcGen3Stat(baseStats.speed, ivs.speed, evs.speed, level);
  const specialAttack = calcGen3Stat(baseStats.specialAttack, ivs.specialAttack, evs.specialAttack, level);
  const specialDefense = calcGen3Stat(baseStats.specialDefense, ivs.specialDefense, evs.specialDefense, level);
  
  // Apply nature modifiers (HP is never affected by nature)
  return {
    hp,
    attack: applyNatureModifier(attack, nature, 'attack'),
    defense: applyNatureModifier(defense, nature, 'defense'),
    speed: applyNatureModifier(speed, nature, 'speed'),
    specialAttack: applyNatureModifier(specialAttack, nature, 'specialAttack'),
    specialDefense: applyNatureModifier(specialDefense, nature, 'specialDefense'),
  };
}
