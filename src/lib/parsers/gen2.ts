/**
 * Gen 2 (Gold/Silver/Crystal) save file parser
 * Parses 32KB save files and extracts boxed Pokémon with DVs
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
  GEN2_OT_NAME_LENGTH,
  GEN2_NICKNAME_LENGTH,
  GEN2_SHINY_DEFENSE_DV,
  GEN2_SHINY_SPEED_DV,
  GEN2_SHINY_SPECIAL_DV,
  GEN2_SHINY_ATTACK_DVS,
} from '../constants/gen2';

import {
  decodeGen12String,
} from './utils';

import type { ParsedSaveFile, Box, Gen12Pokemon, DVs } from '../types';
import { GameVersion } from '../types';

/**
 * Parse a Gen 2 save file
 */
export function parseGen2Save(buffer: ArrayBuffer): ParsedSaveFile {
  const view = new DataView(buffer);
  
  // Validate file size
  if (buffer.byteLength !== GEN2_SAVE_SIZE) {
    throw new Error(`Invalid Gen 2 save file size: ${buffer.byteLength} bytes (expected ${GEN2_SAVE_SIZE})`);
  }

  // Validate checksum
  const storedChecksum = view.getUint16(GEN2_CHECKSUM_OFFSET, true);
  const calculatedChecksum = calculateGen2Checksum(view);
  
  if (storedChecksum !== calculatedChecksum) {
    console.warn(`Gen 2 checksum mismatch: stored=${storedChecksum}, calculated=${calculatedChecksum}`);
  }

  // Parse trainer data
  const trainerName = decodeGen12String(view, GEN2_PLAYER_NAME_OFFSET, GEN2_PLAYER_NAME_LENGTH);
  const trainerId = view.getUint16(GEN2_PLAYER_ID_OFFSET, true);

  // Determine game version (simplified)
  const gameVersion = GameVersion.CRYSTAL;

  // Parse boxes
  const currentBoxNum = view.getUint8(GEN2_CURRENT_BOX_OFFSET) & 0x7F; // Lower 7 bits
  const boxes: Box[] = [];

  for (let i = 0; i < GEN2_NUM_BOXES; i++) {
    const box = parseGen2Box(view, i, i === currentBoxNum);
    boxes.push(box);
  }

  return {
    metadata: {
      game: gameVersion,
      generation: 2,
      trainerName,
      trainerId,
      playTime: 0,
      checksum: storedChecksum,
    },
    boxes,
  };
}

/**
 * Calculate Gen 2 checksum
 * Gen 2 uses a 16-bit sum of bytes from 0x2009 to 0x2D0C (inclusive)
 * Exported for testing purposes
 */
export function calculateGen2Checksum(view: DataView): number {
  let sum = 0;
  const start = 0x2009;
  const end = 0x2D0C;
  
  for (let i = start; i <= end; i++) {
    sum = (sum + view.getUint8(i)) & 0xFFFF;
  }
  
  return sum;
}

/**
 * Parse a single box from Gen 2 save
 */
function parseGen2Box(view: DataView, boxNum: number, isCurrent: boolean): Box {
  let boxOffset: number;

  if (isCurrent) {
    boxOffset = GEN2_CURRENT_BOX_DATA_OFFSET;
  } else if (boxNum < 7) {
    boxOffset = GEN2_BOX_1_7_OFFSET + (boxNum * GEN2_BOX_SIZE);
  } else {
    boxOffset = GEN2_BOX_8_14_OFFSET + ((boxNum - 7) * GEN2_BOX_SIZE);
  }

  // First byte is count of Pokémon in box
  const count = view.getUint8(boxOffset);
  const pokemon: (Gen12Pokemon | null)[] = [];

  // Gen 2 box layout:
  // - Box count (1 byte)
  // - Species list (21 bytes: 20 pokemon + terminator)
  // - Pokemon data (20 * 32 bytes)
  // - OT names (20 * 11 bytes)
  // - Nicknames (20 * 11 bytes)

  const pokemonDataOffset = boxOffset + 22;
  const otNameOffset = pokemonDataOffset + (GEN2_POKEMON_PER_BOX * GEN2_POKEMON_BOX_DATA_SIZE);
  const nicknameOffset = otNameOffset + (GEN2_POKEMON_PER_BOX * GEN2_OT_NAME_LENGTH);

  for (let i = 0; i < GEN2_POKEMON_PER_BOX; i++) {
    if (i < count) {
      const pkmnOffset = pokemonDataOffset + (i * GEN2_POKEMON_BOX_DATA_SIZE);
      const pkmnData = parseGen2Pokemon(
        view,
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
  view: DataView,
  dataOffset: number,
  otOffset: number,
  nicknameOffset: number
): Gen12Pokemon {
  // Gen 2 box Pokémon structure (32 bytes):
  // 0x00: Species
  // 0x01: Held item
  // 0x02-0x05: Moves (4 bytes)
  // 0x06-0x07: OT ID
  // 0x08-0x0A: Experience (3 bytes)
  // 0x0B-0x14: HP/Atk/Def/Spd/SpAtk/SpDef EVs (2 bytes each)
  // 0x15-0x16: IVs (DVs packed)
  // 0x17-0x1A: PP values (4 bytes)
  // 0x1B: Friendship
  // 0x1C: Pokérus
  // 0x1D-0x1E: Caught data
  // 0x1F: Level

  const species = view.getUint8(dataOffset + 0x00);
  const level = view.getUint8(dataOffset + 0x1F);
  const otId = view.getUint16(dataOffset + 0x06, true);
  const exp = view.getUint8(dataOffset + 0x08) << 16 |
              view.getUint8(dataOffset + 0x09) << 8 |
              view.getUint8(dataOffset + 0x0A);
  const friendship = view.getUint8(dataOffset + 0x1B);

  // Parse OT and nickname
  const ot = decodeGen12String(view, otOffset, GEN2_OT_NAME_LENGTH);
  const nickname = decodeGen12String(view, nicknameOffset, GEN2_NICKNAME_LENGTH);

  // Parse EVs
  const evs = {
    hp: view.getUint16(dataOffset + 0x0B, true),
    attack: view.getUint16(dataOffset + 0x0D, true),
    defense: view.getUint16(dataOffset + 0x0F, true),
    speed: view.getUint16(dataOffset + 0x11, true),
    special: view.getUint16(dataOffset + 0x13, true), // Special is split into SpAtk/SpDef in Gen 2
  };

  // Parse DVs (packed in 2 bytes)
  const dvBytes = view.getUint16(dataOffset + 0x15, true);
  const dvs = extractGen2DVs(dvBytes);

  // Parse moves
  const moves: { id: number; pp: number; ppUps: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const moveId = view.getUint8(dataOffset + 0x02 + i);
    const ppByte = view.getUint8(dataOffset + 0x17 + i);
    
    if (moveId > 0) {
      moves.push({
        id: moveId,
        pp: ppByte & 0x3F,
        ppUps: ppByte >> 6,
      });
    }
  }

  // Determine if shiny
  const shiny = isGen2Shiny(dvs);

  // Determine gender from Attack DV (simplified)
  const gender = dvs.attack >= 8 ? 'M' : 'F';

  // Calculate stats (placeholder)
  const stats = {
    hp: 100,
    attack: 50,
    defense: 50,
    speed: 50,
    special: 50,
  };

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
    statusCondition: 0,
    currentHP: stats.hp,
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
