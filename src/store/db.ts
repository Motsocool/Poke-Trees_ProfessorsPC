/**
 * IndexedDB storage layer for Pokémon vault
 * Uses idb library for simplified IndexedDB operations
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { VaultPokemon } from '../lib/types/index.js';

/**
 * Database schema
 */
interface ProfessorsPCDB extends DBSchema {
  pokemon: {
    key: string;
    value: VaultPokemon;
    indexes: {
      'by-species': number;
      'by-source-gen': number;
      'by-import-date': Date;
      'by-legality': number; // 0 = illegal, 1 = legal
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'professors-pc';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ProfessorsPCDB> | null = null;

/**
 * Initialize and open the database
 */
export async function initDB(): Promise<IDBPDatabase<ProfessorsPCDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<ProfessorsPCDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create pokemon store
      if (!db.objectStoreNames.contains('pokemon')) {
        const pokemonStore = db.createObjectStore('pokemon', { keyPath: 'id' });
        
        // Create indexes
        pokemonStore.createIndex('by-species', 'species');
        pokemonStore.createIndex('by-source-gen', 'sourceGeneration');
        pokemonStore.createIndex('by-import-date', 'importDate');
        pokemonStore.createIndex('by-legality', 'isLegal');
      }
      
      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

/**
 * Generate a unique ID for a Pokémon
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a Pokémon to the vault
 */
export async function addPokemon(pokemon: Omit<VaultPokemon, 'id'>): Promise<string> {
  const db = await initDB();
  
  const pokemonWithId: VaultPokemon = {
    ...pokemon,
    id: generateId(),
  };
  
  await db.add('pokemon', pokemonWithId);
  
  return pokemonWithId.id;
}

/**
 * Add multiple Pokémon to the vault (bulk import)
 */
export async function addMultiplePokemon(pokemonList: Omit<VaultPokemon, 'id'>[]): Promise<string[]> {
  const db = await initDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');
  
  const ids: string[] = [];
  
  for (const pokemon of pokemonList) {
    const pokemonWithId: VaultPokemon = {
      ...pokemon,
      id: generateId(),
    };
    
    await store.add(pokemonWithId);
    ids.push(pokemonWithId.id);
  }
  
  await tx.done;
  
  return ids;
}

/**
 * Get a Pokémon by ID
 */
export async function getPokemon(id: string): Promise<VaultPokemon | undefined> {
  const db = await initDB();
  return await db.get('pokemon', id);
}

/**
 * Get all Pokémon from the vault
 */
export async function getAllPokemon(): Promise<VaultPokemon[]> {
  const db = await initDB();
  return await db.getAll('pokemon');
}

/**
 * Get Pokémon by species
 */
export async function getPokemonBySpecies(species: number): Promise<VaultPokemon[]> {
  const db = await initDB();
  return await db.getAllFromIndex('pokemon', 'by-species', species);
}

/**
 * Get Pokémon by source generation
 */
export async function getPokemonBySourceGeneration(generation: number): Promise<VaultPokemon[]> {
  const db = await initDB();
  return await db.getAllFromIndex('pokemon', 'by-source-gen', generation);
}

/**
 * Get only legal Pokémon
 */
export async function getLegalPokemon(): Promise<VaultPokemon[]> {
  const db = await initDB();
  return await db.getAllFromIndex('pokemon', 'by-legality', 1);
}

/**
 * Get only illegal Pokémon
 */
export async function getIllegalPokemon(): Promise<VaultPokemon[]> {
  const db = await initDB();
  return await db.getAllFromIndex('pokemon', 'by-legality', 0);
}

/**
 * Update a Pokémon in the vault
 */
export async function updatePokemon(pokemon: VaultPokemon): Promise<void> {
  const db = await initDB();
  await db.put('pokemon', pokemon);
}

/**
 * Delete a Pokémon from the vault
 */
export async function deletePokemon(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('pokemon', id);
}

/**
 * Delete all Pokémon from the vault
 */
export async function clearVault(): Promise<void> {
  const db = await initDB();
  await db.clear('pokemon');
}

/**
 * Get vault statistics
 */
export async function getVaultStats(): Promise<{
  total: number;
  legal: number;
  illegal: number;
  byGeneration: { gen1: number; gen2: number; gen3: number };
  bySpecies: Map<number, number>;
}> {
  const db = await initDB();
  const allPokemon = await db.getAll('pokemon');
  
  const stats = {
    total: allPokemon.length,
    legal: 0,
    illegal: 0,
    byGeneration: { gen1: 0, gen2: 0, gen3: 0 },
    bySpecies: new Map<number, number>(),
  };
  
  for (const pokemon of allPokemon) {
    // Count legal/illegal
    if (pokemon.isLegal) {
      stats.legal++;
    } else {
      stats.illegal++;
    }
    
    // Count by generation
    switch (pokemon.sourceGeneration) {
      case 1:
        stats.byGeneration.gen1++;
        break;
      case 2:
        stats.byGeneration.gen2++;
        break;
      case 3:
        stats.byGeneration.gen3++;
        break;
    }
    
    // Count by species
    const count = stats.bySpecies.get(pokemon.species) || 0;
    stats.bySpecies.set(pokemon.species, count + 1);
  }
  
  return stats;
}

/**
 * Search Pokémon by various criteria
 */
export async function searchPokemon(criteria: {
  species?: number;
  minLevel?: number;
  maxLevel?: number;
  isShiny?: boolean;
  isLegal?: boolean;
  sourceGeneration?: number;
  nickname?: string;
}): Promise<VaultPokemon[]> {
  const db = await initDB();
  let pokemon = await db.getAll('pokemon');
  
  // Filter by criteria
  if (criteria.species !== undefined) {
    pokemon = pokemon.filter(p => p.species === criteria.species);
  }
  
  if (criteria.minLevel !== undefined) {
    pokemon = pokemon.filter(p => p.level >= criteria.minLevel!);
  }
  
  if (criteria.maxLevel !== undefined) {
    pokemon = pokemon.filter(p => p.level <= criteria.maxLevel!);
  }
  
  if (criteria.isShiny !== undefined) {
    pokemon = pokemon.filter(p => p.shiny === criteria.isShiny);
  }
  
  if (criteria.isLegal !== undefined) {
    pokemon = pokemon.filter(p => p.isLegal === criteria.isLegal);
  }
  
  if (criteria.sourceGeneration !== undefined) {
    pokemon = pokemon.filter(p => p.sourceGeneration === criteria.sourceGeneration);
  }
  
  if (criteria.nickname !== undefined) {
    const searchTerm = criteria.nickname.toLowerCase();
    pokemon = pokemon.filter(p => p.nickname.toLowerCase().includes(searchTerm));
  }
  
  return pokemon;
}

/**
 * Export vault data as JSON
 */
export async function exportVault(): Promise<string> {
  const pokemon = await getAllPokemon();
  return JSON.stringify(pokemon, null, 2);
}

/**
 * Import vault data from JSON
 */
export async function importVault(jsonData: string): Promise<number> {
  const pokemon = JSON.parse(jsonData) as VaultPokemon[];
  
  // Validate data
  if (!Array.isArray(pokemon)) {
    throw new Error('Invalid vault data: expected array');
  }
  
  // Add all Pokémon
  await addMultiplePokemon(pokemon);
  
  return pokemon.length;
}

/**
 * Save a setting
 */
export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await initDB();
  await db.put('settings', { key, value });
}

/**
 * Get a setting
 */
export async function getSetting(key: string): Promise<any | undefined> {
  const db = await initDB();
  const result = await db.get('settings', key);
  return result?.value;
}
