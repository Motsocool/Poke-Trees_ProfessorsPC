/**
 * Gen 2 (Gold/Silver/Crystal) save file constants
 * Based on: https://github.com/pret/pokecrystal
 */

// Save file size
export const GEN2_SAVE_SIZE = 0x8000; // 32KB (32768 bytes)

// Trainer data
export const GEN2_PLAYER_NAME_OFFSET = 0x2009;
export const GEN2_PLAYER_NAME_LENGTH = 11;
export const GEN2_PLAYER_ID_OFFSET = 0x2009 + 0x7;

// Checksum
export const GEN2_CHECKSUM_OFFSET = 0x2D0D;

// Box data
export const GEN2_CURRENT_BOX_OFFSET = 0x2724;
export const GEN2_NUM_BOXES = 14;
export const GEN2_POKEMON_PER_BOX = 20;
export const GEN2_CURRENT_BOX_DATA_OFFSET = 0x2D6C;
export const GEN2_BOX_1_7_OFFSET = 0x4000;
export const GEN2_BOX_8_14_OFFSET = 0x6000;
export const GEN2_BOX_SIZE = 0x450;

// Pokémon data structure sizes
export const GEN2_POKEMON_DATA_SIZE = 48;
export const GEN2_POKEMON_BOX_DATA_SIZE = 32;

// Pokémon data offsets
export const GEN2_SPECIES_OFFSET = 0;
export const GEN2_HELD_ITEM_OFFSET = 1;
export const GEN2_MOVES_OFFSET = 2;
export const GEN2_OT_ID_OFFSET = 6;
export const GEN2_EXP_OFFSET = 8;
export const GEN2_HP_EV_OFFSET = 11;
export const GEN2_ATTACK_EV_OFFSET = 13;
export const GEN2_DEFENSE_EV_OFFSET = 15;
export const GEN2_SPEED_EV_OFFSET = 17;
export const GEN2_SPECIAL_EV_OFFSET = 19;
export const GEN2_DV_OFFSET = 21; // 2 bytes packed
export const GEN2_PP_OFFSET = 23;
export const GEN2_FRIENDSHIP_OFFSET = 27;
export const GEN2_POKERUS_OFFSET = 28;
export const GEN2_LEVEL_OFFSET = 31;

// String lengths
export const GEN2_OT_NAME_LENGTH = 11;
export const GEN2_NICKNAME_LENGTH = 11;
export const GEN2_STRING_TERMINATOR = 0x50;

// Shiny determination values (for Gen 2)
export const GEN2_SHINY_DEFENSE_DV = 10;
export const GEN2_SHINY_SPEED_DV = 10;
export const GEN2_SHINY_SPECIAL_DV = 10;
export const GEN2_SHINY_ATTACK_DVS = [2, 3, 6, 7, 10, 11, 14, 15];
