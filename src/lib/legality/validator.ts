/**
 * Legality validation for Pokémon
 * Ensures Pokémon comply with game rules
 */

import type { VaultPokemon, Gen3Pokemon, LegalityCheck, IVs, EVs } from '../types';
import { calculatePk3Checksum, decryptAndUnshufflePk3 } from '../gen3/pk3/pk3';
import { serializePk3ForStorage, deserializePk3FromStorage } from '../db/vaultDb';

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
  
  // Check if all IVs are max
  const allMax = ivEntries.every(([_, value]) => value === 31);
  if (allMax) {
    warnings.push('All IVs are maximum (31) - unusual but legal');
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
  
  return { errors, warnings };
}

/**
 * Fix Pokémon checksum
 */
export async function fixPokemonChecksum(pokemon: VaultPokemon): Promise<VaultPokemon> {
  try {
    // Deserialize pk3 data
    const pk3 = deserializePk3FromStorage(pokemon.pk3Data);
    
    // Decrypt and unshuffle
    const substructures = decryptAndUnshufflePk3(pk3);
    
    // Recalculate correct checksum
    const correctChecksum = calculatePk3Checksum(substructures);
    
    // Update checksum
    pk3.checksum = correctChecksum;
    
    // Serialize back
    const updatedPk3Data = serializePk3ForStorage(pk3);
    
    return {
      ...pokemon,
      pk3Data: updatedPk3Data,
      isLegal: true,
      legalityNotes: [...pokemon.legalityNotes, 'Checksum corrected'],
    };
  } catch (error) {
    console.error('Failed to fix checksum:', error);
    return pokemon;
  }
}

/**
 * Validate shiny status based on PID and IDs
 */
export function validateShiny(pid: number, tid: number, sid: number): boolean {
  const pidUpper = (pid >> 16) & 0xFFFF;
  const pidLower = pid & 0xFFFF;
  const xor = pidUpper ^ pidLower ^ tid ^ sid;
  return xor < 8;
}
