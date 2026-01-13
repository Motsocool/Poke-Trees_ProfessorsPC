/**
 * Data loader for useful_data files
 * Loads reference data for text encoding, Pokémon names, and experience tables
 */

export type Generation = 'Gen1' | 'Gen2' | 'Gen3';

/**
 * Text conversion table for character encoding/decoding
 */
export interface TextConvTable {
  [char: string]: number;
}

/**
 * Reverse text conversion table for decoding
 */
export interface ReverseTextConvTable {
  [code: number]: string;
}

/**
 * Cached data for each generation
 */
interface GenerationData {
  textConvTable?: TextConvTable;
  reverseTextConvTable?: ReverseTextConvTable;
  pokemonNames?: string[];
  expTable?: number[];
}

const dataCache: Record<Generation, GenerationData> = {
  Gen1: {},
  Gen2: {},
  Gen3: {},
};

/**
 * Get the path to a data file for a specific generation
 */
export function getDataPath(gen: Generation, filename: string): string {
  return `/useful_data/${gen}/${filename}`;
}

/**
 * Load the text conversion table from text_conv.txt
 */
export async function loadTextConvTable(gen: Generation): Promise<TextConvTable> {
  // Check cache first
  if (dataCache[gen].textConvTable) {
    return dataCache[gen].textConvTable!;
  }

  const path = getDataPath(gen, 'text_conv.txt');
  const response = await fetch(path);
  
  if (!response.ok) {
    throw new Error(`Failed to load text_conv.txt for ${gen}: ${response.statusText}`);
  }

  const text = await response.text();
  const table: TextConvTable = {};

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Parse lines like "A 128" or "' 224"
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const char = parts[0]!;
      const code = parseInt(parts[1]!, 10);
      if (!isNaN(code)) {
        table[char] = code;
      }
    }
  }

  // Cache the result
  dataCache[gen].textConvTable = table;
  return table;
}

/**
 * Get reverse text conversion table (for decoding)
 */
export async function getReverseTextConvTable(gen: Generation): Promise<ReverseTextConvTable> {
  // Check cache first
  if (dataCache[gen].reverseTextConvTable) {
    return dataCache[gen].reverseTextConvTable!;
  }

  const table = await loadTextConvTable(gen);
  const reverseTable: ReverseTextConvTable = {};

  for (const [char, code] of Object.entries(table)) {
    reverseTable[code] = char;
  }

  // Cache the result
  dataCache[gen].reverseTextConvTable = reverseTable;
  return reverseTable;
}

/**
 * Encode a string to game bytes using text_conv.txt
 */
export async function encodePokemonText(
  text: string,
  gen: Generation
): Promise<number[]> {
  const convTable = await loadTextConvTable(gen);
  return text.split('').map(c => convTable[c] ?? 0); // 0 as fallback for unknown chars
}

/**
 * Decode game bytes to string using text_conv.txt
 */
export async function decodePokemonText(
  byteList: number[],
  gen: Generation
): Promise<string> {
  const reverseTable = await getReverseTextConvTable(gen);
  return byteList.map(b => reverseTable[b] ?? '?').join('');
}

/**
 * Load Pokémon names from pokemon_names.txt
 */
export async function loadPokemonNames(gen: Generation): Promise<string[]> {
  // Check cache first
  if (dataCache[gen].pokemonNames) {
    return dataCache[gen].pokemonNames!;
  }

  const path = getDataPath(gen, 'pokemon_names.txt');
  const response = await fetch(path);
  
  if (!response.ok) {
    throw new Error(`Failed to load pokemon_names.txt for ${gen}: ${response.statusText}`);
  }

  const text = await response.text();
  const names: string[] = [];

  for (const line of text.split('\n')) {
    const name = line.trim();
    if (name) {
      names.push(name);
    }
  }

  // Cache the result
  dataCache[gen].pokemonNames = names;
  return names;
}

/**
 * Get Pokémon name from index
 */
export async function getPokemonName(
  speciesIndex: number,
  gen: Generation
): Promise<string> {
  const names = await loadPokemonNames(gen);
  return names[speciesIndex] ?? `Unknown (${speciesIndex})`;
}

/**
 * Load experience table from pokemon_exp.txt
 */
export async function loadExpTable(gen: Generation): Promise<number[]> {
  // Check cache first
  if (dataCache[gen].expTable) {
    return dataCache[gen].expTable!;
  }

  const path = getDataPath(gen, 'pokemon_exp.txt');
  const response = await fetch(path);
  
  if (!response.ok) {
    throw new Error(`Failed to load pokemon_exp.txt for ${gen}: ${response.statusText}`);
  }

  const text = await response.text();
  const expTable: number[] = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Parse lines like "0 0 1 -54 1 0" or single numbers
    // For now, we'll just take the first number on each line
    // This represents the total experience for each level
    const parts = trimmed.split(/\s+/);
    if (parts.length > 0) {
      const exp = parseInt(parts[0]!, 10);
      if (!isNaN(exp)) {
        expTable.push(exp);
      }
    }
  }

  // Cache the result
  dataCache[gen].expTable = expTable;
  return expTable;
}

/**
 * Get level from experience points
 */
export async function getLevelFromExp(
  exp: number,
  gen: Generation
): Promise<number> {
  const expTable = await loadExpTable(gen);
  
  for (let level = 0; level < expTable.length; level++) {
    if (exp < expTable[level]!) {
      return level;
    }
  }
  
  return expTable.length;
}

/**
 * Clear all cached data (useful for testing)
 */
export function clearDataCache(): void {
  for (const gen of Object.keys(dataCache) as Generation[]) {
    dataCache[gen] = {};
  }
}
