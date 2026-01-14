/**
 * Game version detection for Pokemon save files
 * 
 * Strategy:
 * 1. Primary: Check save file structure and specific game code bytes
 * 2. Secondary: Analyze Pokemon species distribution (Gen 1 vs Gen 2 vs Gen 3 exclusive Pokemon)
 * 3. Tertiary: Check save file size and other structural markers
 */

import { GameVersion } from '../types';

/**
 * Save file sizes for different generations
 */
const SAVE_FILE_SIZES = {
  GEN1_JAPANESE: 0x8000,    // 32KB - Red/Green/Blue/Yellow (Japanese)
  GEN1_INTERNATIONAL: 0x8000, // 32KB - Red/Blue/Yellow (International)
  GEN2: 0x8000,             // 32KB - Gold/Silver/Crystal
  GEN3: 0x20000,            // 128KB - Ruby/Sapphire/Emerald/FireRed/LeafGreen
};

/**
 * Detect Gen 3 game version from save file
 * Based on game code at specific offset in save data
 */
export function detectGen3Version(buffer: Uint8Array): GameVersion {
  // Gen 3 saves have a game code at offset 0xAC in Section 0
  // This is stored in the active save slot
  
  // Find active save slot (highest save index)
  const slot0SaveIndex = new DataView(buffer.buffer).getUint32(0x0FFC, true);
  const slot1SaveIndex = new DataView(buffer.buffer).getUint32(0x4FFC, true);
  const activeSaveOffset = slot0SaveIndex > slot1SaveIndex ? 0 : 0x4000;
  
  // Game code is at offset 0xAC in Section 0
  const gameCode = buffer[activeSaveOffset + 0xAC];
  
  // Game codes (documented from pokeemerald/pokefirered/pokeruby):
  // 0 = Ruby/Sapphire
  // 1 = FireRed/LeafGreen  
  // 2 = Emerald
  
  // Additional detection: Check for specific features
  // Emerald has Battle Frontier data, FR/LG have different map layouts
  
  // For now, we can make an educated guess based on structure
  // More sophisticated detection would check:
  // - Presence of Battle Frontier (Emerald-specific)
  // - Kanto vs Hoenn maps (FR/LG vs R/S/E)
  // - Version-exclusive Pokemon in party/boxes
  
  if (gameCode === 2) {
    return GameVersion.EMERALD;
  } else if (gameCode === 1) {
    // Check if it's FireRed or LeafGreen
    // Could check starter Pokemon or other version exclusives
    return GameVersion.FIRERED; // Default to FireRed
  } else {
    // Ruby or Sapphire - could check for version exclusives
    return GameVersion.RUBY; // Default to Ruby
  }
}

/**
 * Detect Gen 2 game version from save file
 * Gold/Silver/Crystal have different structures
 */
export function detectGen2Version(buffer: Uint8Array): GameVersion {
  // Crystal has an extra byte for gender selection at 0x3E3D
  // Crystal also has additional data structures
  
  // Check for Crystal-specific markers:
  // 1. Gender byte exists and is valid (0 or 1)
  // 2. Crystal has a different checksum algorithm
  // 3. Battle Tower data (Crystal-specific)
  
  const view = new DataView(buffer.buffer);
  
  // Crystal gender byte at 0x3E3D (0 = male, 1 = female)
  // In Gold/Silver, this location has different data
  const genderByte = buffer[0x3E3D];
  
  // Crystal-specific check: gender should be 0 or 1
  // Also check for Crystal battle tower data presence
  const hasBattleTowerData = buffer[0x1800] !== 0xFF || buffer[0x1801] !== 0xFF;
  
  if ((genderByte === 0 || genderByte === 1) && hasBattleTowerData) {
    return GameVersion.CRYSTAL;
  }
  
  // For Gold vs Silver, check for version-exclusive Pokemon
  // This would require scanning party and boxes
  // Default to Gold for now
  return GameVersion.GOLD;
}

/**
 * Detect Gen 1 game version from save file  
 * Red/Blue/Yellow have subtle differences
 */
export function detectGen1Version(buffer: Uint8Array): GameVersion {
  // Yellow has Pikachu starter and different sprite data
  // Yellow also has different Pikachu friendship mechanics
  
  // Check party for Pikachu as potential starter
  // Offset 0x2F2C is party Pokemon data
  const partyCount = buffer[0x2F2C];
  
  if (partyCount > 0 && partyCount <= 6) {
    // First Pokemon species at 0x2F2D
    const firstPokemon = buffer[0x2F2D];
    
    // Pikachu is species 25
    // If first party Pokemon is Pikachu and has low level (starter indication)
    if (firstPokemon === 25) {
      // Check OT name to see if it's default "ASH" or similar
      // Yellow-specific starter indicator
      return GameVersion.YELLOW;
    }
  }
  
  // For Red vs Blue, would need to check:
  // - Version-exclusive Pokemon (e.g., Oddish in Blue, Bellsprout in Red)
  // - This requires scanning boxes and party
  
  // Default to Red
  return GameVersion.RED;
}

/**
 * Detect game version using Pokemon species distribution
 * Fallback method when primary detection fails
 * 
 * Strategy: Check for generation-exclusive Pokemon
 * - Gen 1: Species 1-151 only
 * - Gen 2: Can have species 1-251, but 152+ are Gen 2 exclusive
 * - Gen 3: Can have species 1-386, but 252+ are Gen 3 exclusive
 */
export function detectVersionByPokemon(pokemonSpecies: number[]): 1 | 2 | 3 {
  const maxSpecies = Math.max(...pokemonSpecies.filter(s => s > 0));
  
  // Gen 3 Pokemon (252-386)
  if (maxSpecies >= 252) {
    return 3;
  }
  
  // Gen 2 Pokemon (152-251)
  if (maxSpecies >= 152) {
    return 2;
  }
  
  // Only Gen 1 Pokemon (1-151) or no Pokemon
  return 1;
}

/**
 * Get Pokemon species from a Gen 3 save file for version detection
 */
function getGen3PokemonSpecies(buffer: Uint8Array): number[] {
  const species: number[] = [];
  
  // Scan party and boxes for Pokemon species
  // This is a simplified version - full implementation would parse all boxes
  
  // Party is in Section 1 at offset 0x34
  // Each Pokemon is 100 bytes
  const activeSaveOffset = 0; // Would determine from save index
  const partyOffset = activeSaveOffset + 0x34;
  
  for (let i = 0; i < 6; i++) {
    const pokemonOffset = partyOffset + (i * 100);
    const personality = new DataView(buffer.buffer).getUint32(pokemonOffset, true);
    
    if (personality !== 0) {
      // Species is in encrypted data - would need to decrypt
      // For now, just mark as present
      species.push(1); // Placeholder
    }
  }
  
  return species;
}

/**
 * Main version detection function
 * Combines multiple strategies for accurate detection
 */
export function detectGameVersion(buffer: Uint8Array): { game: GameVersion; generation: 1 | 2 | 3 } {
  const fileSize = buffer.length;
  
  // Step 1: Determine generation by file size
  if (fileSize === SAVE_FILE_SIZES.GEN3) {
    // Gen 3 save
    const game = detectGen3Version(buffer);
    return { game, generation: 3 };
  } else if (fileSize === SAVE_FILE_SIZES.GEN2) {
    // Gen 1 or Gen 2 - both use 32KB
    // Need additional checks to differentiate
    
    // Check checksum algorithm and structure
    // Gen 2 has checksum at 0x2D0D, Gen 1 at different location
    const gen2ChecksumOffset = 0x2D0D;
    const gen2Checksum = new DataView(buffer.buffer).getUint16(gen2ChecksumOffset, true);
    
    // If checksum exists and is valid for Gen 2 structure, assume Gen 2
    if (gen2Checksum !== 0 && gen2Checksum !== 0xFFFF) {
      const game = detectGen2Version(buffer);
      return { game, generation: 2 };
    }
    
    // Otherwise assume Gen 1
    const game = detectGen1Version(buffer);
    return { game, generation: 1 };
  }
  
  // Unknown file size - default to Gen 1 Red
  return { game: GameVersion.RED, generation: 1 };
}
