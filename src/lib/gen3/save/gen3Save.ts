/**
 * Gen 3 save file operations
 * Handles loading, validation, extraction, injection, and export
 */

import {
  validateSaveSize,
  determineActiveSlot,
  getSortedSections,
  verifySectionIntegrity,
  calculateSectionChecksum,
  SaveSlot,
  SaveSection,
} from './sections';
import {
  decodePk3,
  encodePk3,
  isProbablyEmptyPk3,
  verifyPk3Checksum,
  Pk3Data,
} from '../pk3/pk3';
import { safeSlice, writeU16, writeU32 } from '../../utils/bin';
import {
  GEN3_SECTION_DATA_SIZE,
  PK3_SIZE,
  NUM_BOXES,
  BOX_SIZE,
  SECTION_ID_PC_BUFFER_A,
  SECTION_FOOTER_CHECKSUM_OFFSET,
  GEN3_SECTION_SIZE,
} from './constants';

export interface ExtractedPokemon {
  pk3: Pk3Data;
  box: number; // Box number (0-13)
  slot: number; // Slot number (0-29)
  isValid: boolean; // Whether checksum is valid
}

export interface Gen3Save {
  buffer: ArrayBuffer;
  activeSlot: 'A' | 'B';
  slot: SaveSlot;
  sections: SaveSection[];
}

/**
 * Load and validate a Gen 3 save file
 */
export function loadGen3Save(buffer: ArrayBuffer): Gen3Save {
  validateSaveSize(buffer);

  const { activeSlot, slotA, slotB } = determineActiveSlot(buffer);
  const slot = activeSlot === 'A' ? slotA : slotB;

  if (!slot.isValid) {
    throw new Error(`Active save slot ${activeSlot} is invalid or corrupted`);
  }

  const sections = getSortedSections(slot);

  // Verify all sections
  const invalidSections: number[] = [];
  for (const section of sections) {
    const integrity = verifySectionIntegrity(section);
    if (!integrity.valid) {
      invalidSections.push(section.id);
    }
  }

  if (invalidSections.length > 0) {
    throw new Error(`Invalid sections detected: ${invalidSections.join(', ')}`);
  }

  return {
    buffer,
    activeSlot,
    slot,
    sections,
  };
}

/**
 * Extract PC buffer data from sections 5-13
 * PC data is stored across 9 sections (IDs 5-13)
 */
export function extractPCBuffer(sections: SaveSection[]): ArrayBuffer {
  const pcSections = sections.filter(s => s.id >= SECTION_ID_PC_BUFFER_A && s.id <= 13);

  if (pcSections.length !== 9) {
    throw new Error(`Expected 9 PC sections, got ${pcSections.length}`);
  }

  // Sort by ID to ensure correct order
  pcSections.sort((a, b) => a.id - b.id);

  // Combine all PC section data
  const totalSize = pcSections.reduce((sum, s) => sum + s.data.byteLength, 0);
  const pcBuffer = new ArrayBuffer(totalSize);
  const pcView = new Uint8Array(pcBuffer);

  let offset = 0;
  for (const section of pcSections) {
    pcView.set(new Uint8Array(section.data), offset);
    offset += section.data.byteLength;
  }

  return pcBuffer;
}

/**
 * Extract all Pokémon from PC boxes
 */
export function extractPokemonFromSave(save: Gen3Save): ExtractedPokemon[] {
  const pcBuffer = extractPCBuffer(save.sections);
  const pokemon: ExtractedPokemon[] = [];

  // PC buffer structure: box data is sequential
  // Each box has 30 slots, each slot is 80 bytes
  let offset = 0;

  for (let box = 0; box < NUM_BOXES; box++) {
    for (let slot = 0; slot < BOX_SIZE; slot++) {
      const pk3Offset = offset;
      
      // Check if we have enough data
      if (pk3Offset + PK3_SIZE > pcBuffer.byteLength) {
        break;
      }

      const pk3Buffer = safeSlice(pcBuffer, pk3Offset, pk3Offset + PK3_SIZE);

      // Skip empty slots
      if (isProbablyEmptyPk3(pk3Buffer)) {
        offset += PK3_SIZE;
        continue;
      }

      try {
        const pk3 = decodePk3(pk3Buffer);
        const isValid = verifyPk3Checksum(pk3);

        pokemon.push({
          pk3,
          box,
          slot,
          isValid,
        });
      } catch (error) {
        // Skip corrupted Pokémon
        console.warn(`Failed to parse Pokémon at box ${box}, slot ${slot}:`, error);
      }

      offset += PK3_SIZE;
    }
  }

  return pokemon;
}

/**
 * Inject Pokémon back into PC boxes
 * Creates a new save buffer with updated Pokémon data
 */
export function injectPokemonToSave(
  originalSave: Gen3Save,
  pokemon: Array<{ pk3: Pk3Data; box: number; slot: number }>
): ArrayBuffer {
  // Create a copy of the original save buffer
  const newBuffer = originalSave.buffer.slice(0);

  // Extract current PC buffer
  const pcBuffer = extractPCBuffer(originalSave.sections);
  const pcBufferCopy = pcBuffer.slice(0);
  const pcView = new Uint8Array(pcBufferCopy);

  // Inject each Pokémon
  for (const { pk3, box, slot } of pokemon) {
    if (box < 0 || box >= NUM_BOXES) {
      throw new Error(`Invalid box number: ${box}`);
    }
    if (slot < 0 || slot >= BOX_SIZE) {
      throw new Error(`Invalid slot number: ${slot}`);
    }

    const offset = (box * BOX_SIZE + slot) * PK3_SIZE;
    const pk3Buffer = encodePk3(pk3);
    pcView.set(new Uint8Array(pk3Buffer), offset);
  }

  // Now we need to write the PC buffer back to sections and update checksums
  const slotOffset = originalSave.activeSlot === 'A' ? 0 : 0xE000;

  // Write PC data back to sections 5-13
  let pcOffset = 0;
  for (let sectionId = SECTION_ID_PC_BUFFER_A; sectionId <= 13; sectionId++) {
    const sectionOffset = slotOffset + sectionId * GEN3_SECTION_SIZE;
    const dataSize = Math.min(GEN3_SECTION_DATA_SIZE, pcBufferCopy.byteLength - pcOffset);

    if (dataSize <= 0) break;

    // Copy data to section
    const newBufferView = new Uint8Array(newBuffer);
    newBufferView.set(
      new Uint8Array(pcBufferCopy, pcOffset, dataSize),
      sectionOffset
    );

    // Recalculate and update section checksum
    const sectionData = safeSlice(newBuffer, sectionOffset, sectionOffset + GEN3_SECTION_DATA_SIZE);
    const checksum = calculateSectionChecksum(sectionData);

    // Write new checksum to section footer
    const checksumOffset = sectionOffset + SECTION_FOOTER_CHECKSUM_OFFSET;
    const view = new DataView(newBuffer);
    writeU16(view, checksumOffset, checksum);

    pcOffset += dataSize;
  }

  // Increment save index to make this the new active save
  const saveIndexOffset = slotOffset + (13 * GEN3_SECTION_SIZE) + 0xFFC; // Last section's save index
  const view = new DataView(newBuffer);
  const currentIndex = view.getUint32(saveIndexOffset, true);
  writeU32(view, saveIndexOffset, (currentIndex + 1) >>> 0);

  // Update save index for all sections in this slot
  for (let sectionId = 0; sectionId < 14; sectionId++) {
    const saveIdxOffset = slotOffset + (sectionId * GEN3_SECTION_SIZE) + 0xFFC;
    writeU32(view, saveIdxOffset, (currentIndex + 1) >>> 0);
  }

  return newBuffer;
}

/**
 * Export modified save file
 */
export function exportGen3Save(save: Gen3Save): ArrayBuffer {
  return save.buffer.slice(0);
}

/**
 * Validate that a save can be safely modified
 */
export function canSafelyModifySave(save: Gen3Save): {
  canModify: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check all sections are valid
  for (const section of save.sections) {
    const integrity = verifySectionIntegrity(section);
    if (!integrity.valid) {
      reasons.push(`Section ${section.id} failed integrity check: ${integrity.errors.join(', ')}`);
    }
  }

  return {
    canModify: reasons.length === 0,
    reasons,
  };
}
