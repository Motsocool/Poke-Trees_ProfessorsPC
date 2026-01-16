/**
 * Tests for experience calculations
 */

import { describe, it, expect } from 'vitest';
import { calculateLevelFromExp, getGrowthRateName } from './experienceCalculations';

describe('calculateLevelFromExp', () => {
  it('should return 1 for 0 exp', () => {
    expect(calculateLevelFromExp(1, 0)).toBe(1);
  });

  it('should return 1 for negative exp', () => {
    expect(calculateLevelFromExp(1, -100)).toBe(1);
  });

  it('should return 1 for invalid species ID (0)', () => {
    expect(calculateLevelFromExp(0, 1000)).toBe(1);
  });

  it('should return 1 for invalid species ID (negative)', () => {
    expect(calculateLevelFromExp(-5, 1000)).toBe(1);
  });

  it('should return 1 for invalid species ID (too high)', () => {
    expect(calculateLevelFromExp(999, 1000)).toBe(1);
  });

  it('should return 1 for extremely high exp (likely corrupt)', () => {
    expect(calculateLevelFromExp(25, 20000000)).toBe(1);
  });

  it('should calculate correct level for species 1 (Fast growth rate)', () => {
    // Species 1 has Fast growth rate (3)
    // Level 10 requires 560 exp for Fast growth
    expect(calculateLevelFromExp(1, 560)).toBe(10);
  });

  it('should calculate correct level for species 25 (Medium Slow growth rate)', () => {
    // Species 25 has Medium Slow growth rate (2)
    // Level 10 requires 1000 exp for Medium Slow growth
    expect(calculateLevelFromExp(25, 1000)).toBe(10);
  });

  it('should handle high level Pokemon correctly', () => {
    // Test with species 1 (Fast growth) at level 50
    // Level 50 requires 117,360 exp for Fast growth
    expect(calculateLevelFromExp(1, 117360)).toBe(50);
  });

  it('should handle boundary exp values gracefully', () => {
    // Test with exp value right at level threshold
    // Species 1 (Fast growth): level 2 requires 9 exp
    expect(calculateLevelFromExp(1, 9)).toBe(2);
    // Just below level 2 threshold
    expect(calculateLevelFromExp(1, 8)).toBe(1);
  });
  
  it('should not crash on corrupted slot data', () => {
    // These are common patterns in empty/corrupted slots
    expect(calculateLevelFromExp(0, 0)).toBe(1);
    expect(calculateLevelFromExp(0, 9999999)).toBe(1);
    expect(calculateLevelFromExp(65535, 16777215)).toBe(1);
  });
});

describe('getGrowthRateName', () => {
  it('should return correct growth rate names', () => {
    expect(getGrowthRateName(0)).toBe('Medium Fast');
    expect(getGrowthRateName(1)).toBe('Slow');
    expect(getGrowthRateName(2)).toBe('Medium Slow');
    expect(getGrowthRateName(3)).toBe('Fast');
    expect(getGrowthRateName(4)).toBe('Erratic');
    expect(getGrowthRateName(5)).toBe('Fluctuating');
  });

  it('should return Unknown for invalid growth rates', () => {
    expect(getGrowthRateName(-1)).toBe('Unknown');
    expect(getGrowthRateName(6)).toBe('Unknown');
  });
});
