/**
 * Utility functions for parsing binary save data
 */

/**
 * Read a 8-bit unsigned integer from buffer
 */
export function readU8(buffer: Uint8Array, offset: number): number {
  return buffer[offset];
}

/**
 * Read a 16-bit unsigned integer (little-endian) from buffer
 */
export function readU16LE(buffer: Uint8Array, offset: number): number {
  return buffer[offset] | (buffer[offset + 1] << 8);
}

/**
 * Read a 32-bit unsigned integer (little-endian) from buffer
 */
export function readU32LE(buffer: Uint8Array, offset: number): number {
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  ) >>> 0; // Use unsigned right shift to ensure unsigned 32-bit
}

/**
 * Write a 8-bit unsigned integer to buffer
 */
export function writeU8(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xFF;
}

/**
 * Write a 16-bit unsigned integer (little-endian) to buffer
 */
export function writeU16LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xFF;
  buffer[offset + 1] = (value >> 8) & 0xFF;
}

/**
 * Write a 32-bit unsigned integer (little-endian) to buffer
 */
export function writeU32LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xFF;
  buffer[offset + 1] = (value >> 8) & 0xFF;
  buffer[offset + 2] = (value >> 16) & 0xFF;
  buffer[offset + 3] = (value >> 24) & 0xFF;
}

/**
 * Read a 24-bit unsigned integer (little-endian) from buffer
 * Used for experience values in Gen 1/2
 */
export function readU24LE(buffer: Uint8Array, offset: number): number {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

/**
 * Write a 24-bit unsigned integer (little-endian) to buffer
 */
export function writeU24LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xFF;
  buffer[offset + 1] = (value >> 8) & 0xFF;
  buffer[offset + 2] = (value >> 16) & 0xFF;
}

/**
 * Decode Gen 1/2 string (custom character encoding)
 * Gen 1/2 use a custom character set, not ASCII
 * 0x50 is the string terminator
 */
export function decodeGen12String(buffer: Uint8Array, offset: number, maxLength: number): string {
  const chars: string[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const byte = buffer[offset + i];
    
    // String terminator
    if (byte === 0x50 || byte === 0x00) {
      break;
    }
    
    // Convert Gen 1/2 character encoding to ASCII
    // This is a simplified mapping - full implementation would need complete character table
    const char = convertGen12Char(byte);
    chars.push(char);
  }
  
  return chars.join('');
}

/**
 * Convert Gen 1/2 character byte to ASCII character
 * Simplified mapping - a complete implementation would have all 256 characters
 */
function convertGen12Char(byte: number): string {
  // Uppercase letters (A-Z): 0x80-0x99
  if (byte >= 0x80 && byte <= 0x99) {
    return String.fromCharCode(65 + (byte - 0x80)); // A-Z
  }
  
  // Lowercase letters (a-z): 0xA0-0xB9
  if (byte >= 0xA0 && byte <= 0xB9) {
    return String.fromCharCode(97 + (byte - 0xA0)); // a-z
  }
  
  // Numbers (0-9): 0xF6-0xFF
  if (byte >= 0xF6 && byte <= 0xFF) {
    return String.fromCharCode(48 + (byte - 0xF6)); // 0-9
  }
  
  // Special characters
  switch (byte) {
    case 0x7F: return ' ';
    case 0xE1: return 'PK';
    case 0xE2: return 'MN';
    case 0xE6: return '-';
    case 0xE7: return '?';
    case 0xE8: return '!';
    case 0xF4: return '.';
    default: return '?'; // Unknown character
  }
}

/**
 * Encode string to Gen 1/2 format
 */
export function encodeGen12String(str: string, maxLength: number): Uint8Array {
  const buffer = new Uint8Array(maxLength);
  buffer.fill(0x50); // Fill with terminators
  
  for (let i = 0; i < Math.min(str.length, maxLength); i++) {
    buffer[i] = encodeGen12Char(str[i]);
  }
  
  return buffer;
}

/**
 * Encode a single character to Gen 1/2 format
 */
function encodeGen12Char(char: string): number {
  const code = char.charCodeAt(0);
  
  // Uppercase letters (A-Z)
  if (code >= 65 && code <= 90) {
    return 0x80 + (code - 65);
  }
  
  // Lowercase letters (a-z)
  if (code >= 97 && code <= 122) {
    return 0xA0 + (code - 97);
  }
  
  // Numbers (0-9)
  if (code >= 48 && code <= 57) {
    return 0xF6 + (code - 48);
  }
  
  // Special characters
  switch (char) {
    case ' ': return 0x7F;
    case '-': return 0xE6;
    case '?': return 0xE7;
    case '!': return 0xE8;
    case '.': return 0xF4;
    default: return 0x7F; // Space for unknown
  }
}

/**
 * Decode Gen 3 string (ASCII-like encoding)
 * Gen 3 uses a more standard encoding with 0xFF as terminator
 */
export function decodeGen3String(buffer: Uint8Array, offset: number, maxLength: number): string {
  const chars: string[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const byte = buffer[offset + i];
    
    // String terminator
    if (byte === 0xFF || byte === 0x00) {
      break;
    }
    
    const char = convertGen3Char(byte);
    chars.push(char);
  }
  
  return chars.join('');
}

/**
 * Convert Gen 3 character byte to ASCII
 */
function convertGen3Char(byte: number): string {
  // Spaces and basic punctuation
  if (byte === 0x00) return ' ';
  
  // Uppercase letters (A-Z): 0xBB-0xD4
  if (byte >= 0xBB && byte <= 0xD4) {
    return String.fromCharCode(65 + (byte - 0xBB));
  }
  
  // Lowercase letters (a-z): 0xD5-0xEE
  if (byte >= 0xD5 && byte <= 0xEE) {
    return String.fromCharCode(97 + (byte - 0xD5));
  }
  
  // Numbers (0-9): 0xA1-0xAA
  if (byte >= 0xA1 && byte <= 0xAA) {
    return String.fromCharCode(48 + (byte - 0xA1));
  }
  
  // Special characters
  switch (byte) {
    case 0xAC: return '!';
    case 0xAD: return '?';
    case 0xAE: return '.';
    case 0xAF: return '-';
    default: return '?';
  }
}

/**
 * Encode string to Gen 3 format
 */
export function encodeGen3String(str: string, maxLength: number): Uint8Array {
  const buffer = new Uint8Array(maxLength);
  buffer.fill(0xFF); // Fill with terminators
  
  for (let i = 0; i < Math.min(str.length, maxLength); i++) {
    buffer[i] = encodeGen3Char(str[i]);
  }
  
  return buffer;
}

/**
 * Encode a single character to Gen 3 format
 */
function encodeGen3Char(char: string): number {
  const code = char.charCodeAt(0);
  
  // Uppercase letters (A-Z)
  if (code >= 65 && code <= 90) {
    return 0xBB + (code - 65);
  }
  
  // Lowercase letters (a-z)
  if (code >= 97 && code <= 122) {
    return 0xD5 + (code - 97);
  }
  
  // Numbers (0-9)
  if (code >= 48 && code <= 57) {
    return 0xA1 + (code - 48);
  }
  
  // Special characters
  switch (char) {
    case ' ': return 0x00;
    case '!': return 0xAC;
    case '?': return 0xAD;
    case '.': return 0xAE;
    case '-': return 0xAF;
    default: return 0x00; // Space for unknown
  }
}

/**
 * Calculate checksum for Gen 1/2 save data
 */
export function calculateGen12Checksum(buffer: Uint8Array, start: number, length: number): number {
  let sum = 0;
  
  for (let i = 0; i < length; i++) {
    sum = (sum + buffer[start + i]) & 0xFF;
  }
  
  return (~sum + 1) & 0xFF; // Two's complement
}

/**
 * Calculate checksum for Gen 3 save section
 */
export function calculateGen3SectionChecksum(buffer: Uint8Array, offset: number, size: number): number {
  let checksum = 0;
  
  // Sum all 32-bit words in the section
  for (let i = 0; i < size; i += 4) {
    checksum = (checksum + readU32LE(buffer, offset + i)) >>> 0;
  }
  
  // Return upper 16 bits
  return (checksum >> 16) & 0xFFFF;
}
