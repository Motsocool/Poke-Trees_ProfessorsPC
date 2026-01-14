/**
 * Event Pokémon data and cheat code system
 * Supports Gen 3 event distributions
 */

export interface EventPokemon {
  species: number;
  nickname: string;
  level: number;
  otName: string;
  tid: number;
  sid: number;
  moves: number[];
  heldItem?: number;
  ball?: number;
  shiny?: boolean;
  nature?: number;
  ability?: number;
  ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  evs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ribbons?: number[];
  fatefulEncounter?: boolean;
  description: string;
  code: string;
}

/**
 * Gen 3 Event Pokémon Database
 * Based on known distributions from Gen3EventLegality
 */
export const GEN3_EVENT_POKEMON: Record<string, EventPokemon> = {
  // Mew Events
  'MYSTRY': {
    species: 151, // Mew
    nickname: 'MEW',
    level: 10,
    otName: 'MYSTRY',
    tid: 6930,
    sid: 0,
    moves: [1, 0, 0, 0], // Pound
    ball: 4, // Poké Ball
    fatefulEncounter: true,
    description: 'MYSTRY Mew - Toys R Us distribution 2006',
    code: 'MYSTRY',
  },
  'AURA': {
    species: 151, // Mew
    nickname: 'MEW',
    level: 10,
    otName: 'Aura',
    tid: 20078,
    sid: 0,
    moves: [1, 0, 0, 0], // Pound
    ball: 4,
    fatefulEncounter: true,
    description: 'Aura Mew - Toys R Us distribution 2007',
    code: 'AURA',
  },

  // Celebi Events
  '10ANIV-CELEBI': {
    species: 251, // Celebi
    nickname: 'CELEBI',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [246, 248, 250, 94], // Ancient Power, Future Sight, Safeguard, Psychic
    heldItem: 0,
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Celebi - 10th Anniversary Event',
    code: '10ANIV-CELEBI',
  },

  // Jirachi Events
  'WISHMKR': {
    species: 385, // Jirachi
    nickname: 'JIRACHI',
    level: 5,
    otName: 'WISHMKR',
    tid: 20043,
    sid: 0,
    moves: [273, 281, 0, 0], // Wish, Confusion
    ball: 4,
    fatefulEncounter: true,
    description: 'WISHMKR Jirachi - Pokémon Colosseum Bonus Disc',
    code: 'WISHMKR',
  },
  'CHANNEL': {
    species: 385, // Jirachi
    nickname: 'JIRACHI',
    level: 5,
    otName: 'CHANNEL',
    tid: 40122,
    sid: 0,
    moves: [273, 281, 129, 0], // Wish, Confusion, Swift
    ball: 4,
    fatefulEncounter: true,
    description: 'CHANNEL Jirachi - Pokémon Channel distribution',
    code: 'CHANNEL',
  },

  // Deoxys Events
  'SPACE-C': {
    species: 386, // Deoxys
    nickname: 'DEOXYS',
    level: 70,
    otName: 'SPACE C',
    tid: 0,
    sid: 0,
    moves: [322, 324, 244, 63], // Cosmic Power, Psycho Boost, Psychic, Hyper Beam
    ball: 4,
    fatefulEncounter: true,
    description: 'SPACE C Deoxys - Space Center Event',
    code: 'SPACE-C',
  },

  // Legendary Beasts
  '10ANIV-ENTEI': {
    species: 244, // Entei
    nickname: 'ENTEI',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [241, 126, 53, 207], // Sunny Day, Fire Blast, Flamethrower, Roar
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Entei - 10th Anniversary Event',
    code: '10ANIV-ENTEI',
  },
  '10ANIV-SUICUNE': {
    species: 245, // Suicune
    nickname: 'SUICUNE',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [352, 56, 54, 240], // Aurora Beam, Hydro Pump, Mist, Rain Dance
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Suicune - 10th Anniversary Event',
    code: '10ANIV-SUICUNE',
  },
  '10ANIV-RAIKOU': {
    species: 243, // Raikou
    nickname: 'RAIKOU',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [87, 85, 240, 44], // Thunder, Thunderbolt, Rain Dance, Bite
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Raikou - 10th Anniversary Event',
    code: '10ANIV-RAIKOU',
  },

  // Latias/Latios
  '10ANIV-LATIAS': {
    species: 380, // Latias
    nickname: 'LATIAS',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [94, 196, 349, 8], // Psychic, Mist Ball, Dragon Dance, Water Sport
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Latias - 10th Anniversary Event',
    code: '10ANIV-LATIAS',
  },
  '10ANIV-LATIOS': {
    species: 381, // Latios
    nickname: 'LATIOS',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [94, 295, 349, 225], // Psychic, Luster Purge, Dragon Dance, Dragon Dance
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Latios - 10th Anniversary Event',
    code: '10ANIV-LATIOS',
  },

  // Ho-Oh and Lugia
  '10ANIV-HOOH': {
    species: 250, // Ho-Oh
    nickname: 'HO-OH',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [221, 126, 53, 219], // Sacred Fire, Fire Blast, Flamethrower, Safeguard
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Ho-Oh - 10th Anniversary Event',
    code: '10ANIV-HOOH',
  },
  '10ANIV-LUGIA': {
    species: 249, // Lugia
    nickname: 'LUGIA',
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [250, 87, 105, 56], // Whirlpool, Thunder, Recover, Hydro Pump
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Lugia - 10th Anniversary Event',
    code: '10ANIV-LUGIA',
  },
};

/**
 * Validate a cheat code and return the event Pokémon if valid
 */
export function validateCheatCode(code: string): EventPokemon | null {
  const upperCode = code.trim().toUpperCase();
  return GEN3_EVENT_POKEMON[upperCode] || null;
}

/**
 * Get all available event codes
 */
export function getAvailableEventCodes(): string[] {
  return Object.keys(GEN3_EVENT_POKEMON);
}

/**
 * Get event Pokémon description by code
 */
export function getEventDescription(code: string): string | null {
  const event = validateCheatCode(code);
  return event ? event.description : null;
}
