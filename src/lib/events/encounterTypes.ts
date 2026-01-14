/**
 * Encounter Database Architecture
 * Type-safe encounter definitions for all generations
 */

/**
 * Generation 3 Mystery Gift Event
 * Distributed via Wonder Card, e-Card, or direct distribution
 */
export interface Gen3MysteryGiftEncounter {
  kind: 'Gen3MysteryGift';
  code: string;
  species: number;
  level: number;
  otName: string;
  tid: number;
  sid: number;
  moves: number[];
  heldItem?: number;
  ball: number;
  fatefulEncounter: boolean;
  ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  nature?: number;
  ability?: number;
  shiny?: boolean;
  ribbons?: number[];
  description: string;
}

/**
 * Generation 3 Ticket/Map Island Encounter
 * Accessed via event items (Eon Ticket, Aurora Ticket, MysticTicket, Old Sea Map)
 */
export interface Gen3TicketIslandEncounter {
  kind: 'Gen3TicketIsland';
  code: string;
  item: 'EonTicket' | 'AuroraTicket' | 'MysticTicket' | 'OldSeaMap';
  species: number;
  level: number;
  location: string;
  description: string;
}

/**
 * Generation 2 Odd Egg
 * Special egg with variable species and guaranteed shiny
 */
export interface Gen2OddEggEncounter {
  kind: 'Gen2OddEgg';
  code: string;
  speciesPool: number[]; // Cleffa, Igglybuff, Pichu, Smoochum, Elekid, Magby, Tyrogue
  level: 5; // Always hatches at level 5
  specialMove?: number; // Dizzy Punch
  guaranteedShiny: boolean; // Odd Egg Pokémon are always shiny
  description: string;
}

/**
 * Generation 3 In-Game Egg
 * Eggs received as gifts (Wynaut, Togepi)
 */
export interface Gen3InGameEggEncounter {
  kind: 'Gen3InGameEgg';
  code: string;
  species: number;
  level: 5; // Always hatches at level 5
  location: string;
  description: string;
}

/**
 * GameCube Pokémon Box Bonus Egg
 * Special eggs with exclusive moves
 */
export interface GameCubeBoxEggEncounter {
  kind: 'GameCubeBoxEgg';
  code: string;
  species: number;
  level: 5;
  specialMove: number; // Move not normally available (e.g., Surf for Pichu)
  otName: string;
  tid: number;
  description: string;
}

/**
 * GameCube Bonus Disc Distribution
 * Distributed from Colosseum/Channel bonus discs
 */
export interface GameCubeBonusDiscEncounter {
  kind: 'GameCubeBonusDisc';
  code: string;
  disc: 'ColosseumUS' | 'ColosseumJP' | 'ChannelEU';
  species: number;
  level: number;
  otName: string;
  tid: number;
  sid: number;
  moves: number[];
  ball: number;
  fatefulEncounter: boolean;
  description: string;
}

/**
 * N64 Stadium Gift
 * Special Pokémon with exclusive moves from Stadium/Stadium 2
 */
export interface N64StadiumGiftEncounter {
  kind: 'N64StadiumGift';
  code: string;
  game: 'Stadium' | 'Stadium2';
  generation: 1 | 2; // Which generation game it transfers to
  species: number;
  level: number;
  specialMove: number; // Exclusive move (e.g., Amnesia Psyduck, Surf Pikachu)
  description: string;
}

/**
 * Union type of all encounter kinds
 */
export type Encounter =
  | Gen3MysteryGiftEncounter
  | Gen3TicketIslandEncounter
  | Gen2OddEggEncounter
  | Gen3InGameEggEncounter
  | GameCubeBoxEggEncounter
  | GameCubeBonusDiscEncounter
  | N64StadiumGiftEncounter;

/**
 * Validation issue severity
 */
export type IssueSeverity = 'error' | 'warning' | 'info';

/**
 * Validation issue
 */
export interface ValidationIssue {
  severity: IssueSeverity;
  field: string;
  message: string;
}
