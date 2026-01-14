/**
 * Comprehensive save file validation
 * Provides detailed error reporting and warnings for save files
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
}

export interface ValidationError {
  code: string;
  message: string;
  location?: string;
  severity: 'error';
}

export interface ValidationWarning {
  code: string;
  message: string;
  location?: string;
  severity: 'warning';
}

export interface ValidationInfo {
  code: string;
  message: string;
  severity: 'info';
}

export class SaveValidator {
  /**
   * Validate a save file buffer
   */
  static validateSaveFile(buffer: ArrayBuffer, expectedSize: number, generation: 1 | 2 | 3): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      info: [],
    };

    const actualSize = buffer.byteLength;

    // Check file size
    if (actualSize === expectedSize) {
      result.info.push({
        code: 'SIZE_OK',
        message: `File size is correct (${expectedSize} bytes)`,
        severity: 'info',
      });
    } else if (actualSize > expectedSize && actualSize <= expectedSize + 512) {
      result.warnings.push({
        code: 'SIZE_EXTRA_BYTES',
        message: `File has ${actualSize - expectedSize} extra bytes (emulator header/footer)`,
        location: 'File structure',
        severity: 'warning',
      });
    } else if (actualSize < expectedSize) {
      result.errors.push({
        code: 'SIZE_TOO_SMALL',
        message: `File is too small: ${actualSize} bytes (expected ${expectedSize})`,
        location: 'File structure',
        severity: 'error',
      });
      result.valid = false;
    } else {
      result.errors.push({
        code: 'SIZE_TOO_LARGE',
        message: `File is too large: ${actualSize} bytes (expected ${expectedSize})`,
        location: 'File structure',
        severity: 'error',
      });
      result.valid = false;
    }

    // Generation-specific validation
    switch (generation) {
      case 1:
        this.validateGen1Save(buffer, result);
        break;
      case 2:
        this.validateGen2Save(buffer, result);
        break;
      case 3:
        this.validateGen3Save(buffer, result);
        break;
    }

    return result;
  }

  /**
   * Validate Gen 1 save file
   */
  private static validateGen1Save(buffer: ArrayBuffer, result: ValidationResult): void {
    const view = new DataView(buffer);
    
    // Check for valid species IDs in first box
    try {
      const boxCount = view.getUint8(0x2D2);
      if (boxCount > 20) {
        result.warnings.push({
          code: 'GEN1_INVALID_BOX_COUNT',
          message: `Box count is ${boxCount} (expected ≤20)`,
          location: 'Box data',
          severity: 'warning',
        });
      }

      result.info.push({
        code: 'GEN1_BOX_COUNT',
        message: `Box contains ${boxCount} Pokémon`,
        severity: 'info',
      });
    } catch (err) {
      result.errors.push({
        code: 'GEN1_READ_ERROR',
        message: 'Failed to read box data',
        location: 'Box structure',
        severity: 'error',
      });
      result.valid = false;
    }
  }

  /**
   * Validate Gen 2 save file
   */
  private static validateGen2Save(buffer: ArrayBuffer, result: ValidationResult): void {
    const view = new DataView(buffer);
    
    // Check main checksum
    try {
      const storedChecksum = view.getUint16(0x2D69, true);
      const calculatedChecksum = this.calculateGen2Checksum(buffer);
      
      if (storedChecksum === calculatedChecksum) {
        result.info.push({
          code: 'GEN2_CHECKSUM_VALID',
          message: 'Main checksum is valid',
          severity: 'info',
        });
      } else {
        result.warnings.push({
          code: 'GEN2_CHECKSUM_INVALID',
          message: `Checksum mismatch (stored: ${storedChecksum.toString(16)}, calculated: ${calculatedChecksum.toString(16)})`,
          location: 'Save integrity',
          severity: 'warning',
        });
      }
    } catch (err) {
      result.errors.push({
        code: 'GEN2_CHECKSUM_ERROR',
        message: 'Failed to validate checksum',
        location: 'Save integrity',
        severity: 'error',
      });
    }
  }

  /**
   * Validate Gen 3 save file
   */
  private static validateGen3Save(buffer: ArrayBuffer, result: ValidationResult): void {
    const view = new DataView(buffer);
    
    // Check for valid save sections
    let validSections = 0;
    let invalidSections = 0;
    
    for (let i = 0; i < 14; i++) {
      const offset = i * 0x1000;
      try {
        // Check section ID (should be 0-13)
        const sectionId = view.getUint16(offset + 0xFF4, true);
        if (sectionId <= 13) {
          validSections++;
        } else {
          invalidSections++;
        }
      } catch (err) {
        invalidSections++;
      }
    }

    if (validSections === 14) {
      result.info.push({
        code: 'GEN3_SECTIONS_VALID',
        message: 'All 14 save sections are valid',
        severity: 'info',
      });
    } else {
      result.warnings.push({
        code: 'GEN3_SECTIONS_INVALID',
        message: `${invalidSections} invalid save sections found`,
        location: 'Save structure',
        severity: 'warning',
      });
    }
  }

  /**
   * Calculate Gen 2 checksum
   */
  private static calculateGen2Checksum(buffer: ArrayBuffer): number {
    const view = new DataView(buffer);
    let sum = 0;
    
    // Checksum covers 0x2009-0x2D68
    for (let i = 0x2009; i < 0x2D69; i++) {
      sum = (sum + view.getUint8(i)) & 0xFFFF;
    }
    
    return sum;
  }
}
