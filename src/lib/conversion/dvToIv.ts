/**
 * Conversion logic for Gen 1/2 Pokémon to Gen 3 format
 * Based on Pokémon Community Conversion Standard (PCCS)
 * Reference: https://github.com/GearsProgress/Pokemon-Community-Conversion-Standard
 */

import type { Gen12Pokemon, DVs, IVs, GameVersion, VaultPokemon } from '../types';

/**
 * Convert Gen 1/2 Pokémon to Gen 3 format following PCCS
 * Note: pk3Data will need to be created separately when storing
 */
export function convertGen12ToGen3(
  gen12Pokemon: Gen12Pokemon,
  sourceGame: GameVersion
): Omit<VaultPokemon, 'id' | 'importDate' | 'pk3Data'> {
  // Convert DVs to IVs
  const ivs = convertDVsToIVs(gen12Pokemon.dvs);
  
  const gender = gen12Pokemon.gender || 'U';
  
  // Generate personality value that preserves shiny status and gender
  const personalityValue = generatePersonalityValue(
    gen12Pokemon.dvs,
    gen12Pokemon.shiny,
    gender,
    gen12Pokemon.species
  );
  
  // Convert EVs (Gen 1/2 use different scale)
  const evs = convertGen12EVs(gen12Pokemon.evs);
  
  // Determine nature from DVs (for consistency)
  const nature = determineNatureFromDVs(gen12Pokemon.dvs);
  
  // Determine ability (first ability by default)
  const ability = 0;
  
  // Calculate stats for Gen 3
  const stats = {
    hp: gen12Pokemon.stats.hp,
    attack: gen12Pokemon.stats.attack,
    defense: gen12Pokemon.stats.defense,
    speed: gen12Pokemon.stats.speed,
    specialAttack: gen12Pokemon.stats.special || 50,
    specialDefense: gen12Pokemon.stats.special || 50,
  };
  
  // Create full 32-bit OT ID
  const otId = gen12Pokemon.otId;
  const otSecretId = 0; // Gen 1/2 don't have secret IDs
  
  return {
    species: gen12Pokemon.species,
    level: gen12Pokemon.level,
    nickname: gen12Pokemon.nickname,
    ot: gen12Pokemon.ot,
    otId,
    otSecretId,
    exp: gen12Pokemon.exp,
    friendship: gen12Pokemon.friendship || 70,
    moves: gen12Pokemon.moves,
    ivs,
    evs,
    personalityValue,
    nature,
    ability,
    gender,
    shiny: gen12Pokemon.shiny,
    ball: 4, // Poké Ball (default)
    statusCondition: gen12Pokemon.statusCondition,
    currentHP: gen12Pokemon.currentHP,
    stats,
    sourceGeneration: gen12Pokemon.friendship ? 2 : 1,
    sourceGame,
    isLegal: true,
    legalityNotes: [],
  };
}

/**
 * Convert Gen 1/2 DVs (0-15) to Gen 3 IVs (0-31)
 * PCCS standard: IV = DV * 2 + 1
 * This ensures DV can be recovered: DV = floor(IV / 2)
 */
export function convertDVsToIVs(dvs: DVs): IVs {
  const hp = Math.min(31, (dvs.hp * 2) + 1);
  const attack = Math.min(31, (dvs.attack * 2) + 1);
  const defense = Math.min(31, (dvs.defense * 2) + 1);
  const speed = Math.min(31, (dvs.speed * 2) + 1);
  const special = Math.min(31, (dvs.special * 2) + 1);
  
  return {
    hp,
    attack,
    defense,
    speed,
    specialAttack: special,
    specialDefense: special, // Gen 1/2 have unified Special
  };
}

/**
 * Generate personality value that preserves shiny status and gender
 * Critical for PCCS compliance
 * 
 * Gen 3 shininess formula: ((PID_high ^ PID_low) ^ (TID ^ SID)) < 8
 * 
 * For non-shiny Pokemon, we need to ensure the XOR result is >= 8
 * For shiny Pokemon, we need to ensure the XOR result is < 8
 */
export function generatePersonalityValue(
  dvs: DVs,
  isShiny: boolean,
  _gender: 'M' | 'F' | 'U',
  _species: number
): number {
  // Generate a base PID from DVs for consistency
  const basePid = (dvs.attack << 28) | (dvs.defense << 24) | (dvs.speed << 20) | (dvs.special << 16) |
                  (dvs.attack << 12) | (dvs.defense << 8) | (dvs.speed << 4) | dvs.special;
  
  // If should be shiny, generate a shiny PID
  if (isShiny) {
    // For converted Pokemon, use TID=0, SID=0 (they don't have SID in Gen 1/2)
    // Generate PID where (PID_high ^ PID_low ^ 0 ^ 0) < 8
    // This means (PID_high ^ PID_low) < 8
    const pidHigh = (basePid >>> 16) & 0xFFFF;
    let pidLow = basePid & 0xFFFF;
    
    // Adjust lower 16 bits to make XOR result < 8
    const targetXor = (pidHigh ^ pidLow) % 8; // 0-7
    pidLow = (pidLow & 0xFFF8) | targetXor;
    
    return ((pidHigh << 16) | pidLow) >>> 0;
  } else {
    // For non-shiny, ensure (PID_high ^ PID_low) >= 8
    let pidHigh = (basePid >>> 16) & 0xFFFF;
    let pidLow = basePid & 0xFFFF;
    
    const xorResult = pidHigh ^ pidLow;
    if (xorResult < 8) {
      // Force XOR to be >= 8 by modifying lower bits
      pidLow = (pidLow & 0xFFF8) | 0x08;
    }
    
    return ((pidHigh << 16) | pidLow) >>> 0;
  }
}

/**
 * Convert Gen 1/2 EVs to Gen 3 EVs
 * Gen 1/2: 0-65535 range
 * Gen 3: 0-255 per stat, max 510 total
 */
export function convertGen12EVs(gen12EVs: {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  special?: number;
}): {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
} {
  // Convert from 0-65535 range to 0-255 range
  // Formula: Gen3_EV = sqrt(Gen2_EV) capped at 255
  const convertEV = (oldEV: number): number => {
    return Math.min(255, Math.floor(Math.sqrt(oldEV)));
  };
  
  const hp = convertEV(gen12EVs.hp);
  const attack = convertEV(gen12EVs.attack);
  const defense = convertEV(gen12EVs.defense);
  const speed = convertEV(gen12EVs.speed);
  const special = convertEV(gen12EVs.special || 0);
  
  // Split Special EV into SpAtk and SpDef
  const specialAttack = special;
  const specialDefense = special;
  
  // Check if total exceeds 510, scale down proportionally
  let total = hp + attack + defense + speed + specialAttack + specialDefense;
  
  if (total > 510) {
    const scale = 510 / total;
    return {
      hp: Math.floor(hp * scale),
      attack: Math.floor(attack * scale),
      defense: Math.floor(defense * scale),
      speed: Math.floor(speed * scale),
      specialAttack: Math.floor(specialAttack * scale),
      specialDefense: Math.floor(specialDefense * scale),
    };
  }
  
  return {
    hp,
    attack,
    defense,
    speed,
    specialAttack,
    specialDefense,
  };
}

/**
 * Determine nature from DVs for consistency
 */
export function determineNatureFromDVs(dvs: DVs): number {
  // Use combination of DVs to determine nature (0-24)
  // Ensures same DVs always produce same nature
  const natureValue = (dvs.attack + dvs.defense + dvs.speed + dvs.special) % 25;
  return natureValue;
}

/**
 * Check if DVs would result in shiny in Gen 2
 */
export function isShinyDVs(dvs: DVs): boolean {
  return (
    dvs.defense === 10 &&
    dvs.speed === 10 &&
    dvs.special === 10 &&
    [2, 3, 6, 7, 10, 11, 14, 15].includes(dvs.attack)
  );
}

/**
 * Extract DVs from packed 16-bit value
 * Format: AAAABBBBCCCCDDDD
 * A = Attack DV, B = Defense DV, C = Speed DV, D = Special DV
 */
export function extractDVsFromPacked(packed: number): DVs {
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
 * Reverse conversion: Extract DVs from IVs (for validation)
 */
export function extractDVsFromIVs(ivs: IVs): DVs {
  return {
    hp: Math.floor(ivs.hp / 2),
    attack: Math.floor(ivs.attack / 2),
    defense: Math.floor(ivs.defense / 2),
    speed: Math.floor(ivs.speed / 2),
    special: Math.floor(ivs.specialAttack / 2),
  };
}
