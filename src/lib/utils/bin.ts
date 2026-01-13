/**
 * Binary data utilities for reading and writing little-endian values
 * All operations include bounds checking to prevent buffer overruns
 */

/**
 * Read a 16-bit unsigned integer (little-endian) from a DataView
 */
export function readU16(view: DataView, offset: number): number {
  if (offset < 0 || offset + 2 > view.byteLength) {
    throw new RangeError(`readU16: offset ${offset} out of bounds (buffer size: ${view.byteLength})`);
  }
  return view.getUint16(offset, true); // true = little-endian
}

/**
 * Read a 32-bit unsigned integer (little-endian) from a DataView
 */
export function readU32(view: DataView, offset: number): number {
  if (offset < 0 || offset + 4 > view.byteLength) {
    throw new RangeError(`readU32: offset ${offset} out of bounds (buffer size: ${view.byteLength})`);
  }
  return view.getUint32(offset, true); // true = little-endian
}

/**
 * Read an 8-bit unsigned integer from a DataView
 */
export function readU8(view: DataView, offset: number): number {
  if (offset < 0 || offset + 1 > view.byteLength) {
    throw new RangeError(`readU8: offset ${offset} out of bounds (buffer size: ${view.byteLength})`);
  }
  return view.getUint8(offset);
}

/**
 * Write a 16-bit unsigned integer (little-endian) to a DataView
 */
export function writeU16(view: DataView, offset: number, value: number): void {
  if (offset < 0 || offset + 2 > view.byteLength) {
    throw new RangeError(`writeU16: offset ${offset} out of bounds (buffer size: ${view.byteLength})`);
  }
  view.setUint16(offset, value, true); // true = little-endian
}

/**
 * Write a 32-bit unsigned integer (little-endian) to a DataView
 */
export function writeU32(view: DataView, offset: number, value: number): void {
  if (offset < 0 || offset + 4 > view.byteLength) {
    throw new RangeError(`writeU32: offset ${offset} out of bounds (buffer size: ${view.byteLength})`);
  }
  view.setUint32(offset, value, true); // true = little-endian
}

/**
 * Write an 8-bit unsigned integer to a DataView
 */
export function writeU8(view: DataView, offset: number, value: number): void {
  if (offset < 0 || offset + 1 > view.byteLength) {
    throw new RangeError(`writeU8: offset ${offset} out of bounds (buffer size: ${view.byteLength})`);
  }
  view.setUint8(offset, value);
}

/**
 * Safely slice an ArrayBuffer with bounds checking
 */
export function safeSlice(buffer: ArrayBuffer, start: number, end: number): ArrayBuffer {
  if (start < 0 || start > buffer.byteLength) {
    throw new RangeError(`safeSlice: start ${start} out of bounds (buffer size: ${buffer.byteLength})`);
  }
  if (end < start || end > buffer.byteLength) {
    throw new RangeError(`safeSlice: end ${end} out of bounds (buffer size: ${buffer.byteLength}, start: ${start})`);
  }
  return buffer.slice(start, end);
}

/**
 * Copy bytes from one DataView to another with bounds checking
 */
export function copyBytes(dest: DataView, destOffset: number, src: DataView, srcOffset: number, length: number): void {
  if (srcOffset < 0 || srcOffset + length > src.byteLength) {
    throw new RangeError(`copyBytes: source range out of bounds`);
  }
  if (destOffset < 0 || destOffset + length > dest.byteLength) {
    throw new RangeError(`copyBytes: destination range out of bounds`);
  }
  
  const srcArray = new Uint8Array(src.buffer, src.byteOffset + srcOffset, length);
  const destArray = new Uint8Array(dest.buffer, dest.byteOffset + destOffset, length);
  destArray.set(srcArray);
}

/**
 * Read a null-terminated or fixed-length string from a DataView
 * Handles common Pokémon character encodings
 */
export function readString(view: DataView, offset: number, maxLength: number): string {
  if (offset < 0 || offset + maxLength > view.byteLength) {
    throw new RangeError(`readString: range out of bounds`);
  }
  
  const bytes: number[] = [];
  for (let i = 0; i < maxLength; i++) {
    const byte = view.getUint8(offset + i);
    if (byte === 0xFF || byte === 0x00) break; // Terminator
    bytes.push(byte);
  }
  
  // Simple ASCII mapping for now (will need proper Gen3 character map later)
  return bytes.map(b => String.fromCharCode(b)).join('');
}

/**
 * Write a string to a DataView with padding
 */
export function writeString(view: DataView, offset: number, str: string, maxLength: number, padByte = 0xFF): void {
  if (offset < 0 || offset + maxLength > view.byteLength) {
    throw new RangeError(`writeString: range out of bounds`);
  }
  
  const bytes = str.split('').map(c => c.charCodeAt(0));
  
  for (let i = 0; i < maxLength; i++) {
    if (i < bytes.length) {
      view.setUint8(offset + i, bytes[i]!);
    } else {
      view.setUint8(offset + i, padByte);
    }
  }
}

/**
 * Check if a buffer region is all zeros
 */
export function isAllZero(view: DataView, offset: number, length: number): boolean {
  if (offset < 0 || offset + length > view.byteLength) {
    throw new RangeError(`isAllZero: range out of bounds`);
  }
  
  for (let i = 0; i < length; i++) {
    if (view.getUint8(offset + i) !== 0) {
      return false;
    }
  }
  return true;
}
