/**
 * Encounter Database
 * Complete database of legal encounters across all generations
 */

import { Encounter } from './encounterTypes';

/**
 * All legal encounters mapped by code
 */
export const ENCOUNTER_DATABASE: Record<string, Encounter> = {
  // === Gen 3 Mystery Gift Events ===
  
  'MYSTRY': {
    kind: 'Gen3MysteryGift',
    code: 'MYSTRY',
    species: 151, // Mew
    level: 10,
    otName: 'MYSTRY',
    tid: 6930,
    sid: 0,
    moves: [1, 0, 0, 0], // Pound
    ball: 4, // Poké Ball
    fatefulEncounter: true,
    description: 'MYSTRY Mew - Toys R Us distribution 2006',
  },

  'AURA': {
    kind: 'Gen3MysteryGift',
    code: 'AURA',
    species: 151, // Mew
    level: 10,
    otName: 'Aura',
    tid: 20078,
    sid: 0,
    moves: [1, 0, 0, 0], // Pound
    ball: 4,
    fatefulEncounter: true,
    description: 'Aura Mew - Toys R Us distribution 2007',
  },

  '10ANIV-CELEBI': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-CELEBI',
    species: 251, // Celebi
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [246, 248, 250, 94], // Ancient Power, Future Sight, Safeguard, Psychic
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Celebi - 10th Anniversary Event',
  },

  'WISHMKR': {
    kind: 'Gen3MysteryGift',
    code: 'WISHMKR',
    species: 385, // Jirachi
    level: 5,
    otName: 'WISHMKR',
    tid: 20043,
    sid: 0,
    moves: [273, 281, 0, 0], // Wish, Confusion
    ball: 4,
    fatefulEncounter: true,
    description: 'WISHMKR Jirachi - Pokémon Colosseum Bonus Disc (US)',
  },

  'CHANNEL': {
    kind: 'GameCubeBonusDisc',
    code: 'CHANNEL',
    disc: 'ChannelEU',
    species: 385, // Jirachi
    level: 5,
    otName: 'CHANNEL',
    tid: 40122,
    sid: 0,
    moves: [273, 281, 129, 0], // Wish, Confusion, Swift
    ball: 4,
    fatefulEncounter: true,
    description: 'CHANNEL Jirachi - Pokémon Channel (EU)',
  },

  'SPACE-C': {
    kind: 'Gen3MysteryGift',
    code: 'SPACE-C',
    species: 386, // Deoxys
    level: 70,
    otName: 'SPACE C',
    tid: 0,
    sid: 0,
    moves: [322, 324, 244, 63], // Cosmic Power, Psycho Boost, Psychic, Hyper Beam
    ball: 4,
    fatefulEncounter: true,
    description: 'SPACE C Deoxys - Space Center Event',
  },

  '10ANIV-ENTEI': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-ENTEI',
    species: 244, // Entei
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [241, 126, 53, 207], // Sunny Day, Fire Blast, Flamethrower, Roar
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Entei - 10th Anniversary Event',
  },

  '10ANIV-SUICUNE': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-SUICUNE',
    species: 245, // Suicune
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [352, 56, 54, 240], // Aurora Beam, Hydro Pump, Mist, Rain Dance
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Suicune - 10th Anniversary Event',
  },

  '10ANIV-RAIKOU': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-RAIKOU',
    species: 243, // Raikou
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [87, 85, 240, 44], // Thunder, Thunderbolt, Rain Dance, Bite
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Raikou - 10th Anniversary Event',
  },

  '10ANIV-LATIAS': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-LATIAS',
    species: 380, // Latias
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [94, 196, 349, 8], // Psychic, Mist Ball, Dragon Dance, Water Sport
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Latias - 10th Anniversary Event',
  },

  '10ANIV-LATIOS': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-LATIOS',
    species: 381, // Latios
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [94, 295, 349, 225], // Psychic, Luster Purge, Dragon Dance, Dragon Dance
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Latios - 10th Anniversary Event',
  },

  '10ANIV-HOOH': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-HOOH',
    species: 250, // Ho-Oh
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [221, 126, 53, 219], // Sacred Fire, Fire Blast, Flamethrower, Safeguard
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Ho-Oh - 10th Anniversary Event',
  },

  '10ANIV-LUGIA': {
    kind: 'Gen3MysteryGift',
    code: '10ANIV-LUGIA',
    species: 249, // Lugia
    level: 70,
    otName: '10 ANIV',
    tid: 0,
    sid: 0,
    moves: [250, 87, 105, 56], // Whirlpool, Thunder, Recover, Hydro Pump
    ball: 4,
    fatefulEncounter: true,
    description: '10 ANIV Lugia - 10th Anniversary Event',
  },

  // === GameCube Bonus Disc Events ===

  'AGETO-CELEBI': {
    kind: 'GameCubeBonusDisc',
    code: 'AGETO-CELEBI',
    disc: 'ColosseumJP',
    species: 251, // Celebi
    level: 10,
    otName: 'アゲト', // Ageto in Japanese
    tid: 31121,
    sid: 0,
    moves: [246, 248, 219, 273], // Ancient Power, Future Sight, Safeguard, Wish
    ball: 4,
    fatefulEncounter: true,
    description: 'Ageto Celebi - Pokémon Colosseum Bonus Disc (JP)',
  },

  'COLOS-PIKACHU': {
    kind: 'GameCubeBonusDisc',
    code: 'COLOS-PIKACHU',
    disc: 'ColosseumJP',
    species: 25, // Pikachu
    level: 10,
    otName: 'コロシアム', // Colosseum in Japanese
    tid: 31121,
    sid: 0,
    moves: [84, 86, 98, 129], // Thunderbolt, Thunder Wave, Quick Attack, Swift
    ball: 4,
    fatefulEncounter: true,
    description: 'Colosseum Pikachu - Pokémon Colosseum Bonus Disc (JP)',
  },

  // === Gen 3 Ticket Island Encounters ===

  'EON-LATIOS': {
    kind: 'Gen3TicketIsland',
    code: 'EON-LATIOS',
    item: 'EonTicket',
    species: 381, // Latios
    level: 40,
    location: 'Southern Island',
    description: 'Eon Ticket Latios - Southern Island encounter',
  },

  'EON-LATIAS': {
    kind: 'Gen3TicketIsland',
    code: 'EON-LATIAS',
    item: 'EonTicket',
    species: 380, // Latias
    level: 40,
    location: 'Southern Island',
    description: 'Eon Ticket Latias - Southern Island encounter',
  },

  'AURORA-DEOXYS': {
    kind: 'Gen3TicketIsland',
    code: 'AURORA-DEOXYS',
    item: 'AuroraTicket',
    species: 386, // Deoxys
    level: 30,
    location: 'Birth Island',
    description: 'Aurora Ticket Deoxys - Birth Island encounter',
  },

  'MYSTIC-LUGIA': {
    kind: 'Gen3TicketIsland',
    code: 'MYSTIC-LUGIA',
    item: 'MysticTicket',
    species: 249, // Lugia
    level: 70,
    location: 'Navel Rock',
    description: 'MysticTicket Lugia - Navel Rock encounter',
  },

  'MYSTIC-HOOH': {
    kind: 'Gen3TicketIsland',
    code: 'MYSTIC-HOOH',
    item: 'MysticTicket',
    species: 250, // Ho-Oh
    level: 70,
    location: 'Navel Rock',
    description: 'MysticTicket Ho-Oh - Navel Rock encounter',
  },

  'OLDSEA-MEW': {
    kind: 'Gen3TicketIsland',
    code: 'OLDSEA-MEW',
    item: 'OldSeaMap',
    species: 151, // Mew
    level: 30,
    location: 'Faraway Island',
    description: 'Old Sea Map Mew - Faraway Island encounter',
  },

  // === GameCube Pokémon Box Eggs ===

  'BOX-PICHU-SURF': {
    kind: 'GameCubeBoxEgg',
    code: 'BOX-PICHU-SURF',
    species: 172, // Pichu
    level: 5,
    specialMove: 57, // Surf
    otName: 'BOX',
    tid: 0,
    description: 'Pokémon Box Pichu with Surf',
  },

  'BOX-SWABLU': {
    kind: 'GameCubeBoxEgg',
    code: 'BOX-SWABLU',
    species: 333, // Swablu
    level: 5,
    specialMove: 273, // Wish (special move)
    otName: 'BOX',
    tid: 0,
    description: 'Pokémon Box Swablu with Wish',
  },

  'BOX-ZIGZAGOON': {
    kind: 'GameCubeBoxEgg',
    code: 'BOX-ZIGZAGOON',
    species: 263, // Zigzagoon
    level: 5,
    specialMove: 274, // Assist (special move)
    otName: 'BOX',
    tid: 0,
    description: 'Pokémon Box Zigzagoon with Assist',
  },

  'BOX-SKITTY': {
    kind: 'GameCubeBoxEgg',
    code: 'BOX-SKITTY',
    species: 300, // Skitty
    level: 5,
    specialMove: 205, // Rollout (special move)
    otName: 'BOX',
    tid: 0,
    description: 'Pokémon Box Skitty with Rollout',
  },

  // === Gen 3 In-Game Eggs ===

  'EGG-WYNAUT': {
    kind: 'Gen3InGameEgg',
    code: 'EGG-WYNAUT',
    species: 360, // Wynaut
    level: 5,
    location: 'Lavaridge Town (RSE)',
    description: 'Wynaut Egg - Gift from old lady in Lavaridge Town',
  },

  'EGG-TOGEPI': {
    kind: 'Gen3InGameEgg',
    code: 'EGG-TOGEPI',
    species: 175, // Togepi
    level: 5,
    location: 'Water Labyrinth (FRLG)',
    description: 'Togepi Egg - Gift from Mr. Pokémon stand-in',
  },

  // === Gen 2 Odd Egg ===

  'ODDEGG': {
    kind: 'Gen2OddEgg',
    code: 'ODDEGG',
    speciesPool: [173, 174, 172, 238, 239, 240, 236], // Cleffa, Igglybuff, Pichu, Smoochum, Elekid, Magby, Tyrogue
    level: 5,
    specialMove: 146, // Dizzy Punch
    guaranteedShiny: true,
    description: 'Odd Egg - Guaranteed shiny baby Pokémon with Dizzy Punch',
  },

  // === N64 Stadium Gifts ===

  'STADIUM-PSYDUCK': {
    kind: 'N64StadiumGift',
    code: 'STADIUM-PSYDUCK',
    game: 'Stadium',
    generation: 1,
    species: 54, // Psyduck
    level: 15,
    specialMove: 133, // Amnesia
    description: 'Stadium Psyduck - Amnesia (Gen 1)',
  },

  'STADIUM-PIKACHU-SURF': {
    kind: 'N64StadiumGift',
    code: 'STADIUM-PIKACHU-SURF',
    game: 'Stadium',
    generation: 1,
    species: 25, // Pikachu
    level: 5,
    specialMove: 57, // Surf
    description: 'Stadium Surfing Pikachu - Unlocks Pikachu Beach (Yellow)',
  },

  'STADIUM2-FARFETCHD': {
    kind: 'N64StadiumGift',
    code: 'STADIUM2-FARFETCHD',
    game: 'Stadium2',
    generation: 2,
    species: 83, // Farfetch'd
    level: 5,
    specialMove: 226, // Baton Pass
    description: 'Stadium 2 Farfetch\'d - Baton Pass (Gen 2)',
  },

  'STADIUM2-GLIGAR': {
    kind: 'N64StadiumGift',
    code: 'STADIUM2-GLIGAR',
    game: 'Stadium2',
    generation: 2,
    species: 207, // Gligar
    level: 5,
    specialMove: 89, // Earthquake
    description: 'Stadium 2 Gligar - Earthquake (Gen 2)',
  },
};

/**
 * Get all available encounter codes
 */
export function getAvailableEncounterCodes(): string[] {
  return Object.keys(ENCOUNTER_DATABASE);
}

/**
 * Get encounter by code
 */
export function getEncounter(code: string): Encounter | null {
  const upperCode = code.trim().toUpperCase();
  return ENCOUNTER_DATABASE[upperCode] || null;
}

/**
 * Get encounter description
 */
export function getEncounterDescription(code: string): string | null {
  const encounter = getEncounter(code);
  return encounter ? encounter.description : null;
}
