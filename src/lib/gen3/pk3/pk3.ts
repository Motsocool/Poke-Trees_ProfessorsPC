/**
 * Gen 3 pk3 (80-byte Pokémon data structure) implementation
 * Handles encryption, decryption, shuffle, unshuffle, and checksum validation
 */

import { readU8, readU16, readU32, writeU16, writeU32, isAllZero } from '../../utils/bin';
import {
  PK3_SIZE,
  PK3_DATA_SIZE,
  PK3_PERSONALITY_OFFSET,
  PK3_OT_ID_OFFSET,
  PK3_CHECKSUM_OFFSET,
  PK3_DATA_OFFSET,
  PK3_SUBSTRUCTURE_ORDERS,
  PK3_GROWTH_SIZE,
  PK3_ATTACKS_SIZE,
  PK3_EVS_SIZE,
  PK3_MISC_SIZE,
} from '../save/constants';

export interface Pk3Data {
  personality: number; // PID
  otId: number; // Original Trainer ID (TID in lower 16 bits, SID in upper 16 bits)
  nickname: Uint8Array; // 10 bytes
  language: number;
  otName: Uint8Array; // 7 bytes
  markings: number;
  checksum: number;
  unknown: number;
  data: Uint8Array; // 48 bytes encrypted data
}

export interface Pk3Substructures {
  growth: Uint8Array; // 12 bytes
  attacks: Uint8Array; // 12 bytes
  evs: Uint8Array; // 12 bytes
  misc: Uint8Array; // 12 bytes
}

/**
 * Check if a pk3 structure is likely empty (all zeros)
 */
export function isProbablyEmptyPk3(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength !== PK3_SIZE) {
    return true;
  }
  const view = new DataView(buffer);
  return isAllZero(view, 0, PK3_SIZE);
}

/**
 * Decode a pk3 structure from an ArrayBuffer
 */
export function decodePk3(buffer: ArrayBuffer): Pk3Data {
  if (buffer.byteLength !== PK3_SIZE) {
    throw new Error(`Invalid pk3 size: expected ${PK3_SIZE}, got ${buffer.byteLength}`);
  }

  const view = new DataView(buffer);

  const personality = readU32(view, PK3_PERSONALITY_OFFSET);
  const otId = readU32(view, PK3_OT_ID_OFFSET);
  
  const nickname = new Uint8Array(10);
  for (let i = 0; i < 10; i++) {
    nickname[i] = readU8(view, 0x08 + i);
  }
  
  const language = readU16(view, 0x12);
  
  const otName = new Uint8Array(7);
  for (let i = 0; i < 7; i++) {
    otName[i] = readU8(view, 0x14 + i);
  }
  
  const markings = readU8(view, 0x1B);
  const checksum = readU16(view, PK3_CHECKSUM_OFFSET);
  const unknown = readU16(view, 0x1E);
  
  const data = new Uint8Array(PK3_DATA_SIZE);
  for (let i = 0; i < PK3_DATA_SIZE; i++) {
    data[i] = readU8(view, PK3_DATA_OFFSET + i);
  }

  return {
    personality,
    otId,
    nickname,
    language,
    otName,
    markings,
    checksum,
    unknown,
    data,
  };
}

/**
 * Encode a pk3 structure to an ArrayBuffer
 */
export function encodePk3(pk3: Pk3Data): ArrayBuffer {
  const buffer = new ArrayBuffer(PK3_SIZE);
  const view = new DataView(buffer);

  writeU32(view, PK3_PERSONALITY_OFFSET, pk3.personality);
  writeU32(view, PK3_OT_ID_OFFSET, pk3.otId);
  
  for (let i = 0; i < 10; i++) {
    view.setUint8(0x08 + i, pk3.nickname[i] ?? 0);
  }
  
  writeU16(view, 0x12, pk3.language);
  
  for (let i = 0; i < 7; i++) {
    view.setUint8(0x14 + i, pk3.otName[i] ?? 0);
  }
  
  view.setUint8(0x1B, pk3.markings);
  writeU16(view, PK3_CHECKSUM_OFFSET, pk3.checksum);
  writeU16(view, 0x1E, pk3.unknown);
  
  for (let i = 0; i < PK3_DATA_SIZE; i++) {
    view.setUint8(PK3_DATA_OFFSET + i, pk3.data[i] ?? 0);
  }

  return buffer;
}

/**
 * Decrypt the 48-byte data section of a pk3
 * XOR with (PID ^ OTID) word-wise (16-bit values)
 */
export function decryptPk3Data(encryptedData: Uint8Array, personality: number, otId: number): Uint8Array {
  if (encryptedData.length !== PK3_DATA_SIZE) {
    throw new Error(`Invalid data size for decryption: expected ${PK3_DATA_SIZE}, got ${encryptedData.length}`);
  }

  const key = (personality ^ otId) >>> 0; // Encryption key
  const decrypted = new Uint8Array(PK3_DATA_SIZE);
  const dataView = new DataView(encryptedData.buffer, encryptedData.byteOffset, encryptedData.byteLength);
  const decryptedView = new DataView(decrypted.buffer);

  // XOR 16-bit words with alternating halves of the 32-bit key
  const keyLow = key & 0xFFFF;
  const keyHigh = (key >>> 16) & 0xFFFF;

  for (let i = 0; i < PK3_DATA_SIZE; i += 4) {
    const word1 = readU16(dataView, i);
    const word2 = readU16(dataView, i + 2);
    
    writeU16(decryptedView, i, word1 ^ keyLow);
    writeU16(decryptedView, i + 2, word2 ^ keyHigh);
  }

  return decrypted;
}

/**
 * Encrypt the 48-byte data section of a pk3
 * Same as decryption (XOR is symmetric)
 */
export function encryptPk3Data(decryptedData: Uint8Array, personality: number, otId: number): Uint8Array {
  return decryptPk3Data(decryptedData, personality, otId);
}

/**
 * Unshuffle the decrypted 48-byte data into 4 substructures based on PID
 */
export function unshufflePk3Data(decryptedData: Uint8Array, personality: number): Pk3Substructures {
  if (decryptedData.length !== PK3_DATA_SIZE) {
    throw new Error(`Invalid data size for unshuffle: expected ${PK3_DATA_SIZE}, got ${decryptedData.length}`);
  }

  const order = PK3_SUBSTRUCTURE_ORDERS[personality % 24];
  if (!order) {
    throw new Error(`Invalid substructure order index: ${personality % 24}`);
  }

  // Create output arrays
  const growth = new Uint8Array(PK3_GROWTH_SIZE);
  const attacks = new Uint8Array(PK3_ATTACKS_SIZE);
  const evs = new Uint8Array(PK3_EVS_SIZE);
  const misc = new Uint8Array(PK3_MISC_SIZE);

  const outputs = [growth, attacks, evs, misc];

  // Unshuffle: read from shuffled positions, write to correct substructure
  for (let i = 0; i < 4; i++) {
    const sourceIndex = order.indexOf(i);
    const sourceOffset = sourceIndex * 12;
    const output = outputs[i];
    
    if (!output) {
      throw new Error(`Invalid output array at index ${i}`);
    }

    for (let j = 0; j < 12; j++) {
      output[j] = decryptedData[sourceOffset + j] ?? 0;
    }
  }

  return { growth, attacks, evs, misc };
}

/**
 * Shuffle the 4 substructures back into the 48-byte data based on PID
 */
export function shufflePk3Data(substructures: Pk3Substructures, personality: number): Uint8Array {
  const order = PK3_SUBSTRUCTURE_ORDERS[personality % 24];
  if (!order) {
    throw new Error(`Invalid substructure order index: ${personality % 24}`);
  }

  const shuffled = new Uint8Array(PK3_DATA_SIZE);
  const inputs = [substructures.growth, substructures.attacks, substructures.evs, substructures.misc];

  // Shuffle: read from correct substructure, write to shuffled position
  for (let i = 0; i < 4; i++) {
    const targetIndex = order[i];
    if (targetIndex === undefined) {
      throw new Error(`Invalid order value at index ${i}`);
    }
    const targetOffset = i * 12;
    const input = inputs[targetIndex];
    
    if (!input) {
      throw new Error(`Invalid input array at index ${targetIndex}`);
    }

    for (let j = 0; j < 12; j++) {
      shuffled[targetOffset + j] = input[j] ?? 0;
    }
  }

  return shuffled;
}

/**
 * Calculate the checksum for the 48-byte decrypted and unshuffled data
 * Checksum is the sum of all 16-bit words, modulo 0x10000
 */
export function calculatePk3Checksum(substructures: Pk3Substructures): number {
  let sum = 0;

  const allData = new Uint8Array(PK3_DATA_SIZE);
  allData.set(substructures.growth, 0);
  allData.set(substructures.attacks, 12);
  allData.set(substructures.evs, 24);
  allData.set(substructures.misc, 36);

  const view = new DataView(allData.buffer);
  
  for (let i = 0; i < PK3_DATA_SIZE; i += 2) {
    sum += readU16(view, i);
  }

  return (sum & 0xFFFF) >>> 0;
}

/**
 * Verify the checksum of a pk3
 */
export function verifyPk3Checksum(pk3: Pk3Data): boolean {
  const decrypted = decryptPk3Data(pk3.data, pk3.personality, pk3.otId);
  const substructures = unshufflePk3Data(decrypted, pk3.personality);
  const calculated = calculatePk3Checksum(substructures);
  return calculated === pk3.checksum;
}

/**
 * Complete decrypt and unshuffle operation
 */
export function decryptAndUnshufflePk3(pk3: Pk3Data): Pk3Substructures {
  const decrypted = decryptPk3Data(pk3.data, pk3.personality, pk3.otId);
  return unshufflePk3Data(decrypted, pk3.personality);
}

/**
 * Complete shuffle and encrypt operation
 */
export function shuffleAndEncryptPk3(substructures: Pk3Substructures, personality: number, otId: number): Uint8Array {
  const shuffled = shufflePk3Data(substructures, personality);
  return encryptPk3Data(shuffled, personality, otId);
}
