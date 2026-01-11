/**
 * Gen 3 save file injection logic
 * Injects Pokémon back into Gen 3 save files with proper encryption and checksums
 */

import type { Gen3Pokemon } from '../types';
import {
  GEN3_SAVE_SIZE,
  GEN3_SAVE_SLOT_SIZE,
  GEN3_NUM_SAVE_BLOCKS,
  GEN3_SECTION_SIZE,
  GEN3_SECTION_DATA_SIZE,
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
  Gen3Section,
  getGen3EncryptionKey,
} from '../constants/gen3';
import {
  readU8,
  readU16LE,
  readU32LE,
  writeU8,
  writeU16LE,
  writeU32LE,
  encodeGen3String,
  calculateGen3SectionChecksum,
} from '../parsers/utils';

/**
 * Inject a Pokémon into a Gen 3 save file at a specific box and slot
 */
export function injectPokemonIntoGen3Save(
  saveData: Uint8Array,
  pokemon: Gen3Pokemon,
  boxNumber: number,
  slotNumber: number
): Uint8Array {
  // Validate inputs
  if (saveData.length !== GEN3_SAVE_SIZE) {
    throw new Error(`Invalid save file size: ${saveData.length} bytes (expected ${GEN3_SAVE_SIZE})`);
  }
  
  if (boxNumber < 0 || boxNumber >= 14) {
    throw new Error(`Invalid box number: ${boxNumber} (must be 0-13)`);
  }
  
  if (slotNumber < 0 || slotNumber >= 30) {
    throw new Error(`Invalid slot number: ${slotNumber} (must be 0-29)`);
  }
  
  // Clone save data to avoid mutation
  const newSaveData = new Uint8Array(saveData);
  
  // Find active save slot
  const slot0SaveIndex = readU32LE(newSaveData, 0x0FFC);
  const slot1SaveIndex = readU32LE(newSaveData, GEN3_SAVE_SLOT_SIZE + 0x0FFC);
  const activeSaveOffset = slot0SaveIndex > slot1SaveIndex ? 0 : GEN3_SAVE_SLOT_SIZE;
  
  // Serialize Pokémon data
  const pokemonData = serializeGen3Pokemon(pokemon);
  
  // Calculate offset in PC buffer
  // Each box holds 30 Pokémon, box data starts at offset 4 in PC sections
  const pokemonIndex = boxNumber * 30 + slotNumber;
  const pcOffset = 4 + (pokemonIndex * GEN3_POKEMON_DATA_SIZE);
  
  // Find which PC section this falls into
  const pcSectionIndex = Math.floor(pcOffset / GEN3_SECTION_DATA_SIZE);
  const offsetInSection = pcOffset % GEN3_SECTION_DATA_SIZE;
  
  // PC sections start at section ID 5
  const sectionId = Gen3Section.PC_BUFFER_A + pcSectionIndex;
  
  // Find the section in the save
  const sectionOffset = findSectionOffset(newSaveData, activeSaveOffset, sectionId);
  
  if (sectionOffset === -1) {
    throw new Error(`Could not find section ${sectionId} in save file`);
  }
  
  // Write Pokémon data to section
  newSaveData.set(pokemonData, sectionOffset + offsetInSection);
  
  // Recalculate and update section checksum
  const sectionDataStart = sectionOffset;
  const sectionDataEnd = sectionOffset + GEN3_SECTION_DATA_SIZE;
  const sectionData = newSaveData.slice(sectionDataStart, sectionDataEnd);
  
  const newChecksum = calculateGen3SectionChecksum(sectionData, 0, sectionData.length);
  writeU16LE(newSaveData, sectionOffset + GEN3_SECTION_DATA_SIZE + 2, newChecksum);
  
  // Increment save index for the updated slot
  const saveIndexOffset = activeSaveOffset + (GEN3_NUM_SAVE_BLOCKS * GEN3_SECTION_SIZE) - 4;
  const currentSaveIndex = readU32LE(newSaveData, saveIndexOffset);
  writeU32LE(newSaveData, saveIndexOffset, currentSaveIndex + 1);
  
  return newSaveData;
}

/**
 * Find a section by ID in the save
 */
function findSectionOffset(saveData: Uint8Array, saveSlotOffset: number, sectionId: number): number {
  for (let i = 0; i < GEN3_NUM_SAVE_BLOCKS; i++) {
    const sectionOffset = saveSlotOffset + (i * GEN3_SECTION_SIZE);
    const footerOffset = sectionOffset + GEN3_SECTION_DATA_SIZE;
    const id = readU16LE(saveData, footerOffset);
    
    if (id === sectionId) {
      return sectionOffset;
    }
  }
  
  return -1;
}

/**
 * Serialize a Gen 3 Pokémon to binary format
 */
export function serializeGen3Pokemon(pokemon: Gen3Pokemon): Uint8Array {
  const data = new Uint8Array(GEN3_POKEMON_DATA_SIZE);
  data.fill(0);
  
  // Write unencrypted data
  writeU32LE(data, GEN3_POKEMON_PERSONALITY_OFFSET, pokemon.personalityValue);
  
  // Combine trainer ID and secret ID into 32-bit OT ID
  const fullOtId = (pokemon.otId & 0xFFFF) | ((pokemon.otSecretId || 0) << 16);
  writeU32LE(data, GEN3_POKEMON_OT_ID_OFFSET, fullOtId);
  
  // Write nickname
  const nicknameData = encodeGen3String(pokemon.nickname, 10);
  data.set(nicknameData, GEN3_POKEMON_NICKNAME_OFFSET);
  
  // Write OT name
  const otData = encodeGen3String(pokemon.ot, 8);
  data.set(otData, GEN3_POKEMON_OT_NAME_OFFSET);
  
  // Create decrypted substructures
  const decryptedData = new Uint8Array(48);
  
  // Determine substructure order
  const order = GEN3_SUBSTRUCT_ORDERS[pokemon.personalityValue % 24];
  
  // Create growth substructure
  const growth = new Uint8Array(GEN3_SUBSTRUCT_SIZE);
  writeU16LE(growth, GEN3_GROWTH_SPECIES_OFFSET, pokemon.species);
  writeU16LE(growth, GEN3_GROWTH_HELD_ITEM_OFFSET, 0); // No held item for now
  writeU32LE(growth, GEN3_GROWTH_EXP_OFFSET, pokemon.exp);
  writeU8(growth, GEN3_GROWTH_FRIENDSHIP_OFFSET, pokemon.friendship || 70);
  
  // Create attacks substructure
  const attacks = new Uint8Array(GEN3_SUBSTRUCT_SIZE);
  for (let i = 0; i < 4; i++) {
    if (i < pokemon.moves.length) {
      writeU16LE(attacks, GEN3_ATTACKS_MOVES_OFFSET + (i * 2), pokemon.moves[i].id);
      writeU8(attacks, GEN3_ATTACKS_PP_OFFSET + i, pokemon.moves[i].pp);
    }
  }
  
  // Create EVs & Condition substructure
  const evCondition = new Uint8Array(GEN3_SUBSTRUCT_SIZE);
  writeU8(evCondition, GEN3_EV_HP_OFFSET, pokemon.evs.hp || 0);
  writeU8(evCondition, GEN3_EV_ATTACK_OFFSET, pokemon.evs.attack || 0);
  writeU8(evCondition, GEN3_EV_DEFENSE_OFFSET, pokemon.evs.defense || 0);
  writeU8(evCondition, GEN3_EV_SPEED_OFFSET, pokemon.evs.speed || 0);
  writeU8(evCondition, GEN3_EV_SPATK_OFFSET, pokemon.evs.specialAttack || 0);
  writeU8(evCondition, GEN3_EV_SPDEF_OFFSET, pokemon.evs.specialDefense || 0);
  
  // Create misc substructure
  const misc = new Uint8Array(GEN3_SUBSTRUCT_SIZE);
  
  // Pack IVs into 32 bits
  const ivData = packGen3IVs(pokemon.ivs, pokemon.ability || 0);
  writeU32LE(misc, GEN3_MISC_IVS_OFFSET, ivData);
  
  // Place substructures in correct order
  decryptedData.set(growth, order.indexOf(0) * GEN3_SUBSTRUCT_SIZE);
  decryptedData.set(attacks, order.indexOf(1) * GEN3_SUBSTRUCT_SIZE);
  decryptedData.set(evCondition, order.indexOf(2) * GEN3_SUBSTRUCT_SIZE);
  decryptedData.set(misc, order.indexOf(3) * GEN3_SUBSTRUCT_SIZE);
  
  // Calculate checksum of decrypted data
  const checksum = calculatePokemonChecksum(decryptedData);
  writeU16LE(data, GEN3_POKEMON_CHECKSUM_OFFSET, checksum);
  
  // Encrypt the data
  const encryptedData = encryptPokemonData(decryptedData, pokemon.personalityValue, fullOtId);
  data.set(encryptedData, GEN3_POKEMON_ENCRYPTED_DATA_OFFSET);
  
  return data;
}

/**
 * Pack IVs into 32-bit value
 */
function packGen3IVs(ivs: { hp: number; attack: number; defense: number; speed: number; specialAttack: number; specialDefense: number }, ability: number): number {
  let packed = 0;
  
  packed |= (ivs.hp & 0x1F);
  packed |= (ivs.attack & 0x1F) << 5;
  packed |= (ivs.defense & 0x1F) << 10;
  packed |= (ivs.speed & 0x1F) << 15;
  packed |= (ivs.specialAttack & 0x1F) << 20;
  packed |= (ivs.specialDefense & 0x1F) << 25;
  
  // Ability bit
  if (ability === 1) {
    packed |= 0x80000000;
  }
  
  return packed >>> 0;
}

/**
 * Calculate checksum for Pokémon data
 */
function calculatePokemonChecksum(data: Uint8Array): number {
  let checksum = 0;
  
  for (let i = 0; i < data.length; i += 2) {
    checksum += readU16LE(data, i);
  }
  
  return checksum & 0xFFFF;
}

/**
 * Encrypt Pokémon data
 */
function encryptPokemonData(decrypted: Uint8Array, personality: number, otId: number): Uint8Array {
  const key = getGen3EncryptionKey(personality, otId);
  const encrypted = new Uint8Array(decrypted.length);
  
  for (let i = 0; i < decrypted.length; i += 4) {
    const decryptedWord = readU32LE(decrypted, i);
    const encryptedWord = decryptedWord ^ key;
    writeU32LE(encrypted, i, encryptedWord);
  }
  
  return encrypted;
}

/**
 * Inject multiple Pokémon into a Gen 3 save file
 */
export function injectMultiplePokemon(
  saveData: Uint8Array,
  pokemonList: Array<{ pokemon: Gen3Pokemon; box: number; slot: number }>
): Uint8Array {
  let currentSaveData = saveData;
  
  for (const { pokemon, box, slot } of pokemonList) {
    currentSaveData = injectPokemonIntoGen3Save(currentSaveData, pokemon, box, slot);
  }
  
  return currentSaveData;
}
