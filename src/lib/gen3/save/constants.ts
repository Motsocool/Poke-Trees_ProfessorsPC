/**
 * Gen 3 save file and Pokémon data constants
 */

// Gen 3 save file structure
export const GEN3_SAVE_SIZE = 0x20000; // 131072 bytes (128 KB)
export const GEN3_SAVE_SLOT_SIZE = 0xE000; // 57344 bytes per save slot
export const GEN3_SECTION_SIZE = 0x1000; // 4096 bytes per section
export const GEN3_SECTION_DATA_SIZE = 0xFF4; // 4084 bytes of data per section
export const GEN3_SECTION_FOOTER_SIZE = 12; // 12-byte footer per section
export const GEN3_NUM_SECTIONS = 14;

// Save slot offsets
export const GEN3_SAVE_SLOT_A = 0x0000;
export const GEN3_SAVE_SLOT_B = 0xE000;

// Section IDs
export const SECTION_ID_TRAINER_INFO = 0;
export const SECTION_ID_TEAM_ITEMS = 1;
export const SECTION_ID_GAME_STATE = 2;
export const SECTION_ID_MISC_DATA = 3;
export const SECTION_ID_RIVAL_INFO = 4;
export const SECTION_ID_PC_BUFFER_A = 5;
export const SECTION_ID_PC_BUFFER_B = 6;
export const SECTION_ID_PC_BUFFER_C = 7;
export const SECTION_ID_PC_BUFFER_D = 8;
export const SECTION_ID_PC_BUFFER_E = 9;
export const SECTION_ID_PC_BUFFER_F = 10;
export const SECTION_ID_PC_BUFFER_G = 11;
export const SECTION_ID_PC_BUFFER_H = 12;
export const SECTION_ID_PC_BUFFER_I = 13;

// Section footer structure (last 12 bytes of each 4096-byte section)
export const SECTION_FOOTER_OFFSET = 0xFF4;
export const SECTION_FOOTER_ID_OFFSET = 0xFF4; // u16
export const SECTION_FOOTER_CHECKSUM_OFFSET = 0xFF6; // u16
export const SECTION_FOOTER_SIGNATURE_OFFSET = 0xFF8; // u32 (0x08012025 magic)
export const SECTION_FOOTER_SAVE_INDEX_OFFSET = 0xFFC; // u32 (save counter)

// Expected section signature
export const GEN3_SECTION_SIGNATURE = 0x08012025;

// pk3 structure
export const PK3_SIZE = 80; // pk3 is exactly 80 bytes
export const PK3_DATA_SIZE = 48; // Encrypted substructure data
export const PK3_GROWTH_SIZE = 12;
export const PK3_ATTACKS_SIZE = 12;
export const PK3_EVS_SIZE = 12;
export const PK3_MISC_SIZE = 12;

// pk3 offsets
export const PK3_PERSONALITY_OFFSET = 0x00; // u32 PID
export const PK3_OT_ID_OFFSET = 0x04; // u32 (TID + SID)
export const PK3_NICKNAME_OFFSET = 0x08; // 10 bytes
export const PK3_LANGUAGE_OFFSET = 0x12; // u16
export const PK3_OT_NAME_OFFSET = 0x14; // 7 bytes
export const PK3_MARKINGS_OFFSET = 0x1B; // u8
export const PK3_CHECKSUM_OFFSET = 0x1C; // u16
export const PK3_UNKNOWN_OFFSET = 0x1E; // u16
export const PK3_DATA_OFFSET = 0x20; // 48 bytes of encrypted data

// pk3 substructure order based on PID % 24
export const PK3_SUBSTRUCTURE_ORDERS = [
  [0, 1, 2, 3], // Growth, Attacks, EVs, Misc
  [0, 1, 3, 2],
  [0, 2, 1, 3],
  [0, 3, 1, 2],
  [0, 2, 3, 1],
  [0, 3, 2, 1],
  [1, 0, 2, 3],
  [1, 0, 3, 2],
  [2, 0, 1, 3],
  [3, 0, 1, 2],
  [2, 0, 3, 1],
  [3, 0, 2, 1],
  [1, 2, 0, 3],
  [1, 3, 0, 2],
  [2, 1, 0, 3],
  [3, 1, 0, 2],
  [2, 3, 0, 1],
  [3, 2, 0, 1],
  [1, 2, 3, 0],
  [1, 3, 2, 0],
  [2, 1, 3, 0],
  [3, 1, 2, 0],
  [2, 3, 1, 0],
  [3, 2, 1, 0],
];

// PC Box structure
export const BOX_NAME_LENGTH = 9;
export const BOX_SIZE = 30; // 30 Pokémon per box
export const NUM_BOXES = 14; // Gen 3 has 14 boxes

// PC data is stored across sections 5-13 (9 sections)
// Each section contains partial box data
export const PC_BUFFER_SIZE = 0xFF4 * 9; // Total PC buffer across 9 sections

// Species IDs (subset for now, full table needed for production)
export const SPECIES_NONE = 0;
export const SPECIES_BULBASAUR = 1;
export const SPECIES_PIKACHU = 25;
export const SPECIES_MEW = 151;
export const SPECIES_TREECKO = 252;
export const SPECIES_TORCHIC = 255;
export const SPECIES_MUDKIP = 258;

// Growth substructure offsets (relative to substructure start)
export const GROWTH_SPECIES_OFFSET = 0;
export const GROWTH_ITEM_OFFSET = 2;
export const GROWTH_EXPERIENCE_OFFSET = 4;
export const GROWTH_PP_BONUSES_OFFSET = 8;
export const GROWTH_FRIENDSHIP_OFFSET = 9;

// Attacks substructure offsets
export const ATTACKS_MOVE1_OFFSET = 0;
export const ATTACKS_MOVE2_OFFSET = 2;
export const ATTACKS_MOVE3_OFFSET = 4;
export const ATTACKS_MOVE4_OFFSET = 6;
export const ATTACKS_PP1_OFFSET = 8;
export const ATTACKS_PP2_OFFSET = 9;
export const ATTACKS_PP3_OFFSET = 10;
export const ATTACKS_PP4_OFFSET = 11;

// EVs & Condition substructure offsets
export const EVS_HP_OFFSET = 0;
export const EVS_ATTACK_OFFSET = 1;
export const EVS_DEFENSE_OFFSET = 2;
export const EVS_SPEED_OFFSET = 3;
export const EVS_SPATK_OFFSET = 4;
export const EVS_SPDEF_OFFSET = 5;
export const EVS_COOLNESS_OFFSET = 6;
export const EVS_BEAUTY_OFFSET = 7;
export const EVS_CUTENESS_OFFSET = 8;
export const EVS_SMARTNESS_OFFSET = 9;
export const EVS_TOUGHNESS_OFFSET = 10;
export const EVS_FEEL_OFFSET = 11;

// Misc substructure offsets
export const MISC_POKERUS_OFFSET = 0;
export const MISC_MET_LOCATION_OFFSET = 1;
export const MISC_ORIGINS_OFFSET = 2; // u16: contains level met, game of origin, ball, OT gender
export const MISC_IVS_OFFSET = 4; // u32: contains IVs, eggs, ability
export const MISC_RIBBONS_OFFSET = 8; // u32
