/**
 * Base stats lookup for Pokemon Gen 1-3
 * This is a minimal implementation with common Pokemon
 * Full implementation would load from useful_data/Gen3/stats.bin
 */

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;  // For Gen 3, or Special for Gen 1/2
  specialDefense: number; // For Gen 3, or Special for Gen 1/2
}

/**
 * Base stats lookup table
 * Key: species ID (1-386 for Gen 3)
 * TODO: Load from stats.bin for complete data
 */
const BASE_STATS_TABLE: { [key: number]: BaseStats } = {
  // Gen 1 starters
  1: { hp: 45, attack: 49, defense: 49, speed: 45, specialAttack: 65, specialDefense: 65 }, // Bulbasaur
  4: { hp: 39, attack: 52, defense: 43, speed: 65, specialAttack: 60, specialDefense: 50 }, // Charmander
  7: { hp: 44, attack: 48, defense: 65, speed: 43, specialAttack: 50, specialDefense: 64 }, // Squirtle
  
  // Popular Gen 1
  25: { hp: 35, attack: 55, defense: 40, speed: 90, specialAttack: 50, specialDefense: 50 }, // Pikachu
  94: { hp: 60, attack: 65, defense: 60, speed: 110, specialAttack: 130, specialDefense: 75 }, // Gengar
  130: { hp: 95, attack: 125, defense: 79, speed: 81, specialAttack: 60, specialDefense: 100 }, // Gyarados
  131: { hp: 130, attack: 85, defense: 80, speed: 60, specialAttack: 85, specialDefense: 95 }, // Lapras
  143: { hp: 160, attack: 110, defense: 65, speed: 30, specialAttack: 65, specialDefense: 110 }, // Snorlax
  150: { hp: 106, attack: 110, defense: 90, speed: 130, specialAttack: 154, specialDefense: 90 }, // Mewtwo
  151: { hp: 100, attack: 100, defense: 100, speed: 100, specialAttack: 100, specialDefense: 100 }, // Mew
  
  // Gen 2 starters
  152: { hp: 45, attack: 49, defense: 65, speed: 45, specialAttack: 49, specialDefense: 65 }, // Chikorita
  155: { hp: 39, attack: 52, defense: 43, speed: 65, specialAttack: 60, specialDefense: 50 }, // Cyndaquil
  158: { hp: 50, attack: 65, defense: 64, speed: 43, specialAttack: 44, specialDefense: 48 }, // Totodile
  
  // Popular Gen 2
  196: { hp: 65, attack: 65, defense: 60, speed: 110, specialAttack: 130, specialDefense: 95 }, // Espeon
  197: { hp: 95, attack: 65, defense: 110, speed: 65, specialAttack: 60, specialDefense: 130 }, // Umbreon
  245: { hp: 100, attack: 75, defense: 115, speed: 85, specialAttack: 90, specialDefense: 115 }, // Suicune
  249: { hp: 106, attack: 90, defense: 130, speed: 110, specialAttack: 90, specialDefense: 154 }, // Lugia
  250: { hp: 106, attack: 130, defense: 90, speed: 90, specialAttack: 110, specialDefense: 154 }, // Ho-Oh
  
  // Gen 3 starters
  252: { hp: 40, attack: 45, defense: 35, speed: 70, specialAttack: 65, specialDefense: 55 }, // Treecko
  255: { hp: 45, attack: 60, defense: 40, speed: 45, specialAttack: 70, specialDefense: 50 }, // Torchic
  258: { hp: 50, attack: 70, defense: 50, speed: 40, specialAttack: 50, specialDefense: 50 }, // Mudkip
  
  // Popular Gen 3
  282: { hp: 68, attack: 65, defense: 65, speed: 80, specialAttack: 125, specialDefense: 115 }, // Gardevoir
  306: { hp: 70, attack: 110, defense: 180, speed: 50, specialAttack: 60, specialDefense: 60 }, // Aggron
  359: { hp: 65, attack: 130, defense: 80, speed: 130, specialAttack: 75, specialDefense: 85 }, // Absol
  376: { hp: 80, attack: 135, defense: 130, speed: 70, specialAttack: 95, specialDefense: 90 }, // Metagross
  380: { hp: 80, attack: 80, defense: 90, speed: 110, specialAttack: 110, specialDefense: 130 }, // Latias
  381: { hp: 80, attack: 90, defense: 80, speed: 110, specialAttack: 130, specialDefense: 110 }, // Latios
  382: { hp: 100, attack: 100, defense: 90, speed: 95, specialAttack: 150, specialDefense: 140 }, // Kyogre
  383: { hp: 100, attack: 150, defense: 140, speed: 95, specialAttack: 100, specialDefense: 90 }, // Groudon
  384: { hp: 105, attack: 150, defense: 90, speed: 95, specialAttack: 150, specialDefense: 90 }, // Rayquaza
};

/**
 * Get base stats for a Pokemon species
 * Returns default stats if species not found
 */
export function getBaseStats(species: number): BaseStats {
  if (BASE_STATS_TABLE[species]) {
    return BASE_STATS_TABLE[species];
  }
  
  // Default stats for unknown species
  // Using reasonable middle-ground values
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
 * Check if species has base stats defined
 */
export function hasBaseStats(species: number): boolean {
  return species in BASE_STATS_TABLE;
}
