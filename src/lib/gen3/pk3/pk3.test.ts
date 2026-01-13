import { describe, it, expect } from 'vitest';
import {
  decodePk3,
  encodePk3,
  decryptPk3Data,
  encryptPk3Data,
  unshufflePk3Data,
  shufflePk3Data,
  calculatePk3Checksum,
  verifyPk3Checksum,
  decryptAndUnshufflePk3,
  shuffleAndEncryptPk3,
  isProbablyEmptyPk3,
} from './pk3';
import { PK3_SIZE, PK3_DATA_SIZE } from '../save/constants';

describe('pk3 Structure', () => {
  describe('isProbablyEmptyPk3', () => {
    it('should detect empty pk3 (all zeros)', () => {
      const empty = new ArrayBuffer(PK3_SIZE);
      expect(isProbablyEmptyPk3(empty)).toBe(true);
    });

    it('should detect non-empty pk3', () => {
      const buffer = new ArrayBuffer(PK3_SIZE);
      const view = new DataView(buffer);
      view.setUint32(0, 0x12345678); // Set PID
      expect(isProbablyEmptyPk3(buffer)).toBe(false);
    });

    it('should reject invalid size', () => {
      const buffer = new ArrayBuffer(50);
      expect(isProbablyEmptyPk3(buffer)).toBe(true);
    });
  });

  describe('encode/decode roundtrip', () => {
    it('should roundtrip pk3 encoding and decoding', () => {
      const originalBuffer = new ArrayBuffer(PK3_SIZE);
      const view = new DataView(originalBuffer);
      
      // Set up a simple pk3
      view.setUint32(0x00, 0x12345678, true); // PID
      view.setUint32(0x04, 0xABCD1234, true); // OTID
      view.setUint16(0x1C, 0x4321, true); // Checksum
      
      const decoded = decodePk3(originalBuffer);
      expect(decoded.personality).toBe(0x12345678);
      expect(decoded.otId).toBe(0xABCD1234);
      expect(decoded.checksum).toBe(0x4321);
      
      const encoded = encodePk3(decoded);
      const decodedAgain = decodePk3(encoded);
      
      expect(decodedAgain.personality).toBe(decoded.personality);
      expect(decodedAgain.otId).toBe(decoded.otId);
      expect(decodedAgain.checksum).toBe(decoded.checksum);
    });
  });

  describe('encryption/decryption', () => {
    it('should decrypt and re-encrypt data (XOR is symmetric)', () => {
      const personality = 0x12345678;
      const otId = 0xABCD1234;
      
      const originalData = new Uint8Array(PK3_DATA_SIZE);
      for (let i = 0; i < PK3_DATA_SIZE; i++) {
        originalData[i] = i % 256;
      }
      
      const encrypted = encryptPk3Data(originalData, personality, otId);
      expect(encrypted).not.toEqual(originalData); // Should be different
      
      const decrypted = decryptPk3Data(encrypted, personality, otId);
      expect(decrypted).toEqual(originalData); // Should match original
    });

    it('should handle encryption with different keys', () => {
      const data = new Uint8Array(PK3_DATA_SIZE);
      for (let i = 0; i < PK3_DATA_SIZE; i++) {
        data[i] = 0xAA;
      }
      
      const encrypted1 = encryptPk3Data(data, 0x11111111, 0x22222222);
      const encrypted2 = encryptPk3Data(data, 0x33333333, 0x44444444);
      
      expect(encrypted1).not.toEqual(encrypted2); // Different keys = different results
    });

    it('should throw on invalid data size', () => {
      const invalidData = new Uint8Array(30);
      expect(() => decryptPk3Data(invalidData, 0, 0)).toThrow();
      expect(() => encryptPk3Data(invalidData, 0, 0)).toThrow();
    });
  });

  describe('shuffle/unshuffle', () => {
    it('should unshuffle and re-shuffle data based on PID', () => {
      const personality = 0x12345678;
      
      const originalData = new Uint8Array(PK3_DATA_SIZE);
      for (let i = 0; i < PK3_DATA_SIZE; i++) {
        originalData[i] = i;
      }
      
      const substructs = unshufflePk3Data(originalData, personality);
      expect(substructs.growth.length).toBe(12);
      expect(substructs.attacks.length).toBe(12);
      expect(substructs.evs.length).toBe(12);
      expect(substructs.misc.length).toBe(12);
      
      const reshuffled = shufflePk3Data(substructs, personality);
      expect(reshuffled).toEqual(originalData);
    });

    it('should handle different shuffle orders based on PID % 24', () => {
      const data = new Uint8Array(PK3_DATA_SIZE);
      for (let i = 0; i < PK3_DATA_SIZE; i++) {
        data[i] = i;
      }
      
      // Test a few different PIDs to ensure different orders work
      const pids = [0, 1, 5, 12, 23];
      
      pids.forEach(pid => {
        const substructs = unshufflePk3Data(data, pid);
        const reshuffled = shufflePk3Data(substructs, pid);
        expect(reshuffled).toEqual(data);
      });
    });

    it('should throw on invalid data size', () => {
      const invalidData = new Uint8Array(30);
      expect(() => unshufflePk3Data(invalidData, 0)).toThrow();
    });
  });

  describe('checksum calculation', () => {
    it('should calculate checksum as sum of 16-bit words', () => {
      const substructs = {
        growth: new Uint8Array(12),
        attacks: new Uint8Array(12),
        evs: new Uint8Array(12),
        misc: new Uint8Array(12),
      };
      
      // All zeros should have checksum 0
      expect(calculatePk3Checksum(substructs)).toBe(0);
      
      // Set some values
      const view = new DataView(substructs.growth.buffer);
      view.setUint16(0, 0x1234, true);
      view.setUint16(2, 0x5678, true);
      
      const checksum = calculatePk3Checksum(substructs);
      expect(checksum).toBe((0x1234 + 0x5678) & 0xFFFF);
    });

    it('should handle checksum overflow (mod 0x10000)', () => {
      const substructs = {
        growth: new Uint8Array(12),
        attacks: new Uint8Array(12),
        evs: new Uint8Array(12),
        misc: new Uint8Array(12),
      };
      
      // Fill with 0xFFFF to trigger overflow
      const allData = new Uint8Array(48);
      for (let i = 0; i < 48; i += 2) {
        allData[i] = 0xFF;
        allData[i + 1] = 0xFF;
      }
      allData.set(allData.slice(0, 12), 0);
      substructs.growth.set(allData.slice(0, 12));
      substructs.attacks.set(allData.slice(0, 12));
      substructs.evs.set(allData.slice(0, 12));
      substructs.misc.set(allData.slice(0, 12));
      
      const checksum = calculatePk3Checksum(substructs);
      expect(checksum).toBeLessThan(0x10000);
    });
  });

  describe('checksum verification', () => {
    it('should verify valid checksum', () => {
      const personality = 0x12345678;
      const otId = 0xABCD1234;
      
      // Create substructures with known data
      const substructs = {
        growth: new Uint8Array(12),
        attacks: new Uint8Array(12),
        evs: new Uint8Array(12),
        misc: new Uint8Array(12),
      };
      
      // Calculate correct checksum
      const checksum = calculatePk3Checksum(substructs);
      
      // Create pk3 with encrypted data
      const shuffled = shufflePk3Data(substructs, personality);
      const encrypted = encryptPk3Data(shuffled, personality, otId);
      
      const pk3 = {
        personality,
        otId,
        nickname: new Uint8Array(10),
        language: 0,
        otName: new Uint8Array(7),
        markings: 0,
        checksum,
        unknown: 0,
        data: encrypted,
      };
      
      expect(verifyPk3Checksum(pk3)).toBe(true);
    });

    it('should detect invalid checksum', () => {
      const personality = 0x12345678;
      const otId = 0xABCD1234;
      
      const substructs = {
        growth: new Uint8Array(12),
        attacks: new Uint8Array(12),
        evs: new Uint8Array(12),
        misc: new Uint8Array(12),
      };
      
      const shuffled = shufflePk3Data(substructs, personality);
      const encrypted = encryptPk3Data(shuffled, personality, otId);
      
      const pk3 = {
        personality,
        otId,
        nickname: new Uint8Array(10),
        language: 0,
        otName: new Uint8Array(7),
        markings: 0,
        checksum: 0xFFFF, // Wrong checksum
        unknown: 0,
        data: encrypted,
      };
      
      expect(verifyPk3Checksum(pk3)).toBe(false);
    });
  });

  describe('Complete decrypt/encrypt roundtrip', () => {
    it('should complete full encrypt->decrypt->encrypt cycle', () => {
      const personality = 0xABCDEF01;
      const otId = 0x12345678;
      
      // Create original substructures
      const originalSubstructs = {
        growth: new Uint8Array(12),
        attacks: new Uint8Array(12),
        evs: new Uint8Array(12),
        misc: new Uint8Array(12),
      };
      
      // Fill with test data
      for (let i = 0; i < 12; i++) {
        originalSubstructs.growth[i] = i;
        originalSubstructs.attacks[i] = i + 12;
        originalSubstructs.evs[i] = i + 24;
        originalSubstructs.misc[i] = i + 36;
      }
      
      // Shuffle and encrypt
      const encrypted = shuffleAndEncryptPk3(originalSubstructs, personality, otId);
      
      // Create pk3
      const pk3 = {
        personality,
        otId,
        nickname: new Uint8Array(10),
        language: 0,
        otName: new Uint8Array(7),
        markings: 0,
        checksum: calculatePk3Checksum(originalSubstructs),
        unknown: 0,
        data: encrypted,
      };
      
      // Decrypt and unshuffle
      const decrypted = decryptAndUnshufflePk3(pk3);
      
      // Verify it matches original
      expect(decrypted.growth).toEqual(originalSubstructs.growth);
      expect(decrypted.attacks).toEqual(originalSubstructs.attacks);
      expect(decrypted.evs).toEqual(originalSubstructs.evs);
      expect(decrypted.misc).toEqual(originalSubstructs.misc);
      
      // Verify checksum
      expect(verifyPk3Checksum(pk3)).toBe(true);
    });
  });
});
