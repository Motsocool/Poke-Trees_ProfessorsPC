import { describe, it, expect } from 'vitest';
import { calculateGen2Checksum } from './gen2';

/**
 * Test the Gen 2 checksum calculation
 * This validates the fix for the Gen 2 checksum mismatch error
 */

describe('Gen 2 Checksum Calculation', () => {
  it('should calculate checksum as 16-bit sum', () => {
    // Create a minimal Gen 2 save buffer
    const buffer = new ArrayBuffer(0x8000); // 32KB
    const view = new DataView(buffer);
    
    // Fill the checksum region with known values
    for (let i = 0x2009; i <= 0x2D08; i++) {
      view.setUint8(i, 0x01); // All ones for easy calculation
    }
    
    // Calculate expected sum
    const regionSize = 0x2D08 - 0x2009 + 1; // 0xD00 = 3328 bytes
    const expectedSum = regionSize & 0xFFFF; // 3328
    
    const calculatedSum = calculateGen2Checksum(view);
    expect(calculatedSum).toBe(expectedSum);
  });

  it('should handle overflow correctly with 16-bit masking', () => {
    const buffer = new ArrayBuffer(0x8000);
    const view = new DataView(buffer);
    
    // Fill with 0xFF to cause overflow
    for (let i = 0x2009; i <= 0x2D08; i++) {
      view.setUint8(i, 0xFF);
    }
    
    const calculatedSum = calculateGen2Checksum(view);
    
    // Sum should wrap around at 16 bits
    const regionSize = 0x2D08 - 0x2009 + 1; // 3328 bytes
    const rawSum = 0xFF * regionSize; // 848640
    const expectedSum = rawSum & 0xFFFF; // Should be 62208 (0xF300)
    
    expect(calculatedSum).toBe(expectedSum);
  });

  it('should calculate zero checksum for empty region', () => {
    const buffer = new ArrayBuffer(0x8000);
    const view = new DataView(buffer);
    
    // All zeros by default
    const calculatedSum = calculateGen2Checksum(view);
    expect(calculatedSum).toBe(0);
  });

  it('should use correct checksum range (0x2009 to 0x2D08)', () => {
    const buffer = new ArrayBuffer(0x8000);
    const view = new DataView(buffer);
    
    // Set a specific pattern
    view.setUint8(0x2008, 0xFF); // Before range - should not affect
    view.setUint8(0x2009, 0x01); // Start of range
    view.setUint8(0x2D08, 0x01); // End of range
    view.setUint8(0x2D09, 0xFF); // After range - should not affect
    view.setUint8(0x2D0C, 0xFF); // Checksum storage - should not affect
    
    const calculatedSum = calculateGen2Checksum(view);
    
    // Only the two 0x01 bytes should be counted
    expect(calculatedSum).toBe(2);
  });

  it('should produce different checksums for different data', () => {
    const buffer1 = new ArrayBuffer(0x8000);
    const view1 = new DataView(buffer1);
    
    const buffer2 = new ArrayBuffer(0x8000);
    const view2 = new DataView(buffer2);
    
    // Set different patterns
    for (let i = 0x2009; i <= 0x2D08; i++) {
      view1.setUint8(i, 0x01);
      view2.setUint8(i, 0x02);
    }
    
    const sum1 = calculateGen2Checksum(view1);
    const sum2 = calculateGen2Checksum(view2);
    
    expect(sum1).not.toBe(sum2);
    expect(sum2).toBe(sum1 * 2); // Double the value
  });

  it('should handle the checksum storage location correctly', () => {
    const buffer = new ArrayBuffer(0x8000);
    const view = new DataView(buffer);
    
    // The checksum is stored at 0x2D0C but should not be included in calculation
    // Fill region with 0x01
    for (let i = 0x2009; i <= 0x2D08; i++) {
      view.setUint8(i, 0x01);
    }
    
    // Set checksum storage location to a different value
    view.setUint16(0x2D0C, 0xFFFF, true);
    
    // Should only count up to 0x2D08
    const calculatedSum = calculateGen2Checksum(view);
    const regionSize = 0x2D08 - 0x2009 + 1;
    expect(calculatedSum).toBe(regionSize);
  });

  it('should calculate correct value for typical save data pattern', () => {
    const buffer = new ArrayBuffer(0x8000);
    const view = new DataView(buffer);
    
    // Simulate a more realistic pattern with varying bytes
    let expectedSum = 0;
    for (let i = 0x2009; i <= 0x2D08; i++) {
      const value = (i & 0xFF); // Use lower byte of address as value
      view.setUint8(i, value);
      expectedSum = (expectedSum + value) & 0xFFFF;
    }
    
    const calculatedSum = calculateGen2Checksum(view);
    expect(calculatedSum).toBe(expectedSum);
  });
});
