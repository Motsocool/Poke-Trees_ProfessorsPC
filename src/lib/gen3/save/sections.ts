/**
 * Gen 3 save file section parsing and validation
 * Handles the 14 sections per save slot, checksums, and active slot detection
 */

import { readU16, readU32, safeSlice } from '../../utils/bin';
import {
  GEN3_SAVE_SIZE,
  GEN3_SAVE_SLOT_SIZE,
  GEN3_SECTION_SIZE,
  GEN3_SECTION_DATA_SIZE,
  GEN3_NUM_SECTIONS,
  GEN3_SAVE_SLOT_A,
  GEN3_SAVE_SLOT_B,
  SECTION_FOOTER_ID_OFFSET,
  SECTION_FOOTER_CHECKSUM_OFFSET,
  SECTION_FOOTER_SIGNATURE_OFFSET,
  SECTION_FOOTER_SAVE_INDEX_OFFSET,
  GEN3_SECTION_SIGNATURE,
} from './constants';

export interface SaveSection {
  id: number; // Section ID (0-13)
  data: ArrayBuffer; // 4084 bytes of section data
  checksum: number; // Stored checksum
  signature: number; // Should be 0x08012025
  saveIndex: number; // Save counter for determining active slot
}

export interface SaveSlot {
  sections: SaveSection[]; // Should have 14 sections
  saveIndex: number; // Overall save counter for this slot
  isValid: boolean; // Whether all sections are valid
}

/**
 * Validate a save file size
 */
export function validateSaveSize(buffer: ArrayBuffer): void {
  if (buffer.byteLength !== GEN3_SAVE_SIZE) {
    throw new Error(
      `Invalid save file size: expected ${GEN3_SAVE_SIZE} bytes (128KB), got ${buffer.byteLength} bytes`
    );
  }
}

/**
 * Parse a single section from a save slot
 */
export function parseSection(buffer: ArrayBuffer, offset: number): SaveSection {
  if (offset < 0 || offset + GEN3_SECTION_SIZE > buffer.byteLength) {
    throw new RangeError(`Invalid section offset: ${offset}`);
  }

  const sectionBuffer = safeSlice(buffer, offset, offset + GEN3_SECTION_SIZE);
  const view = new DataView(sectionBuffer);

  // Extract footer data (last 12 bytes)
  const id = readU16(view, SECTION_FOOTER_ID_OFFSET);
  const checksum = readU16(view, SECTION_FOOTER_CHECKSUM_OFFSET);
  const signature = readU32(view, SECTION_FOOTER_SIGNATURE_OFFSET);
  const saveIndex = readU32(view, SECTION_FOOTER_SAVE_INDEX_OFFSET);

  // Extract data portion (first 4084 bytes)
  const data = safeSlice(sectionBuffer, 0, GEN3_SECTION_DATA_SIZE);

  return {
    id,
    data,
    checksum,
    signature,
    saveIndex,
  };
}

/**
 * Calculate checksum for a section's data
 * Gen 3 section checksum is a 32-bit sum of all 32-bit words in the data,
 * then taking the upper 16 bits and lower 16 bits and adding them
 */
export function calculateSectionChecksum(data: ArrayBuffer): number {
  if (data.byteLength !== GEN3_SECTION_DATA_SIZE) {
    throw new Error(`Invalid data size for checksum: expected ${GEN3_SECTION_DATA_SIZE}, got ${data.byteLength}`);
  }

  const view = new DataView(data);
  let sum = 0;

  // Sum all 32-bit words
  for (let i = 0; i < GEN3_SECTION_DATA_SIZE; i += 4) {
    sum += readU32(view, i);
  }

  // Combine upper and lower 16 bits
  const upper = (sum >>> 16) & 0xFFFF;
  const lower = sum & 0xFFFF;
  const checksum = (upper + lower) & 0xFFFF;

  return checksum;
}

/**
 * Verify a section's integrity
 */
export function verifySectionIntegrity(section: SaveSection): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check section ID range
  if (section.id < 0 || section.id >= GEN3_NUM_SECTIONS) {
    errors.push(`Invalid section ID: ${section.id} (expected 0-${GEN3_NUM_SECTIONS - 1})`);
  }

  // Check signature
  if (section.signature !== GEN3_SECTION_SIGNATURE) {
    errors.push(
      `Invalid section signature: 0x${section.signature.toString(16)} (expected 0x${GEN3_SECTION_SIGNATURE.toString(16)})`
    );
  }

  // Verify checksum
  const calculated = calculateSectionChecksum(section.data);
  if (calculated !== section.checksum) {
    errors.push(
      `Checksum mismatch: calculated 0x${calculated.toString(16)}, stored 0x${section.checksum.toString(16)}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse all sections from a save slot
 */
export function parseSaveSlot(buffer: ArrayBuffer, slotOffset: number): SaveSlot {
  const sections: SaveSection[] = [];
  let maxSaveIndex = 0;
  let hasInvalidSection = false;

  for (let i = 0; i < GEN3_NUM_SECTIONS; i++) {
    const sectionOffset = slotOffset + i * GEN3_SECTION_SIZE;
    try {
      const section = parseSection(buffer, sectionOffset);
      sections.push(section);
      maxSaveIndex = Math.max(maxSaveIndex, section.saveIndex);

      // Check integrity
      const integrity = verifySectionIntegrity(section);
      if (!integrity.valid) {
        hasInvalidSection = true;
      }
    } catch (error) {
      hasInvalidSection = true;
      // Create a dummy invalid section
      sections.push({
        id: i,
        data: new ArrayBuffer(GEN3_SECTION_DATA_SIZE),
        checksum: 0,
        signature: 0,
        saveIndex: 0,
      });
    }
  }

  return {
    sections,
    saveIndex: maxSaveIndex,
    isValid: !hasInvalidSection && sections.length === GEN3_NUM_SECTIONS,
  };
}

/**
 * Determine which save slot is active based on save indices
 * The active slot is the one with the higher save index
 */
export function determineActiveSlot(buffer: ArrayBuffer): {
  activeSlot: 'A' | 'B';
  slotA: SaveSlot;
  slotB: SaveSlot;
} {
  validateSaveSize(buffer);

  const slotA = parseSaveSlot(buffer, GEN3_SAVE_SLOT_A);
  const slotB = parseSaveSlot(buffer, GEN3_SAVE_SLOT_B);

  // Compare save indices (handling 32-bit overflow)
  // The slot with the higher index is the active one
  let activeSlot: 'A' | 'B';

  if (!slotA.isValid && slotB.isValid) {
    activeSlot = 'B';
  } else if (slotA.isValid && !slotB.isValid) {
    activeSlot = 'A';
  } else {
    // Both valid or both invalid, use save index
    // Handle wrapping: if difference is very large, the smaller one is actually newer (wrapped)
    const diff = slotA.saveIndex - slotB.saveIndex;
    const threshold = 0x80000000; // Half of u32 max

    if (diff > 0 && diff < threshold) {
      activeSlot = 'A'; // A is newer
    } else {
      activeSlot = 'B'; // B is newer or wrapped
    }
  }

  return {
    activeSlot,
    slotA,
    slotB,
  };
}

/**
 * Get sections sorted by their ID (0-13)
 */
export function getSortedSections(slot: SaveSlot): SaveSection[] {
  const sorted = [...slot.sections];
  sorted.sort((a, b) => a.id - b.id);
  
  // Verify we have all section IDs 0-13
  const ids = sorted.map(s => s.id);
  const expectedIds = Array.from({ length: GEN3_NUM_SECTIONS }, (_, i) => i);
  
  for (const expectedId of expectedIds) {
    if (!ids.includes(expectedId)) {
      throw new Error(`Missing section ID ${expectedId}`);
    }
  }
  
  return sorted;
}
