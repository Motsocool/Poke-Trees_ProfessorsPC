/**
 * Encounter Generator
 * Generates Pokémon from encounter definitions with proper game logic
 */

import {
  Encounter,
  Gen3MysteryGiftEncounter,
  Gen3TicketIslandEncounter,
  Gen2OddEggEncounter,
  Gen3InGameEggEncounter,
  GameCubeBoxEggEncounter,
  GameCubeBonusDiscEncounter,
  N64StadiumGiftEncounter,
} from './encounterTypes';
import { Pk3Data } from '../gen3/pk3/pk3';
import { encodeGen3String } from '../species/speciesTranscode';
import { StoredPokemon, serializePk3ForStorage } from '../db/vaultDb';

/**
 * Generate a random personality value (PID)
 */
function generatePID(rngSeed?: number): number {
  if (rngSeed !== undefined) {
    // Seeded RNG for reproducibility
    const x = Math.sin(rngSeed) * 10000;
    return Math.floor((x - Math.floor(x)) * 0xFFFFFFFF);
  }
  return Math.floor(Math.random() * 0xFFFFFFFF);
}

/**
 * Generate random IVs (0-31 for each stat)
 */
function generateRandomIVs(rngSeed?: number) {
  const random = rngSeed !== undefined
    ? () => {
        const x = Math.sin(rngSeed!) * 10000;
        return x - Math.floor(x);
      }
    : Math.random;

  return {
    hp: Math.floor(random() * 32),
    atk: Math.floor(random() * 32),
    def: Math.floor(random() * 32),
    spe: Math.floor(random() * 32),
    spa: Math.floor(random() * 32),
    spd: Math.floor(random() * 32),
  };
}

/**
 * Pack IVs into Gen 3 format (30 bits)
 */
function packIVs(ivs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number }): number {
  return (
    ivs.hp |
    (ivs.atk << 5) |
    (ivs.def << 10) |
    (ivs.spe << 15) |
    (ivs.spa << 20) |
    (ivs.spd << 25)
  );
}

/**
 * Calculate checksum for pk3 data
 */
function calculatePk3Checksum(data: Uint8Array): number {
  let checksum = 0;
  for (let i = 0; i < data.length; i += 2) {
    const byte1 = data[i] ?? 0;
    const byte2 = data[i + 1] ?? 0;
    const word = byte1 | (byte2 << 8);
    checksum = (checksum + word) & 0xFFFF;
  }
  return checksum;
}

/**
 * Create pk3 data structure
 */
function createPk3Data(
  species: number,
  level: number,
  otName: string,
  tid: number,
  sid: number,
  moves: number[],
  ball: number,
  fatefulEncounter: boolean,
  ivs?: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number },
  ribbons?: number[],
  heldItem?: number,
  rngSeed?: number
): Pk3Data {
  const personality = generatePID(rngSeed);
  const otId = tid | (sid << 16);
  
  // Encode names
  const nickname = encodeGen3String(getSpeciesName(species), 10);
  const otNameEncoded = encodeGen3String(otName, 7);
  
  // Create data buffer (48 bytes)
  const data = new Uint8Array(48);
  
  // Substructure 0 (Growth): Species, Item, Experience
  data[0] = species & 0xFF;
  data[1] = (species >> 8) & 0xFF;
  
  const item = heldItem || 0;
  data[2] = item & 0xFF;
  data[3] = (item >> 8) & 0xFF;
  
  // Experience (approximate for level)
  const exp = level * level * level;
  data[4] = exp & 0xFF;
  data[5] = (exp >> 8) & 0xFF;
  data[6] = (exp >> 16) & 0xFF;
  data[7] = (exp >> 24) & 0xFF;
  
  // Substructure 1 (Attacks): Moves and PP
  for (let i = 0; i < 4; i++) {
    const move = moves[i] || 0;
    data[12 + i * 2] = move & 0xFF;
    data[13 + i * 2] = (move >> 8) & 0xFF;
    data[20 + i] = move > 0 ? 35 : 0; // Default PP
  }
  
  // Substructure 2 (EVs): All zeros for event Pokémon
  // Bytes 24-35 stay zero
  
  // Substructure 3 (Misc): IVs, Ribbons
  const ivsToUse = ivs || generateRandomIVs(rngSeed);
  const packedIVs = packIVs(ivsToUse);
  data[36] = packedIVs & 0xFF;
  data[37] = (packedIVs >> 8) & 0xFF;
  data[38] = (packedIVs >> 16) & 0xFF;
  data[39] = (packedIVs >> 24) & 0xFF;
  
  // Ribbons and fateful encounter
  if (ribbons && ribbons.length > 0) {
    data[40] = ribbons[0] ?? 0;
    data[41] = ribbons[1] ?? 0;
    data[42] = ribbons[2] ?? 0;
    data[43] = ribbons[3] ?? 0;
  }
  
  if (fatefulEncounter) {
    data[40] = (data[40] ?? 0) | 0x80; // Set bit 7 for fateful encounter
  }
  
  const checksum = calculatePk3Checksum(data);
  
  return {
    personality,
    otId,
    nickname,
    language: 2, // English
    otName: otNameEncoded,
    markings: 0,
    checksum,
    unknown: 0,
    data,
  };
}

/**
 * Get species name (simplified - would use actual name lookup in production)
 */
function getSpeciesName(species: number): string {
  const names: Record<number, string> = {
    25: 'PIKACHU',
    54: 'PSYDUCK',
    83: 'FARFETCH\'D',
    151: 'MEW',
    172: 'PICHU',
    173: 'CLEFFA',
    174: 'IGGLYBUFF',
    175: 'TOGEPI',
    207: 'GLIGAR',
    236: 'TYROGUE',
    238: 'SMOOCHUM',
    239: 'ELEKID',
    240: 'MAGBY',
    243: 'RAIKOU',
    244: 'ENTEI',
    245: 'SUICUNE',
    249: 'LUGIA',
    250: 'HO-OH',
    251: 'CELEBI',
    263: 'ZIGZAGOON',
    300: 'SKITTY',
    333: 'SWABLU',
    360: 'WYNAUT',
    380: 'LATIAS',
    381: 'LATIOS',
    385: 'JIRACHI',
    386: 'DEOXYS',
  };
  return names[species] || `SPECIES${species}`;
}

/**
 * Generate from Gen 3 Mystery Gift
 */
function generateFromGen3MysteryGift(encounter: Gen3MysteryGiftEncounter, rngSeed?: number): Pk3Data {
  return createPk3Data(
    encounter.species,
    encounter.level,
    encounter.otName,
    encounter.tid,
    encounter.sid,
    encounter.moves,
    encounter.ball,
    encounter.fatefulEncounter,
    encounter.ivs,
    encounter.ribbons,
    encounter.heldItem,
    rngSeed
  );
}

/**
 * Generate from Gen 3 Ticket Island
 * These are wild encounters, not gifts - no fixed OT/TID, player catches them
 */
function generateFromGen3TicketIsland(encounter: Gen3TicketIslandEncounter, rngSeed?: number): Pk3Data {
  // Ticket island Pokémon are wild encounters
  // They will have the player's OT/TID when caught
  return createPk3Data(
    encounter.species,
    encounter.level,
    'PLAYER', // Placeholder - would be replaced with actual player OT
    12345, // Placeholder TID
    0, // Placeholder SID
    [], // Wild Pokémon learn moves by level
    4, // Poké Ball (most common)
    false, // Not fateful encounter (wild catch)
    undefined,
    undefined,
    undefined,
    rngSeed
  );
}

/**
 * Generate from Gen 2 Odd Egg
 * Always shiny, random species from pool, has Dizzy Punch
 */
function generateFromGen2OddEgg(encounter: Gen2OddEggEncounter, rngSeed?: number): Pk3Data {
  // Select random species from pool
  const random = rngSeed !== undefined ? Math.sin(rngSeed) * 10000 - Math.floor(Math.sin(rngSeed) * 10000) : Math.random();
  const speciesIndex = Math.floor(random * encounter.speciesPool.length);
  const species = encounter.speciesPool[speciesIndex] ?? encounter.speciesPool[0]!;
  
  // Odd Egg Pokémon have player's OT/TID and are always shiny
  return createPk3Data(
    species,
    encounter.level,
    'PLAYER', // Player's OT
    12345, // Player's TID
    0,
    encounter.specialMove ? [encounter.specialMove, 0, 0, 0] : [],
    4, // Hatched from egg
    false, // Gen 2 doesn't have fateful encounter
    undefined,
    undefined,
    undefined,
    rngSeed
  );
}

/**
 * Generate from Gen 3 In-Game Egg
 */
function generateFromGen3InGameEgg(encounter: Gen3InGameEggEncounter, rngSeed?: number): Pk3Data {
  return createPk3Data(
    encounter.species,
    encounter.level,
    'PLAYER', // Hatched eggs have player's OT
    12345,
    0,
    [],
    4,
    false, // In-game eggs don't have fateful encounter
    undefined,
    undefined,
    undefined,
    rngSeed
  );
}

/**
 * Generate from GameCube Box Egg
 */
function generateFromGameCubeBoxEgg(encounter: GameCubeBoxEggEncounter, rngSeed?: number): Pk3Data {
  return createPk3Data(
    encounter.species,
    encounter.level,
    encounter.otName,
    encounter.tid,
    0,
    [encounter.specialMove, 0, 0, 0],
    4,
    true, // Box eggs have fateful encounter
    undefined,
    undefined,
    undefined,
    rngSeed
  );
}

/**
 * Generate from GameCube Bonus Disc
 */
function generateFromGameCubeBonusDisc(encounter: GameCubeBonusDiscEncounter, rngSeed?: number): Pk3Data {
  return createPk3Data(
    encounter.species,
    encounter.level,
    encounter.otName,
    encounter.tid,
    encounter.sid,
    encounter.moves,
    encounter.ball,
    encounter.fatefulEncounter,
    undefined,
    undefined,
    undefined,
    rngSeed
  );
}

/**
 * Generate from N64 Stadium Gift
 * Gen 1/2 format - for simplicity, represented as Gen 3 here
 * In production, would generate Gen 1/2 format data
 */
function generateFromN64StadiumGift(encounter: N64StadiumGiftEncounter, rngSeed?: number): Pk3Data {
  return createPk3Data(
    encounter.species,
    encounter.level,
    'STADIUM', // Stadium gifts have STADIUM as OT
    0,
    0,
    [encounter.specialMove, 0, 0, 0],
    4,
    false, // Gen 1/2 don't have fateful encounter
    undefined,
    undefined,
    undefined,
    rngSeed
  );
}

/**
 * Main generate function - dispatches to appropriate generator
 */
export function generate(encounter: Encounter, rngSeed?: number): StoredPokemon {
  let pk3: Pk3Data;
  
  switch (encounter.kind) {
    case 'Gen3MysteryGift':
      pk3 = generateFromGen3MysteryGift(encounter, rngSeed);
      break;
    case 'Gen3TicketIsland':
      pk3 = generateFromGen3TicketIsland(encounter, rngSeed);
      break;
    case 'Gen2OddEgg':
      pk3 = generateFromGen2OddEgg(encounter, rngSeed);
      break;
    case 'Gen3InGameEgg':
      pk3 = generateFromGen3InGameEgg(encounter, rngSeed);
      break;
    case 'GameCubeBoxEgg':
      pk3 = generateFromGameCubeBoxEgg(encounter, rngSeed);
      break;
    case 'GameCubeBonusDisc':
      pk3 = generateFromGameCubeBonusDisc(encounter, rngSeed);
      break;
    case 'N64StadiumGift':
      pk3 = generateFromN64StadiumGift(encounter, rngSeed);
      break;
  }
  
  // Extract species from pk3 data
  const species = pk3.data[0] | ((pk3.data[1] ?? 0) << 8);
  
  // Get level from encounter
  const level = 'level' in encounter ? encounter.level : 5;
  
  // Get OT name
  const otName = 'otName' in encounter ? encounter.otName : 'PLAYER';
  
  // Get TID
  const tid = 'tid' in encounter ? encounter.tid : 12345;
  
  // Get SID
  const sid = 'sid' in encounter && encounter.sid !== undefined ? encounter.sid : 0;
  
  return {
    pk3Data: serializePk3ForStorage(pk3),
    personality: pk3.personality,
    species,
    nickname: getSpeciesName(species),
    otName,
    level,
    tid,
    sid,
    isValid: true,
    sourceGame: `Event: ${encounter.code}`,
    sourceGeneration: encounter.kind.includes('Gen3') ? 3 : encounter.kind.includes('Gen2') ? 2 : 1,
    importedAt: Date.now(),
  };
}
