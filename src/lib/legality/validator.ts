/**
 * Legality validation for Pokémon
 * Ensures Pokémon comply with game rules and PCCS standards
 */

import type { VaultPokemon, Gen3Pokemon, LegalityCheck, IVs, EVs } from '../types';

/**
 * Perform full legality check on a Pokémon
 */
export function checkLegality(pokemon: VaultPokemon | Gen3Pokemon): LegalityCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check IVs
  const ivCheck = validateIVs(pokemon.ivs);
  errors.push(...ivCheck.errors);
  warnings.push(...ivCheck.warnings);
  
  // Check EVs
  const evCheck = validateEVs(pokemon.evs);
  errors.push(...evCheck.errors);
  warnings.push(...evCheck.warnings);
  
  // Check level
  if (pokemon.level < 1 || pokemon.level > 100) {
    errors.push(`Invalid level: ${pokemon.level} (must be 1-100)`);
  }
  
  // Check species
  if (pokemon.species < 1 || pokemon.species > 386) {
    errors.push(`Invalid species ID: ${pokemon.species}`);
  }
  
  // Check moves
  if (pokemon.moves.length > 4) {
    errors.push(`Too many moves: ${pokemon.moves.length} (max 4)`);
  }
  
  for (const move of pokemon.moves) {
    if (move.id < 1 || move.id > 354) {
      errors.push(`Invalid move ID: ${move.id}`);
    }
    if (move.pp < 0 || move.pp > 61) {
      errors.push(`Invalid PP for move ${move.id}: ${move.pp}`);
    }
    if (move.ppUps < 0 || move.ppUps > 3) {
      errors.push(`Invalid PP Ups for move ${move.id}: ${move.ppUps}`);
    }
  }
  
  // Check friendship
  if (pokemon.friendship !== undefined) {
    if (pokemon.friendship < 0 || pokemon.friendship > 255) {
      errors.push(`Invalid friendship: ${pokemon.friendship} (must be 0-255)`);
    }
  }
  
  // Check nature
  if (pokemon.nature !== undefined) {
    if (pokemon.nature < 0 || pokemon.nature > 24) {
      errors.push(`Invalid nature: ${pokemon.nature} (must be 0-24)`);
    }
  }
  
  // Check ability
  if (pokemon.ability !== undefined) {
    if (pokemon.ability < 0 || pokemon.ability > 1) {
      warnings.push(`Unusual ability index: ${pokemon.ability} (usually 0 or 1)`);
    }
  }
  
  // Check ball
  if (pokemon.ball !== undefined) {
    if (pokemon.ball < 0 || pokemon.ball > 12) {
      warnings.push(`Unusual ball ID: ${pokemon.ball}`);
    }
  }
  
  // Check shiny validity
  if (pokemon.shiny && pokemon.otId !== undefined && pokemon.otSecretId !== undefined) {
    const shinyCheck = validateShiny(pokemon.personalityValue, pokemon.otId, pokemon.otSecretId || 0);
    if (!shinyCheck) {
      errors.push('Pokémon marked as shiny but PID/ID combination does not result in shiny');
    }
  }
  
  // Check nickname length
  if (pokemon.nickname && pokemon.nickname.length > 10) {
    errors.push(`Nickname too long: ${pokemon.nickname.length} characters (max 10)`);
  }
  
  // Check OT name length
  if (pokemon.ot && pokemon.ot.length > 8) {
    errors.push(`OT name too long: ${pokemon.ot.length} characters (max 8)`);
  }
  
  return {
    isLegal: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate IVs
 */
function validateIVs(ivs: IVs): Pick<LegalityCheck, 'errors' | 'warnings'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check each IV is in valid range (0-31)
  const ivEntries = Object.entries(ivs) as [keyof IVs, number][];
  
  for (const [stat, value] of ivEntries) {
    if (value < 0 || value > 31) {
      errors.push(`Invalid IV for ${stat}: ${value} (must be 0-31)`);
    }
  }
  
  // Check if all IVs are max (suspicious but not illegal)
  const allMax = ivEntries.every(([_, value]) => value === 31);
  if (allMax) {
    warnings.push('All IVs are maximum (31) - unusual but legal');
  }
  
  // Check if all IVs are same value
  const allSame = ivEntries.every(([_, value]) => value === ivs.hp);
  if (allSame && ivs.hp !== 0 && ivs.hp !== 31) {
    warnings.push(`All IVs are the same value (${ivs.hp}) - unusual pattern`);
  }
  
  return { errors, warnings };
}

/**
 * Validate EVs
 */
function validateEVs(evs: EVs): Pick<LegalityCheck, 'errors' | 'warnings'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check each EV is in valid range (0-255)
  const evEntries = Object.entries(evs) as [keyof EVs, number | undefined][];
  
  for (const [stat, value] of evEntries) {
    if (value !== undefined) {
      if (value < 0 || value > 255) {
        errors.push(`Invalid EV for ${stat}: ${value} (must be 0-255)`);
      }
    }
  }
  
  // Check total EVs don't exceed 510 (Gen 3 limit)
  const total = (evs.hp || 0) + 
                (evs.attack || 0) + 
                (evs.defense || 0) + 
                (evs.speed || 0) + 
                (evs.specialAttack || 0) + 
                (evs.specialDefense || 0);
  
  if (total > 510) {
    errors.push(`Total EVs exceed limit: ${total} (max 510)`);
  }
  
  // Warning if total is exactly 510 with multiple maxed stats
  const maxedStats = evEntries.filter(([_, value]) => value === 255).length;
  if (total === 510 && maxedStats >= 2) {
    warnings.push('Multiple stats have maximum EVs - verify this is intentional');
  }
  
  return { errors, warnings };
}

/**
 * Validate shiny status based on PID and IDs
 */
function validateShiny(pid: number, tid: number, sid: number): boolean {
  const pidUpper = (pid >> 16) & 0xFFFF;
  const pidLower = pid & 0xFFFF;
  const xor = pidUpper ^ pidLower ^ tid ^ sid;
  
  return xor < 8;
}

/**
 * Check if a converted Pokémon maintains PCCS compliance
 */
export function validatePCCSCompliance(
  originalDVs: { attack: number; defense: number; speed: number; special: number },
  convertedIVs: IVs,
  wasShiny: boolean,
  isShiny: boolean
): LegalityCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check that IVs properly represent DVs
  // DV = floor(IV / 2), so IV should be DV * 2 or DV * 2 + 1
  const dvFromIV = {
    attack: Math.floor(convertedIVs.attack / 2),
    defense: Math.floor(convertedIVs.defense / 2),
    speed: Math.floor(convertedIVs.speed / 2),
    special: Math.floor(convertedIVs.specialAttack / 2),
  };
  
  if (dvFromIV.attack !== originalDVs.attack) {
    errors.push(`Attack IV ${convertedIVs.attack} does not properly represent DV ${originalDVs.attack}`);
  }
  
  if (dvFromIV.defense !== originalDVs.defense) {
    errors.push(`Defense IV ${convertedIVs.defense} does not properly represent DV ${originalDVs.defense}`);
  }
  
  if (dvFromIV.speed !== originalDVs.speed) {
    errors.push(`Speed IV ${convertedIVs.speed} does not properly represent DV ${originalDVs.speed}`);
  }
  
  if (dvFromIV.special !== originalDVs.special) {
    warnings.push(`Special IV ${convertedIVs.specialAttack} does not perfectly represent DV ${originalDVs.special}`);
  }
  
  // Check shiny status preservation
  if (wasShiny !== isShiny) {
    errors.push(`Shiny status not preserved: was ${wasShiny}, now ${isShiny}`);
  }
  
  return {
    isLegal: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that a Pokémon's stats are correctly calculated
 */
export function validateStats(
  pokemon: Gen3Pokemon,
  expectedStats: { hp: number; attack: number; defense: number; speed: number; specialAttack: number; specialDefense: number }
): boolean {
  return (
    pokemon.stats.hp === expectedStats.hp &&
    pokemon.stats.attack === expectedStats.attack &&
    pokemon.stats.defense === expectedStats.defense &&
    pokemon.stats.speed === expectedStats.speed &&
    pokemon.stats.specialAttack === expectedStats.specialAttack &&
    pokemon.stats.specialDefense === expectedStats.specialDefense
  );
}
