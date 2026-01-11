/**
 * Gen 1 (Red/Blue/Yellow) save file parser
 * Based on: https://github.com/pret/pokered
 */

import {
  GEN1_SAVE_SIZE,
  GEN1_CHECKSUM_OFFSET,
  GEN1_PLAYER_NAME_OFFSET,
  GEN1_PLAYER_NAME_LENGTH,
  GEN1_PLAYER_ID_OFFSET,
  GEN1_CURRENT_BOX_OFFSET,
  GEN1_NUM_BOXES,
  GEN1_POKEMON_PER_BOX,
  GEN1_CURRENT_BOX_DATA_OFFSET,
  GEN1_BOX_1_6_OFFSET,
  GEN1_BOX_7_12_OFFSET,
  GEN1_BOX_SIZE,
  GEN1_POKEMON_BOX_DATA_SIZE,
  GEN1_SPECIES_OFFSET,
  GEN1_CURRENT_HP_OFFSET,
  GEN1_LEVEL_OFFSET,
  GEN1_OT_ID_OFFSET,
  GEN1_EXP_OFFSET,
  GEN1_HP_EV_OFFSET,
  GEN1_ATTACK_EV_OFFSET,
  GEN1_DEFENSE_EV_OFFSET,
  GEN1_SPEED_EV_OFFSET,
  GEN1_SPECIAL_EV_OFFSET,
  GEN1_DV_OFFSET,
  GEN1_PP_OFFSET,
  GEN1_MOVES_OFFSET,
  GEN1_OT_NAME_LENGTH,
  GEN1_NICKNAME_LENGTH,
} from '../constants/gen1';
import {
  readU8,
  readU16LE,
  readU24LE,
  decodeGen12String,
  calculateGen12Checksum,
} from './utils';
import type {
  ParsedSaveFile,
  Box,
  Gen12Pokemon,
  GameVersion,
  SaveFileMetadata,
  DVs,
  EVs,
  Stats,
  Move,
  StatusCondition,
} from '../types';

/**
 * Parse a Gen 1 save file
 */
export function parseGen1Save(buffer: Uint8Array): ParsedSaveFile {
  // Validate file size
  if (buffer.length !== GEN1_SAVE_SIZE) {
    throw new Error(`Invalid Gen 1 save file size: ${buffer.length} bytes (expected ${GEN1_SAVE_SIZE})`);
  }

  // Validate checksum
  const storedChecksum = readU8(buffer, GEN1_CHECKSUM_OFFSET);
  const calculatedChecksum = calculateGen12Checksum(buffer, 0x2598, 0xD8A);
  
  if (storedChecksum !== calculatedChecksum) {
    console.warn(`Gen 1 checksum mismatch: stored=${storedChecksum}, calculated=${calculatedChecksum}`);
  }

  // Parse trainer data
  const trainerName = decodeGen12String(buffer, GEN1_PLAYER_NAME_OFFSET, GEN1_PLAYER_NAME_LENGTH);
  const trainerId = readU16LE(buffer, GEN1_PLAYER_ID_OFFSET);

  // Determine game version (would need more heuristics in a real implementation)
  const gameVersion = detectGen1Version(buffer);

  const metadata: SaveFileMetadata = {
    game: gameVersion,
    generation: 1,
    trainerName,
    trainerId,
    playTime: 0, // Gen 1 play time is stored but not critical for this implementation
    checksum: storedChecksum,
  };

  // Parse boxes
  const currentBoxNum = readU8(buffer, GEN1_CURRENT_BOX_OFFSET);
  const boxes: Box[] = [];

  for (let i = 0; i < GEN1_NUM_BOXES; i++) {
    const box = parseGen1Box(buffer, i, i === currentBoxNum);
    boxes.push(box);
  }

  return {
    metadata,
    boxes,
  };
}

/**
 * Detect Gen 1 game version (simplified - would need more logic)
 */
function detectGen1Version(buffer: Uint8Array): GameVersion {
  // This is a simplified version - a real implementation would check specific bytes
  // that differ between Red/Blue/Yellow
  return GameVersion.RED; // Default to Red
}

/**
 * Parse a single box from Gen 1 save
 */
function parseGen1Box(buffer: Uint8Array, boxNum: number, isCurrent: boolean): Box {
  let boxOffset: number;

  if (isCurrent) {
    // Current box is stored at a different location
    boxOffset = GEN1_CURRENT_BOX_DATA_OFFSET;
  } else if (boxNum < 6) {
    // Boxes 0-5 are in SRAM bank 1
    boxOffset = GEN1_BOX_1_6_OFFSET + (boxNum * GEN1_BOX_SIZE);
  } else {
    // Boxes 6-11 are in SRAM bank 2
    boxOffset = GEN1_BOX_7_12_OFFSET + ((boxNum - 6) * GEN1_BOX_SIZE);
  }

  // First byte is the count of Pokémon in the box
  const count = readU8(buffer, boxOffset);
  const pokemon: (Gen12Pokemon | null)[] = [];

  // Parse Pokémon data
  const pokemonListOffset = boxOffset + 1;
  const otNameOffset = pokemonListOffset + (GEN1_POKEMON_PER_BOX + 1) * GEN1_POKEMON_BOX_DATA_SIZE;
  const nicknameOffset = otNameOffset + (GEN1_POKEMON_PER_BOX * GEN1_OT_NAME_LENGTH);

  for (let i = 0; i < GEN1_POKEMON_PER_BOX; i++) {
    if (i < count) {
      const pkmnOffset = pokemonListOffset + (i * GEN1_POKEMON_BOX_DATA_SIZE);
      const pkmnData = parseGen1Pokemon(
        buffer,
        pkmnOffset,
        otNameOffset + (i * GEN1_OT_NAME_LENGTH),
        nicknameOffset + (i * GEN1_NICKNAME_LENGTH)
      );
      pokemon.push(pkmnData);
    } else {
      pokemon.push(null);
    }
  }

  return {
    name: `Box ${boxNum + 1}`,
    pokemon,
  };
}

/**
 * Parse a single Pokémon from Gen 1 box data
 */
function parseGen1Pokemon(
  buffer: Uint8Array,
  dataOffset: number,
  otOffset: number,
  nicknameOffset: number
): Gen12Pokemon {
  // Basic data
  const species = readU8(buffer, dataOffset + GEN1_SPECIES_OFFSET);
  const currentHP = readU16LE(buffer, dataOffset + GEN1_CURRENT_HP_OFFSET);
  const level = readU8(buffer, dataOffset + GEN1_LEVEL_OFFSET);
  
  // Trainer data
  const otId = readU16LE(buffer, dataOffset + GEN1_OT_ID_OFFSET);
  const ot = decodeGen12String(buffer, otOffset, GEN1_OT_NAME_LENGTH);
  const nickname = decodeGen12String(buffer, nicknameOffset, GEN1_NICKNAME_LENGTH);
  
  // Experience
  const exp = readU24LE(buffer, dataOffset + GEN1_EXP_OFFSET);
  
  // EVs (called "Stat Experience" in Gen 1)
  const evs: EVs = {
    hp: readU16LE(buffer, dataOffset + GEN1_HP_EV_OFFSET),
    attack: readU16LE(buffer, dataOffset + GEN1_ATTACK_EV_OFFSET),
    defense: readU16LE(buffer, dataOffset + GEN1_DEFENSE_EV_OFFSET),
    speed: readU16LE(buffer, dataOffset + GEN1_SPEED_EV_OFFSET),
    special: readU16LE(buffer, dataOffset + GEN1_SPECIAL_EV_OFFSET),
  };
  
  // DVs (packed in 2 bytes)
  const dvBytes = readU16LE(buffer, dataOffset + GEN1_DV_OFFSET);
  const dvs: DVs = extractGen1DVs(dvBytes);
  
  // Moves
  const moves: Move[] = [];
  for (let i = 0; i < 4; i++) {
    const moveId = readU8(buffer, dataOffset + GEN1_MOVES_OFFSET + i);
    const pp = readU8(buffer, dataOffset + GEN1_PP_OFFSET + i);
    
    if (moveId > 0) {
      moves.push({
        id: moveId,
        pp: pp & 0x3F, // Lower 6 bits are current PP
        ppUps: pp >> 6, // Upper 2 bits are PP Ups
      });
    }
  }
  
  // Calculate stats
  const stats = calculateGen1Stats(species, level, dvs, evs);
  
  // Determine if shiny (for future conversion to Gen 2/3)
  const shiny = isGen1ShinyDVs(dvs);
  
  return {
    species,
    level,
    nickname,
    ot,
    otId,
    exp,
    moves,
    dvs,
    evs,
    gender: determineGen1Gender(species, dvs),
    shiny,
    statusCondition: StatusCondition.NONE, // Gen 1 status is stored separately
    currentHP,
    stats,
  };
}

/**
 * Extract DVs from packed 16-bit value
 * Format: AAAABBBBCCCCDDDD
 * A = Attack DV, B = Defense DV, C = Speed DV, D = Special DV
 */
function extractGen1DVs(packed: number): DVs {
  const attack = (packed >> 12) & 0xF;
  const defense = (packed >> 8) & 0xF;
  const speed = (packed >> 4) & 0xF;
  const special = packed & 0xF;
  
  // HP DV is calculated from other DVs
  const hp = ((attack & 1) << 3) | ((defense & 1) << 2) | ((speed & 1) << 1) | (special & 1);
  
  return {
    hp,
    attack,
    defense,
    speed,
    special,
  };
}

/**
 * Check if DVs would result in a shiny Pokémon in Gen 2
 * Gen 1 has no shinies, but DVs determine shininess when transferred to Gen 2
 */
function isGen1ShinyDVs(dvs: DVs): boolean {
  return (
    dvs.defense === 10 &&
    dvs.speed === 10 &&
    dvs.special === 10 &&
    [2, 3, 6, 7, 10, 11, 14, 15].includes(dvs.attack)
  );
}

/**
 * Determine gender from DVs (Gen 1 has no gender, but it's determined by Attack DV in Gen 2)
 */
function determineGen1Gender(species: number, dvs: DVs): 'M' | 'F' | 'U' {
  // This is a simplified version - would need species-specific gender ratios
  // For now, use genderless
  return 'U';
}

/**
 * Calculate stats for Gen 1 Pokémon
 * Gen 1 uses the formula: ((Base + DV) * 2 + √EV / 4) * Level / 100 + Level + 5 (for HP)
 */
function calculateGen1Stats(species: number, level: number, dvs: DVs, evs: EVs): Stats {
  // This is a placeholder - real implementation would need base stats lookup
  // For now, return dummy values
  return {
    hp: 100,
    attack: 50,
    defense: 50,
    speed: 50,
    special: 50,
  };
}
