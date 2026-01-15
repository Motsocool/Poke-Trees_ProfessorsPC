/**
 * Gen 3 pk3 substructure parsing
 * Parses Growth, Attacks, EVs/Condition, and Misc data
 */

import { readU8, readU16, readU32 } from '../../utils/bin';
import {
  GROWTH_SPECIES_OFFSET,
  GROWTH_ITEM_OFFSET,
  GROWTH_EXPERIENCE_OFFSET,
  GROWTH_FRIENDSHIP_OFFSET,
  ATTACKS_MOVE1_OFFSET,
  ATTACKS_MOVE2_OFFSET,
  ATTACKS_MOVE3_OFFSET,
  ATTACKS_MOVE4_OFFSET,
  ATTACKS_PP1_OFFSET,
  ATTACKS_PP2_OFFSET,
  ATTACKS_PP3_OFFSET,
  ATTACKS_PP4_OFFSET,
  EVS_HP_OFFSET,
  EVS_ATTACK_OFFSET,
  EVS_DEFENSE_OFFSET,
  EVS_SPEED_OFFSET,
  EVS_SPATK_OFFSET,
  EVS_SPDEF_OFFSET,
  MISC_POKERUS_OFFSET,
  MISC_MET_LOCATION_OFFSET,
  MISC_ORIGINS_OFFSET,
  MISC_IVS_OFFSET,
  MISC_RIBBONS_OFFSET,
} from '../save/constants';

export interface GrowthData {
  species: number;
  item: number;
  experience: number;
  ppBonuses: number;
  friendship: number;
}

export interface AttacksData {
  move1: number;
  move2: number;
  move3: number;
  move4: number;
  pp1: number;
  pp2: number;
  pp3: number;
  pp4: number;
}

export interface EVsData {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAtk: number;
  spDef: number;
  coolness: number;
  beauty: number;
  cuteness: number;
  smartness: number;
  toughness: number;
  feel: number;
}

export interface MiscData {
  pokerus: number;
  metLocation: number;
  origins: number; // Packed field with level met, game, ball, OT gender
  ivs: number; // Packed field with IVs, egg flags, ability
  ribbons: number;
}

/**
 * Parse the Growth substructure (12 bytes)
 */
export function parseGrowth(data: Uint8Array): GrowthData {
  if (data.length !== 12) {
    throw new Error(`Invalid Growth data size: expected 12, got ${data.length}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  return {
    species: readU16(view, GROWTH_SPECIES_OFFSET),
    item: readU16(view, GROWTH_ITEM_OFFSET),
    experience: readU32(view, GROWTH_EXPERIENCE_OFFSET),
    ppBonuses: readU8(view, 8),
    friendship: readU8(view, GROWTH_FRIENDSHIP_OFFSET),
  };
}

/**
 * Parse the Attacks substructure (12 bytes)
 */
export function parseAttacks(data: Uint8Array): AttacksData {
  if (data.length !== 12) {
    throw new Error(`Invalid Attacks data size: expected 12, got ${data.length}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  return {
    move1: readU16(view, ATTACKS_MOVE1_OFFSET),
    move2: readU16(view, ATTACKS_MOVE2_OFFSET),
    move3: readU16(view, ATTACKS_MOVE3_OFFSET),
    move4: readU16(view, ATTACKS_MOVE4_OFFSET),
    pp1: readU8(view, ATTACKS_PP1_OFFSET),
    pp2: readU8(view, ATTACKS_PP2_OFFSET),
    pp3: readU8(view, ATTACKS_PP3_OFFSET),
    pp4: readU8(view, ATTACKS_PP4_OFFSET),
  };
}

/**
 * Parse the EVs & Condition substructure (12 bytes)
 */
export function parseEVs(data: Uint8Array): EVsData {
  if (data.length !== 12) {
    throw new Error(`Invalid EVs data size: expected 12, got ${data.length}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  return {
    hp: readU8(view, EVS_HP_OFFSET),
    attack: readU8(view, EVS_ATTACK_OFFSET),
    defense: readU8(view, EVS_DEFENSE_OFFSET),
    speed: readU8(view, EVS_SPEED_OFFSET),
    spAtk: readU8(view, EVS_SPATK_OFFSET),
    spDef: readU8(view, EVS_SPDEF_OFFSET),
    coolness: readU8(view, 6),
    beauty: readU8(view, 7),
    cuteness: readU8(view, 8),
    smartness: readU8(view, 9),
    toughness: readU8(view, 10),
    feel: readU8(view, 11),
  };
}

/**
 * Parse the Misc substructure (12 bytes)
 */
export function parseMisc(data: Uint8Array): MiscData {
  if (data.length !== 12) {
    throw new Error(`Invalid Misc data size: expected 12, got ${data.length}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  return {
    pokerus: readU8(view, MISC_POKERUS_OFFSET),
    metLocation: readU8(view, MISC_MET_LOCATION_OFFSET),
    origins: readU16(view, MISC_ORIGINS_OFFSET),
    ivs: readU32(view, MISC_IVS_OFFSET),
    ribbons: readU32(view, MISC_RIBBONS_OFFSET),
  };
}

import { calculateLevelFromExp } from '../../parsers/experienceCalculations';

/**
 * Calculate level from experience using proper growth rate tables
 * This is a wrapper function for backward compatibility
 */
export function calculateLevel(experience: number, species: number = 1): number {
  return calculateLevelFromExp(species, experience);
}

/**
 * Extract individual IVs from the packed IVs field
 */
export function extractIVs(ivsField: number): {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAtk: number;
  spDef: number;
  isEgg: boolean;
  abilityBit: number;
} {
  return {
    hp: ivsField & 0x1F,
    attack: (ivsField >>> 5) & 0x1F,
    defense: (ivsField >>> 10) & 0x1F,
    speed: (ivsField >>> 15) & 0x1F,
    spAtk: (ivsField >>> 20) & 0x1F,
    spDef: (ivsField >>> 25) & 0x1F,
    isEgg: ((ivsField >>> 30) & 0x1) === 1,
    abilityBit: (ivsField >>> 31) & 0x1,
  };
}

/**
 * Extract TID and SID from OTID field
 */
export function extractTrainerIds(otId: number): { tid: number; sid: number } {
  return {
    tid: otId & 0xFFFF,
    sid: (otId >>> 16) & 0xFFFF,
  };
}
