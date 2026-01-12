import { describe, it, expect } from 'vitest';
import {
  parseSection,
  calculateSectionChecksum,
  verifySectionIntegrity,
  parseSaveSlot,
  determineActiveSlot,
  validateSaveSize,
  getSortedSections,
} from './sections';
import {
  GEN3_SAVE_SIZE,
  GEN3_SECTION_SIZE,
  GEN3_SECTION_DATA_SIZE,
  GEN3_SECTION_SIGNATURE,
  GEN3_NUM_SECTIONS,
} from './constants';

describe('Gen3 Save Sections', () => {
  /**
   * Helper to create a minimal valid section
   */
  function createTestSection(id: number, saveIndex: number): ArrayBuffer {
    const buffer = new ArrayBuffer(GEN3_SECTION_SIZE);
    const view = new DataView(buffer);

    // Fill data with test pattern
    for (let i = 0; i < GEN3_SECTION_DATA_SIZE; i += 4) {
      view.setUint32(i, (id * 1000 + i) >>> 0, true);
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < GEN3_SECTION_DATA_SIZE; i += 4) {
      sum += view.getUint32(i, true);
    }
    const checksum = (((sum >>> 16) & 0xFFFF) + (sum & 0xFFFF)) & 0xFFFF;

    // Write footer
    view.setUint16(0xFF4, id, true); // Section ID
    view.setUint16(0xFF6, checksum, true); // Checksum
    view.setUint32(0xFF8, GEN3_SECTION_SIGNATURE, true); // Signature
    view.setUint32(0xFFC, saveIndex, true); // Save index

    return buffer;
  }

  /**
   * Helper to create a full save file with two slots
   */
  function createTestSaveFile(slotAIndex: number, slotBIndex: number): ArrayBuffer {
    const buffer = new ArrayBuffer(GEN3_SAVE_SIZE);
    const view = new Uint8Array(buffer);

    // Create slot A (14 sections)
    for (let i = 0; i < GEN3_NUM_SECTIONS; i++) {
      const section = createTestSection(i, slotAIndex);
      view.set(new Uint8Array(section), i * GEN3_SECTION_SIZE);
    }

    // Create slot B (14 sections)
    for (let i = 0; i < GEN3_NUM_SECTIONS; i++) {
      const section = createTestSection(i, slotBIndex);
      view.set(new Uint8Array(section), 0xE000 + i * GEN3_SECTION_SIZE);
    }

    return buffer;
  }

  describe('validateSaveSize', () => {
    it('should accept valid 128KB save files', () => {
      const buffer = new ArrayBuffer(GEN3_SAVE_SIZE);
      expect(() => validateSaveSize(buffer)).not.toThrow();
    });

    it('should reject invalid sizes', () => {
      const buffer = new ArrayBuffer(1024);
      expect(() => validateSaveSize(buffer)).toThrow();
    });
  });

  describe('parseSection', () => {
    it('should parse a valid section', () => {
      const fullBuffer = createTestSection(5, 1234);
      const section = parseSection(fullBuffer, 0);

      expect(section.id).toBe(5);
      expect(section.saveIndex).toBe(1234);
      expect(section.signature).toBe(GEN3_SECTION_SIGNATURE);
      expect(section.data.byteLength).toBe(GEN3_SECTION_DATA_SIZE);
    });

    it('should throw on invalid offset', () => {
      const buffer = new ArrayBuffer(GEN3_SAVE_SIZE);
      expect(() => parseSection(buffer, GEN3_SAVE_SIZE)).toThrow(RangeError);
      expect(() => parseSection(buffer, -1)).toThrow(RangeError);
    });
  });

  describe('calculateSectionChecksum', () => {
    it('should calculate checksum for section data', () => {
      const data = new ArrayBuffer(GEN3_SECTION_DATA_SIZE);
      const view = new DataView(data);

      // All zeros should give checksum 0
      expect(calculateSectionChecksum(data)).toBe(0);

      // Set some values
      view.setUint32(0, 0x12345678, true);
      view.setUint32(4, 0xABCDEF00, true);

      const checksum = calculateSectionChecksum(data);
      expect(checksum).toBeGreaterThan(0);
      expect(checksum).toBeLessThan(0x10000);
    });

    it('should throw on invalid data size', () => {
      const invalid = new ArrayBuffer(100);
      expect(() => calculateSectionChecksum(invalid)).toThrow();
    });
  });

  describe('verifySectionIntegrity', () => {
    it('should verify valid section', () => {
      const buffer = createTestSection(3, 100);
      const section = parseSection(buffer, 0);
      const result = verifySectionIntegrity(section);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid section ID', () => {
      const buffer = createTestSection(0, 100);
      const section = parseSection(buffer, 0);
      section.id = 99; // Invalid ID

      const result = verifySectionIntegrity(section);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid signature', () => {
      const buffer = createTestSection(0, 100);
      const section = parseSection(buffer, 0);
      section.signature = 0xDEADBEEF; // Wrong signature

      const result = verifySectionIntegrity(section);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('signature'))).toBe(true);
    });

    it('should detect checksum mismatch', () => {
      const buffer = createTestSection(0, 100);
      const section = parseSection(buffer, 0);
      section.checksum = 0xFFFF; // Wrong checksum

      const result = verifySectionIntegrity(section);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Checksum'))).toBe(true);
    });
  });

  describe('parseSaveSlot', () => {
    it('should parse all 14 sections from a slot', () => {
      const saveFile = createTestSaveFile(100, 200);
      const slot = parseSaveSlot(saveFile, 0);

      expect(slot.sections.length).toBe(GEN3_NUM_SECTIONS);
      expect(slot.saveIndex).toBe(100);
      expect(slot.isValid).toBe(true);
    });

    it('should detect invalid sections', () => {
      const saveFile = new ArrayBuffer(GEN3_SAVE_SIZE);
      // Leave it all zeros (invalid)
      const slot = parseSaveSlot(saveFile, 0);

      expect(slot.sections.length).toBe(GEN3_NUM_SECTIONS);
      expect(slot.isValid).toBe(false);
    });
  });

  describe('determineActiveSlot', () => {
    it('should select slot with higher save index', () => {
      const saveFile = createTestSaveFile(100, 200);
      const result = determineActiveSlot(saveFile);

      expect(result.activeSlot).toBe('B');
      expect(result.slotA.saveIndex).toBe(100);
      expect(result.slotB.saveIndex).toBe(200);
    });

    it('should select slot A when it has higher index', () => {
      const saveFile = createTestSaveFile(500, 400);
      const result = determineActiveSlot(saveFile);

      expect(result.activeSlot).toBe('A');
    });

    it('should handle save index wrapping (u32 overflow)', () => {
      // When one index wraps around, the "smaller" number is actually newer
      const saveFile = createTestSaveFile(0xFFFFFFFE, 0x00000001);
      const result = determineActiveSlot(saveFile);

      // Index 1 is newer (wrapped around)
      expect(result.activeSlot).toBe('B');
    });

    it('should throw on invalid save size', () => {
      const invalid = new ArrayBuffer(1024);
      expect(() => determineActiveSlot(invalid)).toThrow();
    });
  });

  describe('getSortedSections', () => {
    it('should sort sections by ID', () => {
      const saveFile = createTestSaveFile(100, 200);
      const slot = parseSaveSlot(saveFile, 0);
      
      // Shuffle sections
      slot.sections.reverse();
      
      const sorted = getSortedSections(slot);
      
      for (let i = 0; i < GEN3_NUM_SECTIONS; i++) {
        expect(sorted[i]?.id).toBe(i);
      }
    });

    it('should throw if missing sections', () => {
      const saveFile = createTestSaveFile(100, 200);
      const slot = parseSaveSlot(saveFile, 0);
      
      // Remove a section
      slot.sections.pop();
      
      expect(() => getSortedSections(slot)).toThrow();
    });
  });

  describe('Checksum roundtrip', () => {
    it('should calculate and verify matching checksums', () => {
      const data = new ArrayBuffer(GEN3_SECTION_DATA_SIZE);
      const view = new DataView(data);

      // Fill with test pattern
      for (let i = 0; i < GEN3_SECTION_DATA_SIZE; i += 4) {
        view.setUint32(i, i * 7, true);
      }

      const checksum = calculateSectionChecksum(data);

      // Verify by creating a section with this checksum
      const sectionBuffer = new ArrayBuffer(GEN3_SECTION_SIZE);
      const sectionView = new DataView(sectionBuffer);

      // Copy data
      new Uint8Array(sectionBuffer).set(new Uint8Array(data));

      // Set footer
      sectionView.setUint16(0xFF4, 0, true);
      sectionView.setUint16(0xFF6, checksum, true);
      sectionView.setUint32(0xFF8, GEN3_SECTION_SIGNATURE, true);
      sectionView.setUint32(0xFFC, 1, true);

      const section = parseSection(sectionBuffer, 0);
      const integrity = verifySectionIntegrity(section);

      expect(integrity.valid).toBe(true);
    });
  });
});
