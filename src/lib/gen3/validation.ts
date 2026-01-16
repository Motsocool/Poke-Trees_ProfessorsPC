/**
 * Validation utilities for Gen 3 Pokémon data
 */

/**
 * Maximum valid species ID for Gen 3 (up to Deoxys and beyond for compatibility)
 */
export const MAX_SPECIES_ID = 440;

/**
 * Validate if a species ID is valid
 * @param species The species ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidSpeciesId(species: number): boolean {
  return species > 0 && species <= MAX_SPECIES_ID;
}

/**
 * Validate if experience points are reasonable
 * @param exp The experience points to validate
 * @returns true if valid, false otherwise
 */
export function isValidExperience(exp: number): boolean {
  // Experience should be non-negative and less than 10M (likely corrupted if higher)
  return exp >= 0 && exp <= 10_000_000;
}

/**
 * Validate if a growth rate is valid (0-5)
 * @param growthRate The growth rate to validate
 * @returns true if valid, false otherwise
 */
export function isValidGrowthRate(growthRate: number | undefined): growthRate is number {
  return growthRate !== undefined && growthRate >= 0 && growthRate <= 5;
}
