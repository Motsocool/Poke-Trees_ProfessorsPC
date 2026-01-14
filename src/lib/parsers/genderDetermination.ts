/**
 * Gender determination for Pokemon Gen 1-3
 * Based on species gender ratios and personality/DV values
 */

/**
 * Gender ratio types
 */
export enum GenderRatio {
  MALE_ONLY = 0,      // 100% male (e.g., Nidoran♂, Hitmonlee)
  MALE_87_5 = 31,     // 87.5% male (most starters)
  MALE_75 = 63,       // 75% male
  MALE_50 = 127,      // 50% male / 50% female
  MALE_25 = 191,      // 25% male / 75% female
  FEMALE_ONLY = 254,  // 100% female (e.g., Nidoran♀, Chansey)
  GENDERLESS = 255,   // Genderless (e.g., Magnemite, Staryu, legendaries)
}

/**
 * Species to gender ratio mapping
 * Key: species ID (1-386 for Gen 3)
 * Value: Gender ratio threshold
 */
const SPECIES_GENDER_RATIOS: { [key: number]: number } = {
  // Gen 1 starters (87.5% male)
  1: GenderRatio.MALE_87_5,   // Bulbasaur
  2: GenderRatio.MALE_87_5,   // Ivysaur
  3: GenderRatio.MALE_87_5,   // Venusaur
  4: GenderRatio.MALE_87_5,   // Charmander
  5: GenderRatio.MALE_87_5,   // Charmeleon
  6: GenderRatio.MALE_87_5,   // Charizard
  7: GenderRatio.MALE_87_5,   // Squirtle
  8: GenderRatio.MALE_87_5,   // Wartortle
  9: GenderRatio.MALE_87_5,   // Blastoise
  
  // Common Gen 1 Pokemon
  25: GenderRatio.MALE_50,    // Pikachu
  26: GenderRatio.MALE_50,    // Raichu
  32: GenderRatio.MALE_ONLY,  // Nidoran♂
  29: GenderRatio.FEMALE_ONLY,// Nidoran♀
  81: GenderRatio.GENDERLESS, // Magnemite
  82: GenderRatio.GENDERLESS, // Magneton
  120: GenderRatio.GENDERLESS,// Staryu
  121: GenderRatio.GENDERLESS,// Starmie
  113: GenderRatio.FEMALE_ONLY,// Chansey
  106: GenderRatio.MALE_ONLY, // Hitmonlee
  107: GenderRatio.MALE_ONLY, // Hitmonchan
  122: GenderRatio.MALE_50,   // Mr. Mime
  127: GenderRatio.MALE_50,   // Pinsir
  128: GenderRatio.MALE_ONLY, // Tauros
  131: GenderRatio.MALE_50,   // Lapras
  132: GenderRatio.GENDERLESS,// Ditto
  133: GenderRatio.MALE_87_5, // Eevee
  134: GenderRatio.MALE_87_5, // Vaporeon
  135: GenderRatio.MALE_87_5, // Jolteon
  136: GenderRatio.MALE_87_5, // Flareon
  143: GenderRatio.MALE_87_5, // Snorlax
  144: GenderRatio.GENDERLESS,// Articuno
  145: GenderRatio.GENDERLESS,// Zapdos
  146: GenderRatio.GENDERLESS,// Moltres
  150: GenderRatio.GENDERLESS,// Mewtwo
  151: GenderRatio.GENDERLESS,// Mew
  
  // Gen 2 starters (87.5% male)
  152: GenderRatio.MALE_87_5, // Chikorita
  153: GenderRatio.MALE_87_5, // Bayleef
  154: GenderRatio.MALE_87_5, // Meganium
  155: GenderRatio.MALE_87_5, // Cyndaquil
  156: GenderRatio.MALE_87_5, // Quilava
  157: GenderRatio.MALE_87_5, // Typhlosion
  158: GenderRatio.MALE_87_5, // Totodile
  159: GenderRatio.MALE_87_5, // Croconaw
  160: GenderRatio.MALE_87_5, // Feraligatr
  
  // Gen 2 Pokemon
  175: GenderRatio.MALE_87_5, // Togepi
  176: GenderRatio.MALE_87_5, // Togetic
  196: GenderRatio.MALE_87_5, // Espeon
  197: GenderRatio.MALE_87_5, // Umbreon
  236: GenderRatio.MALE_ONLY, // Tyrogue
  237: GenderRatio.MALE_ONLY, // Hitmontop
  238: GenderRatio.MALE_50,   // Smoochum
  239: GenderRatio.MALE_50,   // Elekid
  240: GenderRatio.MALE_50,   // Magby
  241: GenderRatio.FEMALE_ONLY,// Miltank
  242: GenderRatio.FEMALE_ONLY,// Blissey
  243: GenderRatio.GENDERLESS,// Raikou
  244: GenderRatio.GENDERLESS,// Entei
  245: GenderRatio.GENDERLESS,// Suicune
  249: GenderRatio.GENDERLESS,// Lugia
  250: GenderRatio.GENDERLESS,// Ho-Oh
  251: GenderRatio.GENDERLESS,// Celebi
  
  // Gen 3 starters (87.5% male)
  252: GenderRatio.MALE_87_5, // Treecko
  253: GenderRatio.MALE_87_5, // Grovyle
  254: GenderRatio.MALE_87_5, // Sceptile
  255: GenderRatio.MALE_87_5, // Torchic
  256: GenderRatio.MALE_87_5, // Combusken
  257: GenderRatio.MALE_87_5, // Blaziken
  258: GenderRatio.MALE_87_5, // Mudkip
  259: GenderRatio.MALE_87_5, // Marshtomp
  260: GenderRatio.MALE_87_5, // Swampert
  
  // Gen 3 Pokemon
  280: GenderRatio.MALE_50,   // Ralts
  281: GenderRatio.MALE_50,   // Kirlia
  282: GenderRatio.MALE_50,   // Gardevoir
  292: GenderRatio.GENDERLESS,// Shedinja
  303: GenderRatio.MALE_50,   // Mawile
  337: GenderRatio.GENDERLESS,// Lunatone
  338: GenderRatio.GENDERLESS,// Solrock
  343: GenderRatio.GENDERLESS,// Baltoy
  344: GenderRatio.GENDERLESS,// Claydol
  374: GenderRatio.GENDERLESS,// Beldum
  375: GenderRatio.GENDERLESS,// Metang
  376: GenderRatio.GENDERLESS,// Metagross
  377: GenderRatio.GENDERLESS,// Regirock
  378: GenderRatio.GENDERLESS,// Regice
  379: GenderRatio.GENDERLESS,// Registeel
  380: GenderRatio.FEMALE_ONLY,// Latias
  381: GenderRatio.MALE_ONLY, // Latios
  382: GenderRatio.GENDERLESS,// Kyogre
  383: GenderRatio.GENDERLESS,// Groudon
  384: GenderRatio.GENDERLESS,// Rayquaza
  385: GenderRatio.GENDERLESS,// Jirachi
  386: GenderRatio.GENDERLESS,// Deoxys
};

/**
 * Get gender ratio for a species
 * Returns 50/50 ratio if species not found
 */
function getGenderRatio(species: number): number {
  return SPECIES_GENDER_RATIOS[species] ?? GenderRatio.MALE_50;
}

/**
 * Determine gender for Gen 3 Pokemon based on personality value
 * @param species Pokemon species ID
 * @param personality Personality value (32-bit)
 * @returns 'M' for male, 'F' for female, 'U' for genderless
 */
export function determineGen3Gender(species: number, personality: number): 'M' | 'F' | 'U' {
  const ratio = getGenderRatio(species);
  
  // Check for genderless
  if (ratio === GenderRatio.GENDERLESS) {
    return 'U';
  }
  
  // Check for male-only
  if (ratio === GenderRatio.MALE_ONLY) {
    return 'M';
  }
  
  // Check for female-only
  if (ratio === GenderRatio.FEMALE_ONLY) {
    return 'F';
  }
  
  // Compare lower byte of personality against gender ratio
  const genderByte = personality & 0xFF;
  
  return genderByte < ratio ? 'F' : 'M';
}

/**
 * Determine gender for Gen 2 Pokemon based on Attack DV
 * Gen 2 uses Attack DV with species-specific thresholds
 * @param species Pokemon species ID
 * @param attackDV Attack DV (0-15)
 * @returns 'M' for male, 'F' for female, 'U' for genderless/unknown
 */
export function determineGen2Gender(species: number, attackDV: number): 'M' | 'F' | 'U' {
  const ratio = getGenderRatio(species);
  
  // Check for genderless
  if (ratio === GenderRatio.GENDERLESS) {
    return 'U';
  }
  
  // Check for male-only
  if (ratio === GenderRatio.MALE_ONLY) {
    return 'M';
  }
  
  // Check for female-only
  if (ratio === GenderRatio.FEMALE_ONLY) {
    return 'F';
  }
  
  // Gen 2 gender determination uses Attack DV (0-15)
  // Convert ratio (0-255) to DV scale (0-15)
  // Formula: if attackDV <= (ratio * 15 / 255), then female
  const threshold = Math.floor((ratio * 15) / 255);
  
  return attackDV <= threshold ? 'F' : 'M';
}

/**
 * Check if species has gender mechanics
 */
export function hasGender(species: number): boolean {
  const ratio = getGenderRatio(species);
  return ratio !== GenderRatio.GENDERLESS;
}
