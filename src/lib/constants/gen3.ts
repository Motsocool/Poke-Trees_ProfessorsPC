/**
 * Gen 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen) save file constants
 * Based on: https://github.com/pret/pokeemerald
 */

// Save file sizes
export const GEN3_SAVE_SIZE = 0x20000; // 128KB
export const GEN3_SAVE_SLOT_SIZE = 0xE000; // 56KB per save slot (2 slots for redundancy)

// Save block structure (Gen 3 uses multiple save blocks)
export const GEN3_NUM_SAVE_BLOCKS = 14;
export const GEN3_SAVE_BLOCK_HEADER_SIZE = 12;

// Section IDs
export enum Gen3Section {
  TRAINER_INFO = 0,
  TEAM_ITEMS = 1,
  GAME_STATE = 2,
  MISC_DATA = 3,
  RIVAL_INFO = 4,
  PC_BUFFER_A = 5,
  PC_BUFFER_B = 6,
  PC_BUFFER_C = 7,
  PC_BUFFER_D = 8,
  PC_BUFFER_E = 9,
  PC_BUFFER_F = 10,
  PC_BUFFER_G = 11,
  PC_BUFFER_H = 12,
  PC_BUFFER_I = 13,
}

// Checksum calculation
export const GEN3_SECTION_DATA_SIZE = 0xFF4; // 4084 bytes
export const GEN3_SECTION_SIZE = 0x1000; // 4096 bytes (including footer)

// Trainer info (Section 0)
export const GEN3_PLAYER_NAME_LENGTH = 8; // Changed from 7 in Gen 1/2
export const GEN3_PLAYER_GENDER_OFFSET = 0x08;
export const GEN3_TRAINER_ID_OFFSET = 0x0A; // Public ID
export const GEN3_SECRET_ID_OFFSET = 0x0C; // Secret ID (new in Gen 3)
export const GEN3_PLAY_TIME_OFFSET = 0x0E;

// PC Buffer data (Sections 5-13)
export const GEN3_NUM_PC_BOXES = 14;
export const GEN3_POKEMON_PER_BOX = 30; // Increased from 20 in Gen 1/2
export const GEN3_BOX_NAME_LENGTH = 9;

// Each PC buffer section holds data for ~1.5 boxes
export const GEN3_PC_BUFFER_SIZE = 0xFF4;

// Pokémon data structure (Gen 3)
export const GEN3_POKEMON_DATA_SIZE = 80; // Box Pokémon
export const GEN3_POKEMON_PARTY_DATA_SIZE = 100; // Party Pokémon (includes extra battle stats)

// Pokémon data structure (encrypted)
export const GEN3_POKEMON_PERSONALITY_OFFSET = 0;
export const GEN3_POKEMON_OT_ID_OFFSET = 4; // Full 32-bit ID (public + secret)
export const GEN3_POKEMON_NICKNAME_OFFSET = 8;
export const GEN3_POKEMON_LANGUAGE_OFFSET = 18;
export const GEN3_POKEMON_OT_NAME_OFFSET = 20;
export const GEN3_POKEMON_MARKINGS_OFFSET = 27;
export const GEN3_POKEMON_CHECKSUM_OFFSET = 28;
export const GEN3_POKEMON_ENCRYPTED_DATA_OFFSET = 32; // 48 bytes of encrypted data

// Encrypted data substructures (order determined by personality % 24)
export const GEN3_SUBSTRUCT_SIZE = 12;

// Growth substructure
export const GEN3_GROWTH_SPECIES_OFFSET = 0;
export const GEN3_GROWTH_HELD_ITEM_OFFSET = 2;
export const GEN3_GROWTH_EXP_OFFSET = 4;
export const GEN3_GROWTH_PP_BONUSES_OFFSET = 8;
export const GEN3_GROWTH_FRIENDSHIP_OFFSET = 9;

// Attacks substructure
export const GEN3_ATTACKS_MOVES_OFFSET = 0; // 4 moves, 2 bytes each
export const GEN3_ATTACKS_PP_OFFSET = 8; // 4 PP values

// EVs & Condition substructure
export const GEN3_EV_HP_OFFSET = 0;
export const GEN3_EV_ATTACK_OFFSET = 1;
export const GEN3_EV_DEFENSE_OFFSET = 2;
export const GEN3_EV_SPEED_OFFSET = 3;
export const GEN3_EV_SPATK_OFFSET = 4;
export const GEN3_EV_SPDEF_OFFSET = 5;
export const GEN3_CONDITION_COOLNESS_OFFSET = 6;
export const GEN3_CONDITION_BEAUTY_OFFSET = 7;
export const GEN3_CONDITION_CUTENESS_OFFSET = 8;
export const GEN3_CONDITION_SMARTNESS_OFFSET = 9;
export const GEN3_CONDITION_TOUGHNESS_OFFSET = 10;
export const GEN3_CONDITION_FEEL_OFFSET = 11;

// Misc substructure
export const GEN3_MISC_POKERUS_OFFSET = 0;
export const GEN3_MISC_MET_LOCATION_OFFSET = 1;
export const GEN3_MISC_ORIGINS_OFFSET = 2; // 2 bytes (level met, game, ball, OT gender)
export const GEN3_MISC_IVS_OFFSET = 4; // 4 bytes (IVs, egg, ability packed)
export const GEN3_MISC_RIBBONS_OFFSET = 8; // 4 bytes

// IV packing (30 bits for IVs, 1 bit for egg, 1 bit for ability)
export const GEN3_IV_BITS = 5; // Each IV is 5 bits (0-31)
export const GEN3_IV_MAX = 31;

// Nature determination
export const GEN3_NUM_NATURES = 25;

// Ability
export const GEN3_ABILITY_BIT = 0x80000000;

// Egg bit
export const GEN3_EGG_BIT = 0x40000000;

// Species constants
export const GEN3_NUM_SPECIES = 386; // Up to Deoxys

// Move constants
export const GEN3_NUM_MOVES = 354;
export const GEN3_MAX_MOVES = 4;

// Level ranges
export const GEN3_MIN_LEVEL = 1;
export const GEN3_MAX_LEVEL = 100;

// EV ranges (0-255 per stat, max 510 total in Gen 3)
export const GEN3_EV_MAX = 255;
export const GEN3_EV_TOTAL_MAX = 510;

// Shiny calculation (based on personality value and trainer IDs)
// XOR of: (PID upper 16 bits) ^ (PID lower 16 bits) ^ (TID) ^ (SID)
// If result < 8, Pokémon is shiny
export const GEN3_SHINY_THRESHOLD = 8;

// Status conditions
export const GEN3_STATUS_SLEEP_MASK = 0x07;
export const GEN3_STATUS_POISONED = 0x08;
export const GEN3_STATUS_BURNED = 0x10;
export const GEN3_STATUS_FROZEN = 0x20;
export const GEN3_STATUS_PARALYZED = 0x40;
export const GEN3_STATUS_TOXIC = 0x80;

// Ball types
export const GEN3_POKEBALL = 0x00;
export const GEN3_GREAT_BALL = 0x01;
export const GEN3_ULTRA_BALL = 0x02;
export const GEN3_MASTER_BALL = 0x03;

// Game origins
export enum Gen3GameOrigin {
  SAPPHIRE = 1,
  RUBY = 2,
  EMERALD = 3,
  FIRERED = 4,
  LEAFGREEN = 5,
  COLOSSEUM_XD = 15,
}

// Data encryption
// Data is encrypted using XOR with a key derived from personality and OT ID
export function getGen3EncryptionKey(personality: number, otId: number): number {
  return personality ^ otId;
}

// Substructure order (24 possible orders based on personality % 24)
export const GEN3_SUBSTRUCT_ORDERS = [
  [0, 1, 2, 3], // 0 - GAEM
  [0, 1, 3, 2], // 1 - GAME
  [0, 2, 1, 3], // 2 - GEAM
  [0, 2, 3, 1], // 3 - GEMA
  [0, 3, 1, 2], // 4 - GMAE
  [0, 3, 2, 1], // 5 - GMEA
  [1, 0, 2, 3], // 6 - AGEM
  [1, 0, 3, 2], // 7 - AGME
  [1, 2, 0, 3], // 8 - AEGM
  [1, 2, 3, 0], // 9 - AEMG
  [1, 3, 0, 2], // 10 - AGME
  [1, 3, 2, 0], // 11 - AMEG
  [2, 0, 1, 3], // 12 - EGAM
  [2, 0, 3, 1], // 13 - EGMA
  [2, 1, 0, 3], // 14 - EAGM
  [2, 1, 3, 0], // 15 - EAMG
  [2, 3, 0, 1], // 16 - EMGA
  [2, 3, 1, 0], // 17 - EMAG
  [3, 0, 1, 2], // 18 - MGAE
  [3, 0, 2, 1], // 19 - MGEA
  [3, 1, 0, 2], // 20 - MAGE
  [3, 1, 2, 0], // 21 - MAEG
  [3, 2, 0, 1], // 22 - MEGA
  [3, 2, 1, 0], // 23 - MEAG
];
