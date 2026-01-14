import { describe, it, expect } from 'vitest';
import { calculatePokemonLocation } from './gen3';

/**
 * Test the Gen 3 PC section Pokemon location calculation
 * This validates the fix for the "Could not find PC section 5" error
 */

// Constants matching those in gen3.ts
const SECTION_ID_PC_BUFFER_A = 5;
const GEN3_SECTION_DATA_SIZE = 0xFF4; // 4084 bytes
const PK3_SIZE = 80;
const PC_METADATA_SIZE = 144;
const SECTION_5_POKEMON_CAPACITY = Math.floor((GEN3_SECTION_DATA_SIZE - PC_METADATA_SIZE) / PK3_SIZE); // 49
const OTHER_SECTION_POKEMON_CAPACITY = Math.floor(GEN3_SECTION_DATA_SIZE / PK3_SIZE); // 51
const NUM_BOXES = 14;
const POKEMON_PER_BOX = 30;

describe('Gen 3 PC Section Pokemon Location Calculation', () => {
  it('should calculate correct section for Box 0, Slot 0', () => {
    const result = calculatePokemonLocation(0);
    expect(result.sectionId).toBe(5); // Section 5
    expect(result.offsetInSection).toBe(144); // After metadata
  });

  it('should calculate correct section for first Pokemon in Section 5', () => {
    const result = calculatePokemonLocation(0);
    expect(result.sectionId).toBe(5);
    expect(result.offsetInSection).toBe(144); // PC_METADATA_SIZE
  });

  it('should calculate correct section for last Pokemon in Section 5', () => {
    // Pokemon 48 is the last one in section 5 (0-indexed)
    const result = calculatePokemonLocation(48);
    expect(result.sectionId).toBe(5);
    expect(result.offsetInSection).toBe(144 + (48 * 80));
  });

  it('should calculate correct section for first Pokemon in Section 6', () => {
    // Pokemon 49 is the first in section 6
    const result = calculatePokemonLocation(49);
    expect(result.sectionId).toBe(6);
    expect(result.offsetInSection).toBe(0); // Start of section 6
  });

  it('should calculate correct section for Box 1, Slot 0', () => {
    const pokemonIndex = 1 * POKEMON_PER_BOX + 0; // Box 1, Slot 0 = Pokemon 30
    const result = calculatePokemonLocation(pokemonIndex);
    expect(result.sectionId).toBe(5); // Still in section 5 (holds 49 total)
  });

  it('should calculate correct section for Box 2, Slot 0', () => {
    const pokemonIndex = 2 * POKEMON_PER_BOX + 0; // Box 2, Slot 0 = Pokemon 60
    const result = calculatePokemonLocation(pokemonIndex);
    expect(result.sectionId).toBe(6); // In section 6 now
  });

  it('should calculate correct section for Box 5, Slot 0', () => {
    const pokemonIndex = 5 * POKEMON_PER_BOX + 0; // Box 5, Slot 0 = Pokemon 150
    const result = calculatePokemonLocation(pokemonIndex);
    // Pokemon 49-99 in section 6, 100-150 in section 7
    expect(result.sectionId).toBe(7);
  });

  it('should calculate correct section for last Pokemon (Box 13, Slot 29)', () => {
    const pokemonIndex = 13 * POKEMON_PER_BOX + 29; // Pokemon 419 (0-indexed)
    const result = calculatePokemonLocation(pokemonIndex);
    expect(result.sectionId).toBe(13); // Section 13
  });

  it('should throw error for invalid Pokemon index', () => {
    expect(() => calculatePokemonLocation(-1)).toThrow('Invalid pokemon index');
    expect(() => calculatePokemonLocation(420)).toThrow('Invalid pokemon index');
  });

  it('should verify all Pokemon fit within sections 5-13', () => {
    // Verify that all 420 Pokemon (14 boxes * 30) fit correctly
    const totalPokemon = NUM_BOXES * POKEMON_PER_BOX; // 420
    
    for (let i = 0; i < totalPokemon; i++) {
      const result = calculatePokemonLocation(i);
      
      // Section ID should be between 5 and 13
      expect(result.sectionId).toBeGreaterThanOrEqual(5);
      expect(result.sectionId).toBeLessThanOrEqual(13);
      
      // Offset should be within section data size
      expect(result.offsetInSection).toBeGreaterThanOrEqual(0);
      expect(result.offsetInSection).toBeLessThan(GEN3_SECTION_DATA_SIZE);
    }
  });

  it('should have correct capacity distribution', () => {
    // Section 5: 49 Pokemon
    let count5 = 0;
    // Sections 6-12: 51 Pokemon each
    const countOthers: { [key: number]: number } = {};
    
    for (let i = 0; i < NUM_BOXES * POKEMON_PER_BOX; i++) {
      const result = calculatePokemonLocation(i);
      if (result.sectionId === 5) {
        count5++;
      } else {
        countOthers[result.sectionId] = (countOthers[result.sectionId] || 0) + 1;
      }
    }
    
    expect(count5).toBe(49); // Section 5 has 49 Pokemon
    expect(countOthers[6]).toBe(51); // Section 6 has 51
    expect(countOthers[7]).toBe(51); // Section 7 has 51
    expect(countOthers[12]).toBe(51); // Section 12 has 51
    expect(countOthers[13]).toBe(14); // Section 13 has remaining 14
  });
});
