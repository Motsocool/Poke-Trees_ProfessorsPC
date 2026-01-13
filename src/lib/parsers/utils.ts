/**
 * Utility functions for parsing Gen 1/2/3 save data
 * Character encoding and checksum helpers
 */

import { readU8, writeU8 } from '../utils/bin.js';

/**
 * Gen 1/2 character encoding table
 * Maps game bytes to ASCII characters
 */
const GEN12_CHAR_MAP: { [key: number]: string } = {
  0x50: '', // String terminator
  0x00: '', // Empty/null
  
  // Uppercase letters (A-Z): 0x80-0x99
  0x80: 'A', 0x81: 'B', 0x82: 'C', 0x83: 'D', 0x84: 'E', 0x85: 'F', 0x86: 'G',
  0x87: 'H', 0x88: 'I', 0x89: 'J', 0x8A: 'K', 0x8B: 'L', 0x8C: 'M', 0x8D: 'N',
  0x8E: 'O', 0x8F: 'P', 0x90: 'Q', 0x91: 'R', 0x92: 'S', 0x93: 'T', 0x94: 'U',
  0x95: 'V', 0x96: 'W', 0x97: 'X', 0x98: 'Y', 0x99: 'Z',
  
  // Lowercase letters (a-z): 0xA0-0xB9
  0xA0: 'a', 0xA1: 'b', 0xA2: 'c', 0xA3: 'd', 0xA4: 'e', 0xA5: 'f', 0xA6: 'g',
  0xA7: 'h', 0xA8: 'i', 0xA9: 'j', 0xAA: 'k', 0xAB: 'l', 0xAC: 'm', 0xAD: 'n',
  0xAE: 'o', 0xAF: 'p', 0xB0: 'q', 0xB1: 'r', 0xB2: 's', 0xB3: 't', 0xB4: 'u',
  0xB5: 'v', 0xB6: 'w', 0xB7: 'x', 0xB8: 'y', 0xB9: 'z',
  
  // Numbers (0-9): 0xF6-0xFF
  0xF6: '0', 0xF7: '1', 0xF8: '2', 0xF9: '3', 0xFA: '4',
  0xFB: '5', 0xFC: '6', 0xFD: '7', 0xFE: '8', 0xFF: '9',
  
  // Special characters
  0x7F: ' ',
  0xE1: 'PK',
  0xE2: 'MN',
  0xE6: '-',
  0xE7: '?',
  0xE8: '!',
  0xF4: '.',
};

/**
 * Reverse map for encoding
 */
const GEN12_REVERSE_MAP: { [key: string]: number } = {};
for (const byteStr of Object.keys(GEN12_CHAR_MAP)) {
  const byte = parseInt(byteStr);
  const char = GEN12_CHAR_MAP[byte];
  if (char && char !== '') {
    GEN12_REVERSE_MAP[char] = byte;
  }
}

/**
 * Decode Gen 1/2 string from DataView
 */
export function decodeGen12String(view: DataView, offset: number, maxLength: number): string {
  const chars: string[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const byte = readU8(view, offset + i);
    
    // String terminator
    if (byte === 0x50 || byte === 0x00) {
      break;
    }
    
    const char = GEN12_CHAR_MAP[byte] || '?';
    if (char) {
      chars.push(char);
    }
  }
  
  return chars.join('');
}

/**
 * Encode string to Gen 1/2 format
 */
export function encodeGen12String(str: string, maxLength: number): ArrayBuffer {
  const buffer = new ArrayBuffer(maxLength);
  const view = new DataView(buffer);
  
  // Fill with terminators
  for (let i = 0; i < maxLength; i++) {
    writeU8(view, i, 0x50);
  }
  
  for (let i = 0; i < Math.min(str.length, maxLength); i++) {
    const char = str[i];
    if (char) {
      const byte = GEN12_REVERSE_MAP[char] || 0x7F; // Space for unknown
      writeU8(view, i, byte);
    }
  }
  
  return buffer;
}

/**
 * Calculate Gen 1/2 checksum (8-bit complement)
 */
export function calculateGen12Checksum(view: DataView, start: number, length: number): number {
  let sum = 0;
  
  for (let i = 0; i < length; i++) {
    sum = (sum + readU8(view, start + i)) & 0xFF;
  }
  
  // Two's complement
  return (~sum + 1) & 0xFF;
}

/**
 * Calculate Gen 3 section checksum (32-bit sum, return upper 16 bits)
 */
export function calculateGen3SectionChecksum(view: DataView, offset: number, size: number): number {
  let checksum = 0;
  
  // Sum all 32-bit words
  for (let i = 0; i < size; i += 4) {
    const word = view.getUint32(offset + i, true);
    checksum = (checksum + word) >>> 0; // Unsigned addition
  }
  
  // Combine upper and lower 16 bits
  return ((checksum >> 16) + (checksum & 0xFFFF)) & 0xFFFF;
}

/**
 * Read 24-bit value (for experience in Gen 1/2)
 */
export function readU24(view: DataView, offset: number): number {
  if (offset < 0 || offset + 3 > view.byteLength) {
    throw new RangeError(`readU24: offset ${offset} out of bounds`);
  }
  
  return readU8(view, offset) | 
         (readU8(view, offset + 1) << 8) | 
         (readU8(view, offset + 2) << 16);
}

/**
 * Write 24-bit value
 */
export function writeU24(view: DataView, offset: number, value: number): void {
  if (offset < 0 || offset + 3 > view.byteLength) {
    throw new RangeError(`writeU24: offset ${offset} out of bounds`);
  }
  
  writeU8(view, offset, value & 0xFF);
  writeU8(view, offset + 1, (value >> 8) & 0xFF);
  writeU8(view, offset + 2, (value >> 16) & 0xFF);
}
