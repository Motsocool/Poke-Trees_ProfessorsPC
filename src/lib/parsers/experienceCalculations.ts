/**
 * Experience and level calculation for Pokemon Gen 3
 * Uses data from pokemon_exp.txt and pokemon_exp_groups.bin
 */

import { isValidSpeciesId, isValidExperience, isValidGrowthRate } from '../gen3/validation';

/**
 * Growth rate types (0-5)
 * Based on Gen 3 mechanics
 */
export enum GrowthRate {
  MEDIUM_FAST = 0,  // Erratic in some sources
  SLOW = 1,
  MEDIUM_SLOW = 2,
  FAST = 3,
  ERRATIC = 4,      // Medium Fast in some sources
  FLUCTUATING = 5,
}

/**
 * Experience table for levels 1-100
 * Each row represents a level (index 0 = level 1, index 99 = level 100)
 * Each column represents a growth rate (0-5)
 * Row 0 (level 1) is always 0 exp for all growth rates
 * Loaded from pokemon_exp.txt which contains levels 2-100
 */
const EXP_TABLE: number[][] = [
  [0, 0, 0, 0, 0, 0], // Level 1 - always 0 exp
  [15, 6, 8, 9, 10, 4],
  [52, 21, 27, 57, 33, 13],
  [122, 51, 64, 96, 80, 32],
  [237, 100, 125, 135, 156, 65],
  [406, 172, 216, 179, 270, 112],
  [637, 274, 343, 236, 428, 178],
  [942, 409, 512, 314, 640, 276],
  [1326, 583, 729, 419, 911, 393],
  [1800, 800, 1000, 560, 1250, 540],
  [2369, 1064, 1331, 742, 1663, 745],
  [3041, 1382, 1728, 973, 2160, 967],
  [3822, 1757, 2197, 1261, 2746, 1230],
  [4719, 2195, 2744, 1612, 3430, 1591],
  [5737, 2700, 3375, 2035, 4218, 1957],
  [6881, 3276, 4096, 2535, 5120, 2457],
  [8155, 3930, 4913, 3120, 6141, 3046],
  [9564, 4665, 5832, 3798, 7290, 3732],
  [11111, 5487, 6859, 4575, 8573, 4526],
  [12800, 6400, 8000, 5460, 10000, 5440],
  [14632, 7408, 9261, 6458, 11576, 6482],
  [16610, 8518, 10648, 7577, 13310, 7666],
  [18737, 9733, 12167, 8825, 15208, 9003],
  [21012, 11059, 13824, 10208, 17280, 10506],
  [23437, 12500, 15625, 11735, 19531, 12187],
  [26012, 14060, 17576, 13411, 21970, 14060],
  [28737, 15746, 19683, 15244, 24603, 16140],
  [31610, 17561, 21952, 17242, 27440, 18439],
  [34632, 19511, 24389, 19411, 30486, 20974],
  [37800, 21600, 27000, 21760, 33750, 23760],
  [41117, 23832, 29791, 24294, 37238, 26811],
  [44580, 26214, 32768, 27021, 40960, 30146],
  [48197, 28749, 35937, 29949, 44921, 33780],
  [51962, 31443, 39304, 33084, 49130, 37731],
  [55872, 34300, 42875, 36435, 53593, 42017],
  [59927, 37324, 46656, 40007, 58320, 46656],
  [64132, 40522, 50653, 43808, 63316, 51685],
  [68482, 43897, 54872, 47846, 68590, 57097],
  [72977, 47455, 59319, 52127, 74148, 62913],
  [77622, 51200, 64000, 56660, 80000, 69173],
  [82412, 55136, 68921, 61450, 86151, 75896],
  [87352, 59270, 74088, 66505, 92610, 83102],
  [92437, 63605, 79507, 71833, 99383, 90813],
  [97672, 68147, 85184, 77440, 106480, 99072],
  [103052, 72900, 91125, 83335, 113906, 107913],
  [108577, 77868, 97336, 89523, 121670, 117367],
  [114247, 83058, 103823, 96012, 129778, 127473],
  [120072, 88473, 110592, 102810, 138240, 138267],
  [126042, 94119, 117649, 109923, 147061, 149787],
  [132157, 100000, 125000, 117360, 156250, 162080],
  [138417, 106120, 132651, 125126, 165813, 175194],
  [144822, 112486, 140608, 133229, 175760, 189168],
  [151372, 119101, 148877, 141677, 186096, 204024],
  [158067, 125971, 157464, 150476, 196830, 219801],
  [164907, 133100, 166375, 159635, 207968, 236523],
  [171892, 140492, 175616, 169159, 219520, 254240],
  [179022, 148154, 185193, 179056, 231491, 273007],
  [186297, 156089, 195112, 189334, 243890, 292878],
  [193717, 164303, 205379, 200037, 256723, 313927],
  [201282, 172798, 216000, 211164, 270000, 336213],
  [208992, 181584, 226981, 222737, 283726, 359879],
  [216847, 190662, 238328, 234749, 297910, 385003],
  [224842, 200037, 250047, 247212, 312558, 411671],
  [232992, 209715, 262144, 260122, 327680, 439939],
  [241277, 219700, 274625, 273495, 343281, 469863],
  [249707, 229996, 287496, 287336, 359370, 501521],
  [258282, 240610, 300763, 301651, 375953, 535012],
  [267002, 251545, 314432, 316460, 393040, 570420],
  [275867, 262807, 328509, 331776, 410636, 607785],
  [284877, 274400, 343000, 347600, 428750, 647157],
  [294032, 286328, 357911, 363963, 447388, 688618],
  [303327, 298598, 373248, 380872, 466560, 732257],
  [312777, 311213, 389017, 398338, 486271, 778154],
  [322362, 324179, 405224, 416369, 506530, 826398],
  [332097, 337500, 421875, 434975, 527343, 877071],
  [341977, 351180, 438976, 454164, 548720, 930273],
  [352002, 365226, 456533, 473953, 570666, 986027],
  [362167, 379641, 474552, 494349, 593190, 1044440],
  [372477, 394431, 493039, 515366, 616298, 1105618],
  [382932, 409600, 512000, 537010, 640000, 1169679],
  [393532, 425152, 531441, 559274, 664301, 1236645],
  [404272, 441094, 551368, 582182, 689210, 1306548],
  [415167, 457429, 571787, 605741, 714733, 1379416],
  [426207, 474163, 592704, 629975, 740880, 1455278],
  [437402, 491300, 614125, 654889, 767656, 1534176],
  [448742, 508844, 636056, 680499, 795070, 1616137],
  [460227, 526802, 658503, 706820, 823128, 1701210],
  [471862, 545177, 681472, 733866, 851840, 1789443],
  [483642, 563975, 704969, 761653, 881211, 1880885],
  [495567, 583200, 729000, 790196, 911250, 1975587],
  [507642, 602856, 753571, 819520, 941963, 2073610],
  [519862, 622950, 778688, 849629, 973360, 2174999],
  [532227, 643485, 804357, 880539, 1005446, 2279812],
  [544737, 664467, 830584, 912264, 1038230, 2388103],
  [557392, 685900, 857375, 944819, 1071718, 2499928],
];

/**
 * Pokemon species to growth rate mapping
 * Index is species ID (0-based), value is GrowthRate (0-5)
 * Loaded from pokemon_exp_groups.bin
 */
const SPECIES_GROWTH_RATES: number[] = [
  0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, // 0-15
  3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, // 16-31
  3, 3, 3, 1, 1, 2, 2, 1, 1, 2, 2, 3, 3, 3, 2, 2, // 32-47
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 3, 3, 3, 3, // 48-63
  3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 2, 2, 2, // 64-79
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 3, 3, 3, 2, // 80-95
  2, 2, 2, 2, 2, 2, 4, 4, 2, 2, 2, 2, 2, 2, 2, 4, // 96-111
  4, 1, 2, 2, 2, 2, 2, 2, 4, 4, 2, 2, 2, 2, 2, 4, // 112-127
  4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, // 128-143
  4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, // 144-159
  3, 2, 2, 2, 2, 1, 1, 1, 1, 2, 4, 4, 2, 1, 1, 1, // 160-175
  1, 2, 2, 3, 3, 3, 3, 1, 1, 2, 3, 3, 3, 3, 1, 3, // 176-191
  3, 2, 2, 2, 2, 2, 3, 2, 1, 2, 2, 2, 2, 2, 2, 3, // 192-207
  2, 1, 1, 2, 2, 3, 4, 3, 2, 2, 2, 2, 4, 4, 1, 2, // 208-223
  2, 1, 4, 4, 4, 4, 2, 2, 2, 2, 4, 1, 2, 2, 2, 2, // 224-239
  2, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, // 240-255
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 256-271
  0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, // 272-287
  2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 0, 0, 0, // 288-303
  3, 3, 5, 5, 1, 2, 2, 2, 2, 5, 5, 1, 1, 3, 2, 2, // 304-319
  2, 2, 3, 2, 2, 1, 5, 5, 0, 0, 4, 4, 3, 3, 3, 5, // 320-335
  5, 4, 4, 2, 2, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, // 336-351
  1, 2, 2, 1, 2, 2, 0, 0, 2, 1, 1, 3, 4, 4, 4, 5, // 352-367
  5, 4, 3, 3, 3, 0, 0, 0, 3, 1, 1, 5, 0, 4, 4, 4, // 368-383
  4, 2, 0, 5, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, // 384-399
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 2, 4, 2, // 400-415
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, // 416-431
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, // 432-440
];

/**
 * Calculate level from experience points for a given Pokemon species
 * Uses the proper growth rate table lookup
 */
export function calculateLevelFromExp(species: number, exp: number): number {
  // Validate exp value
  if (!isValidExperience(exp)) {
    console.debug(`Invalid experience ${exp}, defaulting to level 1`);
    return 1;
  }
  
  // Validate species ID
  if (!isValidSpeciesId(species)) {
    console.debug(`Invalid species ID ${species} for level calculation, defaulting to level 1`);
    return 1;
  }
  
  // Get growth rate for this species
  const growthRate = SPECIES_GROWTH_RATES[species];
  
  // Check if this is a valid growth rate
  if (!isValidGrowthRate(growthRate)) {
    console.debug(`Invalid growth rate ${growthRate} for species ${species}, defaulting to level 1`);
    return 1;
  }
  
  return calculateLevelFromExpByRate(exp, growthRate);
}

/**
 * Calculate level from experience for a specific growth rate
 * Uses linear search through exp table
 */
function calculateLevelFromExpByRate(exp: number, growthRate: number): number {
  // Validate growth rate (should already be validated, but double-check)
  if (!isValidGrowthRate(growthRate)) {
    console.debug(`Invalid growth rate ${growthRate} in calculateLevelFromExpByRate`);
    return 1;
  }
  
  // Validate exp is reasonable (should already be validated, but double-check)
  if (!isValidExperience(exp)) {
    console.debug(`Suspicious exp value ${exp}, likely corrupted data`);
    return 1;
  }
  
  // Linear search through the exp table for this growth rate
  for (let level = 1; level <= 100; level++) {
    const requiredExp = getExpForLevel(level, growthRate);
    // If we can't get the required exp for this level, something is wrong with our data
    // In this case, we should keep going rather than returning 1
    if (requiredExp === undefined) {
      console.debug(`Warning: Missing exp data for level ${level}, growth rate ${growthRate}`);
      continue;
    }
    if (exp < requiredExp) {
      return Math.max(1, level - 1);
    }
  }
  
  return 100; // Max level
}

/**
 * Get required experience for a given level and growth rate
 */
function getExpForLevel(level: number, growthRate: number): number | undefined {
  if (level <= 1) return 0;
  
  // Validate level
  if (level > 100) {
    const row = EXP_TABLE[99];
    if (!row || row[growthRate] === undefined) {
      return undefined;
    }
    return row[growthRate]; // Max exp for level 100 (index 99)
  }
  
  // Level N is at index N-1 (level 1 at index 0, level 100 at index 99)
  const row = EXP_TABLE[level - 1];
  if (!row || row[growthRate] === undefined) {
    return undefined;
  }
  return row[growthRate];
}

/**
 * Get growth rate name for debugging
 */
export function getGrowthRateName(growthRate: number): string {
  const names = ['Medium Fast', 'Slow', 'Medium Slow', 'Fast', 'Erratic', 'Fluctuating'];
  return names[growthRate] || 'Unknown';
}
