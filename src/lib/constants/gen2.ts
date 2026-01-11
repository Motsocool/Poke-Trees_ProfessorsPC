/**
 * Gen 2 (Gold/Silver/Crystal) save file constants
 * Based on: https://github.com/pret/pokecrystal
 */

// Save file size
export const GEN2_SAVE_SIZE = 0x8000; // 32KB

// Checksum location
export const GEN2_CHECKSUM_OFFSET = 0x2D0D;

// Trainer data offsets
export const GEN2_PLAYER_NAME_OFFSET = 0x2009;
export const GEN2_PLAYER_NAME_LENGTH = 11;
export const GEN2_PLAYER_ID_OFFSET = 0x2009 + 0x7;

// Box data offsets
export const GEN2_CURRENT_BOX_OFFSET = 0x2724;
export const GEN2_NUM_BOXES = 14;
export const GEN2_POKEMON_PER_BOX = 20;

// Box structure is more complex in Gen 2
// Current box is at 0x2D6C
export const GEN2_CURRENT_BOX_DATA_OFFSET = 0x2D6C;
export const GEN2_BOX_SIZE = 0x450; // 1104 bytes per box

// Boxes 1-7 are in SRAM bank 1
export const GEN2_BOX_1_7_OFFSET = 0x4000;
// Boxes 8-14 are in SRAM bank 2
export const GEN2_BOX_8_14_OFFSET = 0x6000;

// Pokémon data structure
export const GEN2_POKEMON_DATA_SIZE = 48;
export const GEN2_POKEMON_BOX_DATA_SIZE = 32;

// Pokémon data offsets (within structure)
export const GEN2_SPECIES_OFFSET = 0;
export const GEN2_HELD_ITEM_OFFSET = 1;
export const GEN2_MOVES_OFFSET = 2; // 4 bytes
export const GEN2_OT_ID_OFFSET = 6;
export const GEN2_EXP_OFFSET = 8; // 3 bytes
export const GEN2_HP_EV_OFFSET = 11;
export const GEN2_ATTACK_EV_OFFSET = 13;
export const GEN2_DEFENSE_EV_OFFSET = 15;
export const GEN2_SPEED_EV_OFFSET = 17;
export const GEN2_SPECIAL_EV_OFFSET = 19;
export const GEN2_DV_OFFSET = 21; // 2 bytes
export const GEN2_PP_OFFSET = 23; // 4 bytes
export const GEN2_FRIENDSHIP_OFFSET = 27;
export const GEN2_POKERUS_OFFSET = 28;
export const GEN2_CAUGHT_DATA_OFFSET = 29; // 2 bytes (contains caught time, level, gender, location)
export const GEN2_LEVEL_OFFSET = 31;

// OT and Nickname data
export const GEN2_OT_NAME_LENGTH = 11;
export const GEN2_NICKNAME_LENGTH = 11;

// Character encoding terminator
export const GEN2_STRING_TERMINATOR = 0x50;

// Species constants
export const GEN2_NUM_SPECIES = 251;

// Move constants
export const GEN2_NUM_MOVES = 251;
export const GEN2_MAX_MOVES = 4;

// DV ranges (0-15 for each stat)
export const GEN2_DV_MIN = 0;
export const GEN2_DV_MAX = 15;

// EV ranges (0-65535)
export const GEN2_EV_MAX = 65535;

// Level ranges
export const GEN2_MIN_LEVEL = 1;
export const GEN2_MAX_LEVEL = 100;

// Friendship ranges
export const GEN2_MIN_FRIENDSHIP = 0;
export const GEN2_MAX_FRIENDSHIP = 255;

// Gender determination (from DVs)
export const GEN2_GENDER_THRESHOLD = {
  ALWAYS_MALE: -1,
  RATIO_7_1: 0x1F, // 87.5% male
  RATIO_3_1: 0x3F, // 75% male
  RATIO_1_1: 0x7F, // 50% male
  RATIO_1_3: 0xBF, // 25% male
  ALWAYS_FEMALE: 0xFE,
  GENDERLESS: 0xFF,
};

// Shiny determination (based on DVs)
// A Pokémon is shiny if:
// - Defense DV = 10
// - Speed DV = 10
// - Special DV = 10
// - Attack DV = 2, 3, 6, 7, 10, 11, 14, or 15
export const GEN2_SHINY_DEFENSE_DV = 10;
export const GEN2_SHINY_SPEED_DV = 10;
export const GEN2_SHINY_SPECIAL_DV = 10;
export const GEN2_SHINY_ATTACK_DVS = [2, 3, 6, 7, 10, 11, 14, 15];

// Status condition masks
export const GEN2_STATUS_SLEEP_MASK = 0x07;
export const GEN2_STATUS_POISONED = 0x08;
export const GEN2_STATUS_BURNED = 0x10;
export const GEN2_STATUS_FROZEN = 0x20;
export const GEN2_STATUS_PARALYZED = 0x40;

// Caught data masks
export const GEN2_CAUGHT_LEVEL_MASK = 0x3F;
export const GEN2_CAUGHT_TIME_MASK = 0xC0;
export const GEN2_CAUGHT_GENDER_MASK = 0x80;
