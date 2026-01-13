/**
 * Gen 1 (Red/Blue/Yellow) save file constants
 * Based on: https://github.com/pret/pokered
 */

// Save file size
export const GEN1_SAVE_SIZE = 0x8000; // 32KB (32768 bytes)

// Trainer data
export const GEN1_PLAYER_NAME_OFFSET = 0x2598;
export const GEN1_PLAYER_NAME_LENGTH = 11;
export const GEN1_PLAYER_ID_OFFSET = 0x2605;

// Checksum
export const GEN1_CHECKSUM_OFFSET = 0x3523;

// Box data
export const GEN1_CURRENT_BOX_OFFSET = 0x284C;
export const GEN1_NUM_BOXES = 12;
export const GEN1_POKEMON_PER_BOX = 20;
export const GEN1_CURRENT_BOX_DATA_OFFSET = 0x30C0;
export const GEN1_BOX_1_6_OFFSET = 0x4000;
export const GEN1_BOX_7_12_OFFSET = 0x6000;
export const GEN1_BOX_SIZE = 462;

// Pokémon data structure sizes
export const GEN1_POKEMON_DATA_SIZE = 44;
export const GEN1_POKEMON_BOX_DATA_SIZE = 33;

// Pokémon data offsets
export const GEN1_SPECIES_OFFSET = 0;
export const GEN1_CURRENT_HP_OFFSET = 1;
export const GEN1_LEVEL_OFFSET = 3;
export const GEN1_STATUS_OFFSET = 4;
export const GEN1_MOVES_OFFSET = 8;
export const GEN1_OT_ID_OFFSET = 12;
export const GEN1_EXP_OFFSET = 14;
export const GEN1_HP_EV_OFFSET = 17;
export const GEN1_ATTACK_EV_OFFSET = 19;
export const GEN1_DEFENSE_EV_OFFSET = 21;
export const GEN1_SPEED_EV_OFFSET = 23;
export const GEN1_SPECIAL_EV_OFFSET = 25;
export const GEN1_DV_OFFSET = 27; // 2 bytes packed
export const GEN1_PP_OFFSET = 29;

// String lengths
export const GEN1_OT_NAME_LENGTH = 11;
export const GEN1_NICKNAME_LENGTH = 11;
export const GEN1_STRING_TERMINATOR = 0x50;
