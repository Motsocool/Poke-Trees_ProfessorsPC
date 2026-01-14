/**
 * Gen 3 save file injection system
 * Safely injects Pokémon into Gen 3 save files with integrity preservation
 */

import { readU16, readU32, writeU8, writeU16, writeU32 } from '../utils/bin.js';
import { encodePk3, type Pk3Data } from '../gen3/pk3/pk3.js';
import {
  GEN3_SAVE_SIZE,
  GEN3_SAVE_SLOT_SIZE,
  GEN3_NUM_SECTIONS,
  GEN3_SECTION_SIZE,
  GEN3_SECTION_DATA_SIZE,
  SECTION_ID_PC_BUFFER_A,
  PK3_SIZE,
} from '../gen3/save/constants.js';
import { calculateGen3SectionChecksum } from '../parsers/utils.js';

// Gen 3 has 14 boxes with 30 Pokémon each
const NUM_BOXES = 14;
const POKEMON_PER_BOX = 30;

export interface InjectionTarget {
  boxIndex: number; // 0-13 (14 boxes in Gen 3)
  slotIndex: number; // 0-29 (30 Pokémon per box)
}

export interface InjectionResult {
  success: boolean;
  error?: string;
  modifiedSections: number[];
}

/**
 * Inject a Pokémon into a specific box/slot in a Gen 3 save file
 */
export function injectPokemonToGen3Save(
  saveBuffer: ArrayBuffer,
  pk3Data: Pk3Data,
  target: InjectionTarget
): ArrayBuffer {
  // Validate save buffer
  if (saveBuffer.byteLength !== GEN3_SAVE_SIZE) {
    throw new Error(`Invalid save size: expected ${GEN3_SAVE_SIZE}, got ${saveBuffer.byteLength}`);
  }

  // Validate target
  if (target.boxIndex < 0 || target.boxIndex >= NUM_BOXES) {
    throw new Error(`Invalid box index: ${target.boxIndex} (must be 0-${NUM_BOXES - 1})`);
  }
  if (target.slotIndex < 0 || target.slotIndex >= POKEMON_PER_BOX) {
    throw new Error(`Invalid slot index: ${target.slotIndex} (must be 0-${POKEMON_PER_BOX - 1})`);
  }

  // Clone save buffer to avoid mutating input
  const newSave = saveBuffer.slice(0);
  const view = new DataView(newSave);

  // Find active save slot
  const slot0Index = readU32(view, GEN3_SAVE_SLOT_SIZE - 4);
  const slot1Index = readU32(view, GEN3_SAVE_SIZE - 4);
  const activeSaveOffset = slot0Index >= slot1Index ? 0 : GEN3_SAVE_SLOT_SIZE;

  // Calculate which section and offset within section
  const pokemonIndex = target.boxIndex * POKEMON_PER_BOX + target.slotIndex;
  const pcSectionIndex = Math.floor(pokemonIndex / 14); // ~14 Pokémon per PC section
  const sectionId = SECTION_ID_PC_BUFFER_A + pcSectionIndex;
  const offsetInPcData = (pokemonIndex % 14) * PK3_SIZE;

  // Find the section
  const sectionOffset = findSectionOffset(view, activeSaveOffset, sectionId);
  if (sectionOffset === -1) {
    throw new Error(`Could not find PC section ${sectionId} in save file`);
  }

  // Encode pk3 data
  const pk3Buffer = encodePk3(pk3Data);
  const pk3Bytes = new Uint8Array(pk3Buffer);

  // Write Pokémon data into section
  // PC sections have 4-byte header, then Pokémon data
  const writeOffset = sectionOffset + 4 + offsetInPcData;
  for (let i = 0; i < PK3_SIZE; i++) {
    writeU8(view, writeOffset + i, pk3Bytes[i] ?? 0);
  }

  // Recalculate section checksum
  const checksumValue = calculateGen3SectionChecksum(view, sectionOffset, GEN3_SECTION_DATA_SIZE);
  writeU16(view, sectionOffset + GEN3_SECTION_DATA_SIZE, checksumValue);

  // Increment save counter
  const saveCounterOffset = activeSaveOffset + (GEN3_NUM_SECTIONS * GEN3_SECTION_SIZE) - 4;
  const currentCounter = readU32(view, saveCounterOffset);
  writeU32(view, saveCounterOffset, (currentCounter + 1) >>> 0);

  return newSave;
}

/**
 * Inject multiple Pokémon into a Gen 3 save file
 */
export function injectMultiplePokemon(
  saveBuffer: ArrayBuffer,
  injections: Array<{ pk3Data: Pk3Data; target: InjectionTarget }>
): ArrayBuffer {
  let currentSave = saveBuffer;

  for (const { pk3Data, target } of injections) {
    currentSave = injectPokemonToGen3Save(currentSave, pk3Data, target);
  }

  return currentSave;
}

/**
 * Find a section by ID in the active save slot
 */
function findSectionOffset(view: DataView, saveSlotOffset: number, sectionId: number): number {
  for (let i = 0; i < GEN3_NUM_SECTIONS; i++) {
    const sectionOffset = saveSlotOffset + (i * GEN3_SECTION_SIZE);
    const footerOffset = sectionOffset + GEN3_SECTION_DATA_SIZE;
    const id = readU16(view, footerOffset);

    if (id === sectionId) {
      return sectionOffset;
    }
  }

  return -1;
}

/**
 * Validate injection target availability (check if slot is empty or can be overwritten)
 */
export function validateInjectionTarget(
  saveBuffer: ArrayBuffer,
  target: InjectionTarget
): { valid: boolean; reason?: string } {
  if (saveBuffer.byteLength !== GEN3_SAVE_SIZE) {
    return { valid: false, reason: 'Invalid save file size' };
  }

  if (target.boxIndex < 0 || target.boxIndex >= NUM_BOXES) {
    return { valid: false, reason: `Box index out of range (0-${NUM_BOXES - 1})` };
  }

  if (target.slotIndex < 0 || target.slotIndex >= POKEMON_PER_BOX) {
    return { valid: false, reason: `Slot index out of range (0-${POKEMON_PER_BOX - 1})` };
  }

  return { valid: true };
}

/**
 * Get list of empty slots in save file
 */
export function findEmptySlots(saveBuffer: ArrayBuffer): InjectionTarget[] {
  const view = new DataView(saveBuffer);
  const emptySlots: InjectionTarget[] = [];

  // Find active save slot
  const slot0Index = readU32(view, GEN3_SAVE_SLOT_SIZE - 4);
  const slot1Index = readU32(view, GEN3_SAVE_SIZE - 4);
  const activeSaveOffset = slot0Index >= slot1Index ? 0 : GEN3_SAVE_SLOT_SIZE;

  // Check each PC section for empty slots
  for (let boxIndex = 0; boxIndex < NUM_BOXES; boxIndex++) {
    for (let slotIndex = 0; slotIndex < POKEMON_PER_BOX; slotIndex++) {
      const pokemonIndex = boxIndex * POKEMON_PER_BOX + slotIndex;
      const pcSectionIndex = Math.floor(pokemonIndex / 14);
      const sectionId = SECTION_ID_PC_BUFFER_A + pcSectionIndex;
      const offsetInPcData = (pokemonIndex % 14) * PK3_SIZE;

      const sectionOffset = findSectionOffset(view, activeSaveOffset, sectionId);
      if (sectionOffset !== -1) {
        const readOffset = sectionOffset + 4 + offsetInPcData;

        // Check if slot is empty (all zeros or zero personality value)
        const personality = readU32(view, readOffset);
        if (personality === 0) {
          emptySlots.push({ boxIndex, slotIndex });
        }
      }
    }
  }

  return emptySlots;
}
