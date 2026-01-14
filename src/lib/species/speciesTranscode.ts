/**
 * Species name and ID utilities for Gen 3
 * Maps species IDs to names for display
 */

// Basic species name mapping (Gen 1-3)
// This is a subset - full implementation would have all 386 species
export const SPECIES_NAMES: Record<number, string> = {
  0: 'None',
  1: 'Bulbasaur',
  2: 'Ivysaur',
  3: 'Venusaur',
  4: 'Charmander',
  5: 'Charmeleon',
  6: 'Charizard',
  7: 'Squirtle',
  8: 'Wartortle',
  9: 'Blastoise',
  10: 'Caterpie',
  11: 'Metapod',
  12: 'Butterfree',
  13: 'Weedle',
  14: 'Kakuna',
  15: 'Beedrill',
  16: 'Pidgey',
  17: 'Pidgeotto',
  18: 'Pidgeot',
  19: 'Rattata',
  20: 'Raticate',
  21: 'Spearow',
  22: 'Fearow',
  23: 'Ekans',
  24: 'Arbok',
  25: 'Pikachu',
  26: 'Raichu',
  27: 'Sandshrew',
  28: 'Sandslash',
  29: 'Nidoran♀',
  30: 'Nidorina',
  31: 'Nidoqueen',
  32: 'Nidoran♂',
  33: 'Nidorino',
  34: 'Nidoking',
  35: 'Clefairy',
  36: 'Clefable',
  37: 'Vulpix',
  38: 'Ninetales',
  39: 'Jigglypuff',
  40: 'Wigglytuff',
  41: 'Zubat',
  42: 'Golbat',
  43: 'Oddish',
  44: 'Gloom',
  45: 'Vileplume',
  46: 'Paras',
  47: 'Parasect',
  48: 'Venonat',
  49: 'Venomoth',
  50: 'Diglett',
  // ... (abbreviated for brevity, add full list in production)
  150: 'Mewtwo',
  151: 'Mew',
  252: 'Treecko',
  253: 'Grovyle',
  254: 'Sceptile',
  255: 'Torchic',
  256: 'Combusken',
  257: 'Blaziken',
  258: 'Mudkip',
  259: 'Marshtomp',
  260: 'Swampert',
  261: 'Poochyena',
  262: 'Mightyena',
  263: 'Zigzagoon',
  264: 'Linoone',
  265: 'Wurmple',
  266: 'Silcoon',
  267: 'Beautifly',
  268: 'Cascoon',
  269: 'Dustox',
  270: 'Lotad',
  271: 'Lombre',
  272: 'Ludicolo',
  273: 'Seedot',
  274: 'Nuzleaf',
  275: 'Shiftry',
  // Add more as needed
  380: 'Latias',
  381: 'Latios',
  382: 'Kyogre',
  383: 'Groudon',
  384: 'Rayquaza',
  385: 'Jirachi',
  386: 'Deoxys',
};

/**
 * Get species name by ID
 */
export function getSpeciesName(speciesId: number): string {
  return SPECIES_NAMES[speciesId] ?? `Unknown (${speciesId})`;
}

/**
 * Get species ID by name (case-insensitive)
 */
export function getSpeciesId(name: string): number | undefined {
  const normalizedName = name.toLowerCase();
  for (const [id, speciesName] of Object.entries(SPECIES_NAMES)) {
    if (speciesName.toLowerCase() === normalizedName) {
      return parseInt(id, 10);
    }
  }
  return undefined;
}

/**
 * Check if a species ID is valid for Gen 3
 */
export function isValidGen3Species(speciesId: number): boolean {
  return speciesId >= 1 && speciesId <= 386;
}

/**
 * Gen 3 character encoding table
 * Maps Gen 3 character codes to Unicode
 */
export const GEN3_CHAR_MAP: Record<number, string> = {
  0x00: ' ',
  0xFF: '', // Terminator
  // Letters (uppercase)
  0xBB: 'A', 0xBC: 'B', 0xBD: 'C', 0xBE: 'D', 0xBF: 'E',
  0xC0: 'F', 0xC1: 'G', 0xC2: 'H', 0xC3: 'I', 0xC4: 'J',
  0xC5: 'K', 0xC6: 'L', 0xC7: 'M', 0xC8: 'N', 0xC9: 'O',
  0xCA: 'P', 0xCB: 'Q', 0xCC: 'R', 0xCD: 'S', 0xCE: 'T',
  0xCF: 'U', 0xD0: 'V', 0xD1: 'W', 0xD2: 'X', 0xD3: 'Y',
  0xD4: 'Z',
  // Letters (lowercase)
  0xD5: 'a', 0xD6: 'b', 0xD7: 'c', 0xD8: 'd', 0xD9: 'e',
  0xDA: 'f', 0xDB: 'g', 0xDC: 'h', 0xDD: 'i', 0xDE: 'j',
  0xDF: 'k', 0xE0: 'l', 0xE1: 'm', 0xE2: 'n', 0xE3: 'o',
  0xE4: 'p', 0xE5: 'q', 0xE6: 'r', 0xE7: 's', 0xE8: 't',
  0xE9: 'u', 0xEA: 'v', 0xEB: 'w', 0xEC: 'x', 0xED: 'y',
  0xEE: 'z',
  // Numbers
  0xA1: '0', 0xA2: '1', 0xA3: '2', 0xA4: '3', 0xA5: '4',
  0xA6: '5', 0xA7: '6', 0xA8: '7', 0xA9: '8', 0xAA: '9',
  // Special characters
  0xAB: '!', 0xAC: '?', 0xAD: '.', 0xAE: '-',
  0xB8: '♂', 0xB9: '♀',
};

/**
 * Decode Gen 3 encoded string to Unicode
 */
export function decodeGen3String(bytes: Uint8Array): string {
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte === 0xFF || byte === 0x00) break; // Terminator
    const char = GEN3_CHAR_MAP[byte!] ?? String.fromCharCode(byte!);
    chars.push(char);
  }
  return chars.join('');
}

/**
 * Encode Unicode string to Gen 3 encoding
 */
export function encodeGen3String(str: string, maxLength: number): Uint8Array {
  const bytes = new Uint8Array(maxLength);
  bytes.fill(0xFF); // Fill with terminators

  const reverseMap: Record<string, number> = {};
  for (const [code, char] of Object.entries(GEN3_CHAR_MAP)) {
    if (char) reverseMap[char] = parseInt(code, 10);
  }

  for (let i = 0; i < Math.min(str.length, maxLength); i++) {
    const char = str[i];
    if (!char) continue;
    const code = reverseMap[char];
    if (code !== undefined) {
      bytes[i] = code;
    } else {
      // Fallback to ASCII
      bytes[i] = char.charCodeAt(0);
    }
  }

  return bytes;
}
