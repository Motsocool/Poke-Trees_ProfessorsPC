/**
 * Gen 2 (Gold/Silver/Crystal) save file parser
 * Based on: https://github.com/pret/pokecrystal
 */

import {
  GEN2_SAVE_SIZE,
  GEN2_CHECKSUM_OFFSET,
  GEN2_PLAYER_NAME_OFFSET,
  GEN2_PLAYER_NAME_LENGTH,
  GEN2_PLAYER_ID_OFFSET,
  GEN2_CURRENT_BOX_OFFSET,
  GEN2_NUM_BOXES,
  GEN2_POKEMON_PER_BOX,
  GEN2_CURRENT_BOX_DATA_OFFSET,
  GEN2_BOX_1_7_OFFSET,
  GEN2_BOX_8_14_OFFSET,
  GEN2_BOX_SIZE,
  GEN2_POKEMON_BOX_DATA_SIZE,
  GEN2_SPECIES_OFFSET,
  GEN2_HELD_ITEM_OFFSET,
  GEN2_MOVES_OFFSET,
  GEN2_OT_ID_OFFSET,
  GEN2_EXP_OFFSET,
  GEN2_HP_EV_OFFSET,
  GEN2_ATTACK_EV_OFFSET,
  GEN2_DEFENSE_EV_OFFSET,
  GEN2_SPEED_EV_OFFSET,
  GEN2_SPECIAL_EV_OFFSET,
  GEN2_DV_OFFSET,
  GEN2_PP_OFFSET,
  GEN2_FRIENDSHIP_OFFSET,
  GEN2_LEVEL_OFFSET,
  GEN2_OT_NAME_LENGTH,
  GEN2_NICKNAME_LENGTH,
  GEN2_SHINY_DEFENSE_DV,
  GEN2_SHINY_SPEED_DV,
  GEN2_SHINY_SPECIAL_DV,
  GEN2_SHINY_ATTACK_DVS,
  GEN2_GENDER_THRESHOLD,
} from '../constants/gen2';
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
  SaveFileMetadata,
  DVs,
  EVs,
  Stats,
  Move,
} from '../types';
import { GameVersion, StatusCondition } from '../types';

/**
 * Parse a Gen 2 save file
 */
export function parseGen2Save(buffer: Uint8Array): ParsedSaveFile {
  // Validate file size
  if (buffer.length !== GEN2_SAVE_SIZE) {
    throw new Error(`Invalid Gen 2 save file size: ${buffer.length} bytes (expected ${GEN2_SAVE_SIZE})`);
  }

  // Validate checksum
  const storedChecksum = readU16LE(buffer, GEN2_CHECKSUM_OFFSET);
  const calculatedChecksum = calculateGen2Checksum(buffer);
  
  if (storedChecksum !== calculatedChecksum) {
    console.warn(`Gen 2 checksum mismatch: stored=${storedChecksum}, calculated=${calculatedChecksum}`);
  }

  // Parse trainer data
  const trainerName = decodeGen12String(buffer, GEN2_PLAYER_NAME_OFFSET, GEN2_PLAYER_NAME_LENGTH);
  const trainerId = readU16LE(buffer, GEN2_PLAYER_ID_OFFSET);

  // Determine game version
  const gameVersion = detectGen2Version(buffer);

  const metadata: SaveFileMetadata = {
    game: gameVersion,
    generation: 2,
    trainerName,
    trainerId,
    playTime: 0,
    checksum: storedChecksum,
  };

  // Parse boxes
  const currentBoxNum = readU8(buffer, GEN2_CURRENT_BOX_OFFSET);
  const boxes: Box[] = [];

  for (let i = 0; i < GEN2_NUM_BOXES; i++) {
    const box = parseGen2Box(buffer, i, i === currentBoxNum);
    boxes.push(box);
  }

  return {
    metadata,
    boxes,
  };
}

/**
 * Calculate Gen 2 checksum
 */
function calculateGen2Checksum(buffer: Uint8Array): number {
  // Gen 2 checksum is sum of all bytes from 0x2009 to 0x2D68
  return calculateGen12Checksum(buffer, 0x2009, 0x0D60);
}

/**
 * Detect Gen 2 game version
 */
function detectGen2Version(buffer: Uint8Array): GameVersion {
  // Simplified - would check specific bytes for Gold/Silver/Crystal
  return GameVersion.CRYSTAL;
}

/**
 * Parse a single box from Gen 2 save
 */
function parseGen2Box(buffer: Uint8Array, boxNum: number, isCurrent: boolean): Box {
  let boxOffset: number;

  if (isCurrent) {
    boxOffset = GEN2_CURRENT_BOX_DATA_OFFSET;
  } else if (boxNum < 7) {
    // Boxes 0-6 are in SRAM bank 1
    boxOffset = GEN2_BOX_1_7_OFFSET + (boxNum * GEN2_BOX_SIZE);
  } else {
    // Boxes 7-13 are in SRAM bank 2
    boxOffset = GEN2_BOX_8_14_OFFSET + ((boxNum - 7) * GEN2_BOX_SIZE);
  }

  // First byte is the count of Pokémon in the box
  const count = readU8(buffer, boxOffset);
  const pokemon: (Gen12Pokemon | null)[] = [];

  // Parse Pokémon data
  const pokemonListOffset = boxOffset + 1;
  const otNameOffset = pokemonListOffset + (GEN2_POKEMON_PER_BOX + 1) * GEN2_POKEMON_BOX_DATA_SIZE;
  const nicknameOffset = otNameOffset + (GEN2_POKEMON_PER_BOX * GEN2_OT_NAME_LENGTH);

  for (let i = 0; i < GEN2_POKEMON_PER_BOX; i++) {
    if (i < count) {
      const pkmnOffset = pokemonListOffset + (i * GEN2_POKEMON_BOX_DATA_SIZE);
      const pkmnData = parseGen2Pokemon(
        buffer,
        pkmnOffset,
        otNameOffset + (i * GEN2_OT_NAME_LENGTH),
        nicknameOffset + (i * GEN2_NICKNAME_LENGTH)
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
 * Parse a single Pokémon from Gen 2 box data
 */
function parseGen2Pokemon(
  buffer: Uint8Array,
  dataOffset: number,
  otOffset: number,
  nicknameOffset: number
): Gen12Pokemon {
  // Basic data
  const species = readU8(buffer, dataOffset + GEN2_SPECIES_OFFSET);
  const level = readU8(buffer, dataOffset + GEN2_LEVEL_OFFSET);
  
  // Trainer data
  const otId = readU16LE(buffer, dataOffset + GEN2_OT_ID_OFFSET);
  const ot = decodeGen12String(buffer, otOffset, GEN2_OT_NAME_LENGTH);
  const nickname = decodeGen12String(buffer, nicknameOffset, GEN2_NICKNAME_LENGTH);
  
  // Experience
  const exp = readU24LE(buffer, dataOffset + GEN2_EXP_OFFSET);
  
  // Friendship (new in Gen 2)
  const friendship = readU8(buffer, dataOffset + GEN2_FRIENDSHIP_OFFSET);
  
  // EVs
  const evs: EVs = {
    hp: readU16LE(buffer, dataOffset + GEN2_HP_EV_OFFSET),
    attack: readU16LE(buffer, dataOffset + GEN2_ATTACK_EV_OFFSET),
    defense: readU16LE(buffer, dataOffset + GEN2_DEFENSE_EV_OFFSET),
    speed: readU16LE(buffer, dataOffset + GEN2_SPEED_EV_OFFSET),
    special: readU16LE(buffer, dataOffset + GEN2_SPECIAL_EV_OFFSET),
  };
  
  // DVs (packed in 2 bytes)
  const dvBytes = readU16LE(buffer, dataOffset + GEN2_DV_OFFSET);
  const dvs: DVs = extractGen2DVs(dvBytes);
  
  // Moves
  const moves: Move[] = [];
  for (let i = 0; i < 4; i++) {
    const moveId = readU8(buffer, dataOffset + GEN2_MOVES_OFFSET + i);
    const pp = readU8(buffer, dataOffset + GEN2_PP_OFFSET + i);
    
    if (moveId > 0) {
      moves.push({
        id: moveId,
        pp: pp & 0x3F,
        ppUps: pp >> 6,
      });
    }
  }
  
  // Calculate stats
  const stats = calculateGen2Stats(species, level, dvs, evs);
  
  // Determine if shiny (Gen 2 has shiny Pokémon!)
  const shiny = isGen2Shiny(dvs);
  
  // Determine gender (new in Gen 2)
  const gender = determineGen2Gender(species, dvs);
  
  return {
    species,
    level,
    nickname,
    ot,
    otId,
    exp,
    friendship,
    moves,
    dvs,
    evs,
    gender,
    shiny,
    statusCondition: StatusCondition.NONE,
    currentHP: stats.hp, // Would need to parse actual current HP
    stats,
  };
}

/**
 * Extract DVs from packed 16-bit value (same as Gen 1)
 */
function extractGen2DVs(packed: number): DVs {
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
 * Check if DVs result in a shiny Pokémon in Gen 2
 */
function isGen2Shiny(dvs: DVs): boolean {
  return (
    dvs.defense === GEN2_SHINY_DEFENSE_DV &&
    dvs.speed === GEN2_SHINY_SPEED_DV &&
    dvs.special === GEN2_SHINY_SPECIAL_DV &&
    GEN2_SHINY_ATTACK_DVS.includes(dvs.attack)
  );
}

/**
 * Determine gender from Attack DV (Gen 2 introduced gender)
 */
function determineGen2Gender(species: number, dvs: DVs): 'M' | 'F' | 'U' {
  // This is simplified - would need species-specific gender ratios
  // Gender is determined by comparing Attack DV to species gender threshold
  
  // For now, use a simple heuristic
  if (dvs.attack >= 8) {
    return 'M';
  } else if (dvs.attack < 8) {
    return 'F';
  }
  
  return 'U';
}

/**
 * Calculate stats for Gen 2 Pokémon
 * Same formula as Gen 1
 */
function calculateGen2Stats(species: number, level: number, dvs: DVs, evs: EVs): Stats {
  // Placeholder - would need base stats lookup
  return {
    hp: 100,
    attack: 50,
    defense: 50,
    speed: 50,
    special: 50,
  };
}
