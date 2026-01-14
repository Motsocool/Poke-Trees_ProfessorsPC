/**
 * Base stats lookup for Pokemon Gen 1-2 (species 1-251)
 * Now using complete data from CSV format
 * Data sourced from official Pokemon stats
 */

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;  // For Gen 3, or Special for Gen 1/2
  specialDefense: number; // For Gen 3, or Special for Gen 1/2
}

// Import complete base stats data for Gen 1-2
import { POKEMON_BASE_STATS } from './baseStatsData';

/**
 * Get base stats for a Pokemon species
 * @param species Pokemon species ID (1-251 for Gen 1-2, up to 386 for Gen 3)
 * @returns Base stats, or default values if species not found
 */
export function getBaseStats(species: number): BaseStats {
  if (species >= 1 && species < POKEMON_BASE_STATS.length) {
    return POKEMON_BASE_STATS[species];
  }
  
  // Default stats for unknown species (Gen 3 Pokemon 252-386 not yet in database)
  // Using 60 for all stats as a reasonable middle-ground value
  // This is slightly above the average of fully evolved Pokemon (~55-65 per stat)
  // and prevents unrealistic extremes while maintaining gameplay balance
  return {
    hp: 60,
    attack: 60,
    defense: 60,
    speed: 60,
    specialAttack: 60,
    specialDefense: 60,
  };
}

/**
 * Check if species has base stats defined in the database
 */
export function hasBaseStats(species: number): boolean {
  return species >= 1 && species < POKEMON_BASE_STATS.length;
}
