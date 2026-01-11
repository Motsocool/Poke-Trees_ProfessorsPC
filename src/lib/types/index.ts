/**
 * Common types for Pokémon data structures across all generations
 */

// Generation types
export type Generation = 1 | 2 | 3;

// Game versions
export enum GameVersion {
  // Gen 1
  RED = 'RED',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  // Gen 2
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  CRYSTAL = 'CRYSTAL',
  // Gen 3
  RUBY = 'RUBY',
  SAPPHIRE = 'SAPPHIRE',
  EMERALD = 'EMERALD',
  FIRERED = 'FIRERED',
  LEAFGREEN = 'LEAFGREEN',
}

// Status conditions
export enum StatusCondition {
  NONE = 0,
  ASLEEP = 1,
  POISONED = 2,
  BURNED = 3,
  FROZEN = 4,
  PARALYZED = 5,
}

// Stats
export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  special?: number; // Gen 1/2 only
  specialAttack?: number; // Gen 3+
  specialDefense?: number; // Gen 3+
}

// DVs (Determinant Values) for Gen 1/2
export interface DVs {
  hp: number; // Derived from other DVs in Gen 1/2
  attack: number;
  defense: number;
  speed: number;
  special: number;
}

// IVs (Individual Values) for Gen 3+
export interface IVs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

// EVs (Effort Values)
export interface EVs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  special?: number; // Gen 1/2
  specialAttack?: number; // Gen 3+
  specialDefense?: number; // Gen 3+
}

// Move data
export interface Move {
  id: number;
  pp: number;
  ppUps: number;
}

// Base Pokémon data structure
export interface BasePokemon {
  species: number;
  level: number;
  nickname: string;
  ot: string; // Original Trainer
  otId: number; // Trainer ID
  exp: number;
  friendship?: number; // Gen 2+
  moves: Move[];
  gender?: 'M' | 'F' | 'U'; // Unknown for genderless
  shiny: boolean;
  nature?: number; // Gen 3+
  ability?: number; // Gen 3+
  statusCondition: StatusCondition;
  currentHP: number;
  stats: Stats;
}

// Gen 1/2 specific Pokémon data
export interface Gen12Pokemon extends BasePokemon {
  dvs: DVs;
  evs: EVs;
}

// Gen 3 specific Pokémon data
export interface Gen3Pokemon extends BasePokemon {
  ivs: IVs;
  evs: EVs;
  personalityValue: number; // PID
  otSecretId?: number; // Secret ID (Gen 3+)
  ball: number;
  metLevel?: number;
  metLocation?: number;
  ribbons?: number[];
  markings?: number;
}

// Unified vault Pokémon (converted to Gen 3 format)
export interface VaultPokemon extends Gen3Pokemon {
  id: string; // UUID
  sourceGeneration: Generation;
  sourceGame: GameVersion;
  importDate: Date;
  isLegal: boolean;
  legalityNotes: string[];
}

// Save file metadata
export interface SaveFileMetadata {
  game: GameVersion;
  generation: Generation;
  trainerName: string;
  trainerId: number;
  secretId?: number;
  playTime: number;
  checksum?: number;
}

// Box data
export interface Box {
  name: string;
  pokemon: (BasePokemon | null)[]; // null for empty slots
}

// Parsed save file
export interface ParsedSaveFile {
  metadata: SaveFileMetadata;
  boxes: Box[];
}

// Legality check result
export interface LegalityCheck {
  isLegal: boolean;
  errors: string[];
  warnings: string[];
}
