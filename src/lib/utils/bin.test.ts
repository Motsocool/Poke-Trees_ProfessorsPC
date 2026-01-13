import { describe, it, expect } from 'vitest';
import {
  readU8,
  readU16,
  readU32,
  writeU8,
  writeU16,
  writeU32,
  safeSlice,
  copyBytes,
  readString,
  writeString,
  isAllZero,
} from './bin';

describe('Binary Utilities', () => {
  describe('readU8', () => {
    it('should read 8-bit unsigned integers', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint8(0, 0xFF);
      view.setUint8(1, 0x42);
      view.setUint8(2, 0x00);
      
      expect(readU8(view, 0)).toBe(0xFF);
      expect(readU8(view, 1)).toBe(0x42);
      expect(readU8(view, 2)).toBe(0x00);
    });

    it('should throw on out of bounds access', () => {
      const view = new DataView(new ArrayBuffer(4));
      expect(() => readU8(view, 4)).toThrow(RangeError);
      expect(() => readU8(view, -1)).toThrow(RangeError);
    });
  });

  describe('readU16', () => {
    it('should read 16-bit unsigned integers in little-endian', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      // 0x1234 in little-endian: 0x34 0x12
      view.setUint8(0, 0x34);
      view.setUint8(1, 0x12);
      
      expect(readU16(view, 0)).toBe(0x1234);
    });

    it('should throw on out of bounds access', () => {
      const view = new DataView(new ArrayBuffer(4));
      expect(() => readU16(view, 3)).toThrow(RangeError);
      expect(() => readU16(view, -1)).toThrow(RangeError);
    });
  });

  describe('readU32', () => {
    it('should read 32-bit unsigned integers in little-endian', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      // 0x12345678 in little-endian: 0x78 0x56 0x34 0x12
      view.setUint8(0, 0x78);
      view.setUint8(1, 0x56);
      view.setUint8(2, 0x34);
      view.setUint8(3, 0x12);
      
      expect(readU32(view, 0)).toBe(0x12345678);
    });

    it('should throw on out of bounds access', () => {
      const view = new DataView(new ArrayBuffer(4));
      expect(() => readU32(view, 1)).toThrow(RangeError);
      expect(() => readU32(view, -1)).toThrow(RangeError);
    });
  });

  describe('writeU8', () => {
    it('should write 8-bit unsigned integers', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      
      writeU8(view, 0, 0xFF);
      writeU8(view, 1, 0x42);
      
      expect(view.getUint8(0)).toBe(0xFF);
      expect(view.getUint8(1)).toBe(0x42);
    });

    it('should throw on out of bounds access', () => {
      const view = new DataView(new ArrayBuffer(4));
      expect(() => writeU8(view, 4, 0xFF)).toThrow(RangeError);
      expect(() => writeU8(view, -1, 0xFF)).toThrow(RangeError);
    });
  });

  describe('writeU16', () => {
    it('should write 16-bit unsigned integers in little-endian', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      
      writeU16(view, 0, 0x1234);
      
      expect(view.getUint8(0)).toBe(0x34);
      expect(view.getUint8(1)).toBe(0x12);
    });

    it('should throw on out of bounds access', () => {
      const view = new DataView(new ArrayBuffer(4));
      expect(() => writeU16(view, 3, 0x1234)).toThrow(RangeError);
    });
  });

  describe('writeU32', () => {
    it('should write 32-bit unsigned integers in little-endian', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      
      writeU32(view, 0, 0x12345678);
      
      expect(view.getUint8(0)).toBe(0x78);
      expect(view.getUint8(1)).toBe(0x56);
      expect(view.getUint8(2)).toBe(0x34);
      expect(view.getUint8(3)).toBe(0x12);
    });

    it('should throw on out of bounds access', () => {
      const view = new DataView(new ArrayBuffer(4));
      expect(() => writeU32(view, 1, 0x12345678)).toThrow(RangeError);
    });
  });

  describe('safeSlice', () => {
    it('should slice ArrayBuffer safely', () => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      for (let i = 0; i < 8; i++) {
        view.setUint8(i, i);
      }
      
      const sliced = safeSlice(buffer, 2, 6);
      const slicedView = new DataView(sliced);
      
      expect(sliced.byteLength).toBe(4);
      expect(slicedView.getUint8(0)).toBe(2);
      expect(slicedView.getUint8(3)).toBe(5);
    });

    it('should throw on invalid ranges', () => {
      const buffer = new ArrayBuffer(8);
      expect(() => safeSlice(buffer, -1, 4)).toThrow(RangeError);
      expect(() => safeSlice(buffer, 0, 9)).toThrow(RangeError);
      expect(() => safeSlice(buffer, 5, 4)).toThrow(RangeError);
    });
  });

  describe('copyBytes', () => {
    it('should copy bytes between DataViews', () => {
      const src = new ArrayBuffer(8);
      const srcView = new DataView(src);
      for (let i = 0; i < 8; i++) {
        srcView.setUint8(i, i + 10);
      }
      
      const dest = new ArrayBuffer(8);
      const destView = new DataView(dest);
      
      copyBytes(destView, 2, srcView, 3, 4);
      
      expect(destView.getUint8(2)).toBe(13);
      expect(destView.getUint8(3)).toBe(14);
      expect(destView.getUint8(4)).toBe(15);
      expect(destView.getUint8(5)).toBe(16);
    });

    it('should throw on out of bounds access', () => {
      const srcView = new DataView(new ArrayBuffer(8));
      const destView = new DataView(new ArrayBuffer(8));
      
      expect(() => copyBytes(destView, 0, srcView, 0, 9)).toThrow(RangeError);
      expect(() => copyBytes(destView, 5, srcView, 0, 4)).toThrow(RangeError);
    });
  });

  describe('readString', () => {
    it('should read null-terminated strings', () => {
      const buffer = new ArrayBuffer(10);
      const view = new DataView(buffer);
      const str = 'PIKACHU';
      for (let i = 0; i < str.length; i++) {
        view.setUint8(i, str.charCodeAt(i));
      }
      view.setUint8(str.length, 0xFF); // Terminator
      
      expect(readString(view, 0, 10)).toBe('PIKACHU');
    });

    it('should handle empty strings', () => {
      const view = new DataView(new ArrayBuffer(10));
      view.setUint8(0, 0xFF);
      expect(readString(view, 0, 10)).toBe('');
    });
  });

  describe('writeString', () => {
    it('should write strings with padding', () => {
      const buffer = new ArrayBuffer(10);
      const view = new DataView(buffer);
      
      writeString(view, 0, 'TEST', 10, 0xFF);
      
      expect(view.getUint8(0)).toBe('T'.charCodeAt(0));
      expect(view.getUint8(1)).toBe('E'.charCodeAt(0));
      expect(view.getUint8(2)).toBe('S'.charCodeAt(0));
      expect(view.getUint8(3)).toBe('T'.charCodeAt(0));
      expect(view.getUint8(4)).toBe(0xFF);
    });
  });

  describe('isAllZero', () => {
    it('should detect all-zero regions', () => {
      const buffer = new ArrayBuffer(10);
      const view = new DataView(buffer);
      
      expect(isAllZero(view, 0, 10)).toBe(true);
      
      view.setUint8(5, 1);
      expect(isAllZero(view, 0, 10)).toBe(false);
      expect(isAllZero(view, 0, 5)).toBe(true);
      expect(isAllZero(view, 6, 4)).toBe(true);
    });
  });

  describe('Roundtrip tests', () => {
    it('should roundtrip U16 values', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      
      const testValues = [0, 1, 0xFF, 0x1234, 0xFFFF];
      testValues.forEach((value, i) => {
        if (i * 2 >= buffer.byteLength) return;
        writeU16(view, 0, value);
        expect(readU16(view, 0)).toBe(value);
      });
    });

    it('should roundtrip U32 values', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      
      const testValues = [0, 1, 0xFF, 0x12345678, 0xFFFFFFFF];
      testValues.forEach(value => {
        writeU32(view, 0, value);
        expect(readU32(view, 0)).toBe(value >>> 0); // Force unsigned
      });
    });
  });
});
