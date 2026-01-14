/**
 * Save file normalization utilities
 * Handles files with extra bytes (headers, footers) from various emulators
 */

import { GEN1_SAVE_SIZE } from '../constants/gen1';

const GEN2_SAVE_SIZE = 0x8000; // 32,768 bytes - same as Gen 1

export interface NormalizationResult {
  normalized: ArrayBuffer;
  originalSize: number;
  targetSize: number;
  wasTrimmed: boolean;
  trimmedBytes: number;
}

/**
 * Normalize a Gen 1 save file (Red/Blue/Yellow) to exactly 32KB
 * Handles common file size variants from different emulators
 */
export function normalizeGen1Save(raw: ArrayBuffer): NormalizationResult {
  const originalSize = raw.byteLength;
  const targetSize = GEN1_SAVE_SIZE; // 0x8000 = 32,768 bytes

  // Already correct size
  if (originalSize === targetSize) {
    return {
      normalized: raw,
      originalSize,
      targetSize,
      wasTrimmed: false,
      trimmedBytes: 0,
    };
  }

  // Common case: File with extra bytes (headers/footers)
  // Most emulators add 0-512 bytes of metadata
  if (originalSize > targetSize && originalSize <= targetSize + 512) {
    // Trim from the start (some emulators add header)
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // File too large, try trimming from end
  if (originalSize > targetSize) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // File too small - cannot normalize
  throw new Error(
    `Gen 1 save file too small: ${originalSize} bytes (expected ${targetSize} bytes)`
  );
}

/**
 * Normalize a Gen 2 save file (Gold/Silver/Crystal) to exactly 32KB
 * Handles common file size variants from different emulators
 */
export function normalizeGen2Save(raw: ArrayBuffer): NormalizationResult {
  const originalSize = raw.byteLength;
  const targetSize = GEN2_SAVE_SIZE; // 0x8000 = 32,768 bytes

  // Already correct size
  if (originalSize === targetSize) {
    return {
      normalized: raw,
      originalSize,
      targetSize,
      wasTrimmed: false,
      trimmedBytes: 0,
    };
  }

  // Common case: Doubled save (0x10000 = 65,536 bytes)
  // Some emulators store two copies for backup
  if (originalSize === 0x10000) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: targetSize,
    };
  }

  // Files with extra bytes (headers/footers)
  // Allow up to 512 bytes of metadata
  if (originalSize > targetSize && originalSize <= targetSize + 512) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // File too large, try trimming from end
  if (originalSize > targetSize) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // File too small - cannot normalize
  throw new Error(
    `Gen 2 save file too small: ${originalSize} bytes (expected ${targetSize} bytes)`
  );
}

/**
 * Normalize a Gen 3 save file (Ruby/Sapphire/Emerald/FireRed/LeafGreen) to exactly 128KB
 * Handles common file size variants from different emulators
 */
export function normalizeGen3Save(raw: ArrayBuffer): NormalizationResult {
  const originalSize = raw.byteLength;
  const targetSize = 0x20000; // 131,072 bytes

  // Already correct size
  if (originalSize === targetSize) {
    return {
      normalized: raw,
      originalSize,
      targetSize,
      wasTrimmed: false,
      trimmedBytes: 0,
    };
  }

  // Common case: Files with RTC data appended (Flash1M saves)
  // Can be up to ~256 bytes extra
  if (originalSize > targetSize && originalSize <= targetSize + 256) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // Files with extra metadata
  if (originalSize > targetSize && originalSize <= targetSize + 512) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // File too large, try trimming from end
  if (originalSize > targetSize) {
    const trimmed = raw.slice(0, targetSize);
    return {
      normalized: trimmed,
      originalSize,
      targetSize,
      wasTrimmed: true,
      trimmedBytes: originalSize - targetSize,
    };
  }

  // File too small - cannot normalize
  throw new Error(
    `Gen 3 save file too small: ${originalSize} bytes (expected ${targetSize} bytes)`
  );
}

/**
 * Auto-detect and normalize a save file based on size
 * Returns normalized buffer and detected generation
 */
export function autoNormalizeSave(raw: ArrayBuffer): {
  normalized: ArrayBuffer;
  generation: 1 | 2 | 3;
  result: NormalizationResult;
} {
  const size = raw.byteLength;

  // Gen 1/2 detection (both are 32KB base)
  if (size >= 0x7000 && size <= 0x10200) {
    // Try Gen 2 first (more features)
    try {
      const result = normalizeGen2Save(raw);
      return { normalized: result.normalized, generation: 2, result };
    } catch {
      // Fall back to Gen 1
      const result = normalizeGen1Save(raw);
      return { normalized: result.normalized, generation: 1, result };
    }
  }

  // Gen 3 detection (128KB base)
  if (size >= 0x1F000 && size <= 0x20300) {
    const result = normalizeGen3Save(raw);
    return { normalized: result.normalized, generation: 3, result };
  }

  // Unknown size
  throw new Error(
    `Unable to detect save file generation from size: ${size} bytes\n` +
    `Expected:\n` +
    `- Gen 1/2: ~32KB (28,672 - 66,048 bytes)\n` +
    `- Gen 3: ~128KB (126,976 - 131,840 bytes)`
  );
}
