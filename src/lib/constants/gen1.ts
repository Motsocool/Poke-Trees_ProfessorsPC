/**
 * Gen 1 (Red/Blue/Yellow) save file constants
 * Based on: https://github.com/pret/pokered
 */

// Save file size
export const GEN1_SAVE_SIZE = 0x8000; // 32KB

// Checksum location
export const GEN1_CHECKSUM_OFFSET = 0x3523;

// Trainer data offsets
export const GEN1_PLAYER_NAME_OFFSET = 0x2598;
export const GEN1_PLAYER_NAME_LENGTH = 11;
export const GEN1_PLAYER_ID_OFFSET = 0x2605;

// Box data offsets
export const GEN1_CURRENT_BOX_OFFSET = 0x284C; // Current box number (0-11)
export const GEN1_NUM_BOXES = 12;
export const GEN1_BOX_SIZE = 462; // Size of one box
export const GEN1_POKEMON_PER_BOX = 20;

// Current box is stored separately
export const GEN1_CURRENT_BOX_DATA_OFFSET = 0x30C0;

// Other boxes stored in SRAM banks
export const GEN1_BOX_1_6_OFFSET = 0x4000; // Boxes 0-5
export const GEN1_BOX_7_12_OFFSET = 0x6000; // Boxes 6-11

// Pokémon data structure
export const GEN1_POKEMON_DATA_SIZE = 44;
export const GEN1_POKEMON_PARTY_DATA_SIZE = 44;
export const GEN1_POKEMON_BOX_DATA_SIZE = 33; // Box Pokémon have less data

// Pokémon data offsets (within structure)
export const GEN1_SPECIES_OFFSET = 0;
export const GEN1_CURRENT_HP_OFFSET = 1;
export const GEN1_LEVEL_OFFSET = 3;
export const GEN1_STATUS_OFFSET = 4;
export const GEN1_TYPE1_OFFSET = 5;
export const GEN1_TYPE2_OFFSET = 6;
export const GEN1_CATCH_RATE_OFFSET = 7;
export const GEN1_MOVES_OFFSET = 8; // 4 bytes
export const GEN1_OT_ID_OFFSET = 12;
export const GEN1_EXP_OFFSET = 14; // 3 bytes
export const GEN1_HP_EV_OFFSET = 17;
export const GEN1_ATTACK_EV_OFFSET = 19;
export const GEN1_DEFENSE_EV_OFFSET = 21;
export const GEN1_SPEED_EV_OFFSET = 23;
export const GEN1_SPECIAL_EV_OFFSET = 25;
export const GEN1_DV_OFFSET = 27; // 2 bytes (Attack, Defense, Speed, Special packed)
export const GEN1_PP_OFFSET = 29; // 4 bytes

// OT and Nickname data (stored separately in box)
export const GEN1_OT_NAME_LENGTH = 11;
export const GEN1_NICKNAME_LENGTH = 11;

// Character encoding terminator
export const GEN1_STRING_TERMINATOR = 0x50;

// Species constants
export const GEN1_NUM_SPECIES = 151;

// Move constants
export const GEN1_NUM_MOVES = 165;
export const GEN1_MAX_MOVES = 4;

// DV ranges (0-15 for each stat)
export const GEN1_DV_MIN = 0;
export const GEN1_DV_MAX = 15;

// EV ranges (0-65535)
export const GEN1_EV_MAX = 65535;

// Level ranges
export const GEN1_MIN_LEVEL = 1;
export const GEN1_MAX_LEVEL = 100;

// Max PP values
export const GEN1_MAX_PP = 61;

// Status condition masks
export const GEN1_STATUS_SLEEP_MASK = 0x07;
export const GEN1_STATUS_POISONED = 0x08;
export const GEN1_STATUS_BURNED = 0x10;
export const GEN1_STATUS_FROZEN = 0x20;
export const GEN1_STATUS_PARALYZED = 0x40;

// Shiny calculation (Gen 1 has no shiny, but DVs determine if shiny in Gen 2)
export const GEN1_SHINY_ATTACK_DV = 2 | 3 | 6 | 7 | 10 | 11 | 14 | 15;
export const GEN1_SHINY_DEFENSE_DV = 10;
export const GEN1_SHINY_SPEED_DV = 10;
export const GEN1_SHINY_SPECIAL_DV = 10;
