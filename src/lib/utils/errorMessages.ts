/**
 * Utility functions for creating user-friendly error messages
 * Detects common error patterns and provides helpful guidance
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  technicalDetails?: string;
  suggestions: string[];
}

/**
 * Convert technical error messages into user-friendly messages
 */
export function makeErrorUserFriendly(error: Error): UserFriendlyError {
  const message = error.message;

  // Gen 3 corrupted section IDs
  if (message.includes('Corrupted save file') && message.includes('invalid IDs')) {
    return {
      title: '❌ Corrupted Save File Detected',
      message: 'This save file appears to be corrupted or invalid and cannot be used.',
      technicalDetails: extractCorruptionDetails(message),
      suggestions: [
        'Try re-dumping the save file from your cartridge or emulator',
        'Ensure you are using a valid Gen 3 save file (Ruby/Sapphire/Emerald/FireRed/LeafGreen)',
        'Check that the file has not been modified by external tools that may have corrupted it',
        'If using an emulator, try using a different save state or save backup',
      ],
    };
  }

  // Gen 3 missing sections
  if (message.includes('Missing required section IDs')) {
    return {
      title: '❌ Incomplete Save File',
      message: 'This save file is missing critical data sections and cannot be used.',
      technicalDetails: message,
      suggestions: [
        'Re-dump the save file from your cartridge or emulator',
        'Ensure the entire save file was exported (should be exactly 128KB)',
        'Try using a different save backup if available',
      ],
    };
  }

  // Gen 3 duplicate sections
  if (message.includes('duplicate section IDs')) {
    return {
      title: '❌ Corrupted Save Structure',
      message: 'This save file has duplicate data sections, indicating corruption.',
      technicalDetails: message,
      suggestions: [
        'Try re-dumping the save file',
        'If using an emulator, try loading an earlier save state',
        'Use the backup save slot if your game/emulator has one',
      ],
    };
  }

  // Gen 2 checksum mismatch (warning - should still work)
  if (message.includes('Gen 2 checksum mismatch')) {
    return {
      title: '⚠️ Checksum Warning',
      message: 'The save file checksum does not match. The file may have been modified or is from an incompatible source.',
      technicalDetails: message,
      suggestions: [
        'If the file is from a legitimate cartridge dump, it may still work',
        'Try re-dumping the save to get a clean copy',
        'Check if the file was modified by save editors or other tools',
      ],
    };
  }

  // Invalid save size
  if (message.includes('Invalid') && message.includes('save file size')) {
    return {
      title: '❌ Invalid File Size',
      message: 'This file is not the correct size for a Pokémon save file.',
      technicalDetails: message,
      suggestions: [
        'Gen 1/2 save files should be 32KB (32,768 bytes)',
        'Gen 3 save files should be 128KB (131,072 bytes)',
        'Ensure you exported the save file correctly from your emulator or cartridge',
        'Do not use save states - use the actual save file (usually with .sav extension)',
      ],
    };
  }

  // Section not found during injection
  if (message.includes('Could not find PC section')) {
    return {
      title: '❌ Cannot Access Save Data',
      message: 'The save file structure is corrupted and cannot be modified safely.',
      technicalDetails: message,
      suggestions: [
        'The save file has invalid section identifiers',
        'Re-dump the save file from your cartridge or emulator',
        'Try using a different save backup if available',
      ],
    };
  }

  // Generic save integrity failure
  if (message.includes('integrity checks') || message.includes('failed validation')) {
    return {
      title: '❌ Save File Validation Failed',
      message: 'This save file failed integrity checks and may be corrupted or invalid.',
      technicalDetails: message,
      suggestions: [
        'Verify the save file is from a legitimate cartridge or emulator',
        'Re-dump the save file',
        'Check that no external tools have modified the file',
      ],
    };
  }

  // Default: return a generic but friendly error
  return {
    title: '❌ Import Error',
    message: 'An error occurred while processing the save file.',
    technicalDetails: message,
    suggestions: [
      'Ensure you are using a valid Pokémon save file',
      'Try re-exporting the save from your emulator or cartridge',
      'Check that the file has not been corrupted',
    ],
  };
}

/**
 * Extract relevant corruption details from error message
 */
function extractCorruptionDetails(message: string): string {
  // Extract section IDs if present
  const sectionIdsMatch = message.match(/Found IDs: \[([^\]]+)\]/);
  if (sectionIdsMatch && sectionIdsMatch[1]) {
    const ids = sectionIdsMatch[1];
    // Find invalid IDs (should be 0-13)
    const idList = ids.split(',').map(s => parseInt(s.trim()));
    const invalidIds = idList.filter(id => id < 0 || id > 13);
    
    if (invalidIds.length > 0) {
      return `Found invalid section ID(s): ${invalidIds.join(', ')}. Valid section IDs are 0-13.`;
    }
  }

  // Return first sentence of technical message
  const firstSentence = message.split('.')[0];
  return firstSentence ? firstSentence + '.' : message;
}

/**
 * Format a UserFriendlyError for display in UI
 */
export function formatErrorForDisplay(userError: UserFriendlyError, showTechnical: boolean = false): string {
  let result = `${userError.title}\n\n${userError.message}`;

  if (userError.suggestions.length > 0) {
    result += '\n\n💡 Suggestions:';
    userError.suggestions.forEach(suggestion => {
      result += `\n  • ${suggestion}`;
    });
  }

  if (showTechnical && userError.technicalDetails) {
    result += `\n\n🔍 Technical details:\n${userError.technicalDetails}`;
  }

  return result;
}
