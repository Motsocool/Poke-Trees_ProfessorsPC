/**
 * Gen 1 (Red/Blue/Yellow) save file parser
 * Parses 32KB save files and extracts boxed Pokémon with DVs
 */

import { calcGen1HP, calcGen1Stat } from './statCalculations';
import { getBaseStats } from './baseStats';
import { detectGen1Version } from './versionDetection';
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
  GEN1_OT_NAME_LENGTH,
  GEN1_NICKNAME_LENGTH,
} from '../constants/gen1';

import {
  decodeGen12String,
  calculateGen12Checksum,
} from './utils';

import type { ParsedSaveFile, Box, Gen12Pokemon, DVs } from '../types';
import { GameVersion } from '../types';

/**
 * Parse a Gen 1 save file
 */
export function parseGen1Save(buffer: ArrayBuffer): ParsedSaveFile {
  const view = new DataView(buffer);
  
  // Validate file size
  if (buffer.byteLength !== GEN1_SAVE_SIZE) {
    throw new Error(`Invalid Gen 1 save file size: ${buffer.byteLength} bytes (expected ${GEN1_SAVE_SIZE})`);
  }

  // Validate checksum
  const storedChecksum = view.getUint8(GEN1_CHECKSUM_OFFSET);
  const calculatedChecksum = calculateGen12Checksum(view, 0x2598, 0x0D8A);
  
  if (storedChecksum !== calculatedChecksum) {
    console.warn(`Gen 1 checksum mismatch: stored=${storedChecksum}, calculated=${calculatedChecksum}`);
  }

  // Parse trainer data
  const trainerName = decodeGen12String(view, GEN1_PLAYER_NAME_OFFSET, GEN1_PLAYER_NAME_LENGTH);
  const trainerId = view.getUint16(GEN1_PLAYER_ID_OFFSET, true);

  // Determine game version using detection logic
  const uint8Buffer = new Uint8Array(buffer);
  const gameVersion = detectGen1Version(uint8Buffer);

  // Parse boxes
  const currentBoxNum = view.getUint8(GEN1_CURRENT_BOX_OFFSET);
  const boxes: Box[] = [];

  for (let i = 0; i < GEN1_NUM_BOXES; i++) {
    const box = parseGen1Box(view, i, i === currentBoxNum);
    boxes.push(box);
  }

  return {
    metadata: {
      game: gameVersion,
      generation: 1,
      trainerName,
      trainerId,
      playTime: 0,
      checksum: storedChecksum,
    },
    boxes,
  };
}

/**
 * Parse a single box from Gen 1 save
 */
function parseGen1Box(view: DataView, boxNum: number, isCurrent: boolean): Box {
  let boxOffset: number;

  if (isCurrent) {
    boxOffset = GEN1_CURRENT_BOX_DATA_OFFSET;
  } else if (boxNum < 6) {
    boxOffset = GEN1_BOX_1_6_OFFSET + (boxNum * GEN1_BOX_SIZE);
  } else {
    boxOffset = GEN1_BOX_7_12_OFFSET + ((boxNum - 6) * GEN1_BOX_SIZE);
  }

  // First byte is count of Pokémon in box
  const count = view.getUint8(boxOffset);
  const pokemon: (Gen12Pokemon | null)[] = [];

  // Pokemon data layout:
  // - Box count (1 byte)
  // - Species list (21 bytes: 20 pokemon + terminator)
  // - Pokemon data (20 * 33 bytes)
  // - OT names (20 * 11 bytes)
  // - Nicknames (20 * 11 bytes)

  const pokemonDataOffset = boxOffset + 22; // After count + species list
  const otNameOffset = pokemonDataOffset + (GEN1_POKEMON_PER_BOX * GEN1_POKEMON_BOX_DATA_SIZE);
  const nicknameOffset = otNameOffset + (GEN1_POKEMON_PER_BOX * GEN1_OT_NAME_LENGTH);

  for (let i = 0; i < GEN1_POKEMON_PER_BOX; i++) {
    if (i < count) {
      const pkmnOffset = pokemonDataOffset + (i * GEN1_POKEMON_BOX_DATA_SIZE);
      const pkmnData = parseGen1Pokemon(
        view,
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
  view: DataView,
  dataOffset: number,
  otOffset: number,
  nicknameOffset: number
): Gen12Pokemon {
  // Gen 1 box Pokémon structure (33 bytes):
  // 0x00: Species
  // 0x01-0x02: Current HP
  // 0x03: Level
  // 0x04: Status
  // 0x05-0x06: Type 1/2
  // 0x07: Catch rate/held item
  // 0x08-0x0B: Moves (4 bytes)
  // 0x0C-0x0D: OT ID
  // 0x0E-0x10: Experience (3 bytes)
  // 0x11-0x1A: HP/Atk/Def/Spd/Spc EVs (2 bytes each)
  // 0x1B-0x1C: IVs (DVs packed)
  // 0x1D-0x20: PP values (4 bytes)

  const species = view.getUint8(dataOffset + 0x00);
  const currentHP = view.getUint16(dataOffset + 0x01, true);
  const level = view.getUint8(dataOffset + 0x03);
  const otId = view.getUint16(dataOffset + 0x0C, true);
  const exp = view.getUint8(dataOffset + 0x0E) << 16 |
              view.getUint8(dataOffset + 0x0F) << 8 |
              view.getUint8(dataOffset + 0x10);

  // Parse OT and nickname
  const ot = decodeGen12String(view, otOffset, GEN1_OT_NAME_LENGTH);
  const nickname = decodeGen12String(view, nicknameOffset, GEN1_NICKNAME_LENGTH);

  // Parse EVs (Gen 1 calls them "Stat Experience")
  const evs = {
    hp: view.getUint16(dataOffset + 0x11, true),
    attack: view.getUint16(dataOffset + 0x13, true),
    defense: view.getUint16(dataOffset + 0x15, true),
    speed: view.getUint16(dataOffset + 0x17, true),
    special: view.getUint16(dataOffset + 0x19, true),
  };

  // Parse DVs (packed in 2 bytes)
  const dvBytes = view.getUint16(dataOffset + 0x1B, true);
  const dvs = extractGen1DVs(dvBytes);

  // Parse moves
  const moves: { id: number; pp: number; ppUps: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const moveId = view.getUint8(dataOffset + 0x08 + i);
    const ppByte = view.getUint8(dataOffset + 0x1D + i);
    
    if (moveId > 0) {
      moves.push({
        id: moveId,
        pp: ppByte & 0x3F,
        ppUps: ppByte >> 6,
      });
    }
  }

  // Check if would be shiny in Gen 2
  const shiny = isGen1ShinyDVs(dvs);

  // Calculate stats using proper Gen 1 formulas
  const baseStats = getBaseStats(species);
  const stats = {
    hp: calcGen1HP(baseStats.hp, dvs.hp, evs.hp, level),
    attack: calcGen1Stat(baseStats.attack, dvs.attack, evs.attack, level),
    defense: calcGen1Stat(baseStats.defense, dvs.defense, evs.defense, level),
    speed: calcGen1Stat(baseStats.speed, dvs.speed, evs.speed, level),
    special: calcGen1Stat(baseStats.specialAttack, dvs.special, evs.special, level),
  };

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
    gender: 'U', // Gen 1 has no gender
    shiny,
    statusCondition: 0,
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
