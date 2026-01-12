/**
 * IndexedDB vault for storing extracted Pokémon
 * Provides CRUD operations for managing the Pokémon collection
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Pk3Data } from '../gen3/pk3/pk3';

export interface StoredPokemon {
  id?: number; // Auto-generated primary key
  pk3Data: ArrayBuffer; // Serialized pk3 structure
  personality: number; // PID (for indexing)
  species: number; // Species ID
  nickname: string; // Decoded nickname
  otName: string; // Decoded OT name
  level: number; // Calculated level
  tid: number; // Trainer ID
  sid: number; // Secret ID
  isValid: boolean; // Checksum validity
  sourceGame?: string; // Ruby/Sapphire/Emerald/FireRed/LeafGreen or "Gen 1/2 (Converted)"
  sourceGeneration?: number; // 1, 2, or 3 - tracks original generation
  importedAt: number; // Timestamp
}

interface VaultDB extends DBSchema {
  pokemon: {
    key: number;
    value: StoredPokemon;
    indexes: {
      personality: number;
      species: number;
      tid: number;
      importedAt: number;
    };
  };
}

const DB_NAME = 'professors-pc-vault';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<VaultDB> | null = null;

/**
 * Open or get existing database connection
 */
export async function getVaultDb(): Promise<IDBPDatabase<VaultDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<VaultDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create pokemon store
      const pokemonStore = db.createObjectStore('pokemon', {
        keyPath: 'id',
        autoIncrement: true,
      });

      // Create indexes
      pokemonStore.createIndex('personality', 'personality', { unique: false });
      pokemonStore.createIndex('species', 'species', { unique: false });
      pokemonStore.createIndex('tid', 'tid', { unique: false });
      pokemonStore.createIndex('importedAt', 'importedAt', { unique: false });
    },
  });

  return dbInstance;
}

/**
 * Add a Pokémon to the vault
 */
export async function addPokemon(pokemon: StoredPokemon): Promise<number> {
  const db = await getVaultDb();
  return await db.add('pokemon', pokemon);
}

/**
 * Add multiple Pokémon to the vault
 */
export async function addMultiplePokemon(pokemon: StoredPokemon[]): Promise<number[]> {
  const db = await getVaultDb();
  const tx = db.transaction('pokemon', 'readwrite');
  const store = tx.objectStore('pokemon');

  const ids = await Promise.all(pokemon.map(p => store.add(p)));
  await tx.done;

  return ids;
}

/**
 * Get a Pokémon by ID
 */
export async function getPokemon(id: number): Promise<StoredPokemon | undefined> {
  const db = await getVaultDb();
  return await db.get('pokemon', id);
}

/**
 * Get all Pokémon
 */
export async function getAllPokemon(): Promise<StoredPokemon[]> {
  const db = await getVaultDb();
  return await db.getAll('pokemon');
}

/**
 * Get Pokémon by species
 */
export async function getPokemonBySpecies(speciesId: number): Promise<StoredPokemon[]> {
  const db = await getVaultDb();
  return await db.getAllFromIndex('pokemon', 'species', speciesId);
}

/**
 * Get Pokémon by trainer ID
 */
export async function getPokemonByTrainerId(tid: number): Promise<StoredPokemon[]> {
  const db = await getVaultDb();
  return await db.getAllFromIndex('pokemon', 'tid', tid);
}

/**
 * Update a Pokémon
 */
export async function updatePokemon(pokemon: StoredPokemon): Promise<void> {
  if (!pokemon.id) {
    throw new Error('Cannot update Pokémon without ID');
  }
  const db = await getVaultDb();
  await db.put('pokemon', pokemon);
}

/**
 * Delete a Pokémon by ID
 */
export async function deletePokemon(id: number): Promise<void> {
  const db = await getVaultDb();
  await db.delete('pokemon', id);
}

/**
 * Delete all Pokémon (clear vault)
 */
export async function clearVault(): Promise<void> {
  const db = await getVaultDb();
  await db.clear('pokemon');
}

/**
 * Count total Pokémon in vault
 */
export async function countPokemon(): Promise<number> {
  const db = await getVaultDb();
  return await db.count('pokemon');
}

/**
 * Search Pokémon by nickname (case-insensitive substring match)
 */
export async function searchPokemonByNickname(query: string): Promise<StoredPokemon[]> {
  const db = await getVaultDb();
  const all = await db.getAll('pokemon');
  const lowerQuery = query.toLowerCase();
  return all.filter(p => p.nickname.toLowerCase().includes(lowerQuery));
}

/**
 * Get recent Pokémon (sorted by import date)
 */
export async function getRecentPokemon(limit = 10): Promise<StoredPokemon[]> {
  const db = await getVaultDb();
  const all = await db.getAll('pokemon');
  
  // Sort by importedAt descending
  all.sort((a, b) => b.importedAt - a.importedAt);
  
  return all.slice(0, limit);
}

/**
 * Close the database connection
 */
export async function closeVaultDb(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Helper to serialize Pk3Data to ArrayBuffer for storage
 */
export function serializePk3ForStorage(pk3: Pk3Data): ArrayBuffer {
  const buffer = new ArrayBuffer(80); // pk3 is 80 bytes
  const view = new DataView(buffer);

  view.setUint32(0x00, pk3.personality, true);
  view.setUint32(0x04, pk3.otId, true);

  new Uint8Array(buffer, 0x08, 10).set(pk3.nickname);
  view.setUint16(0x12, pk3.language, true);
  new Uint8Array(buffer, 0x14, 7).set(pk3.otName);
  
  view.setUint8(0x1B, pk3.markings);
  view.setUint16(0x1C, pk3.checksum, true);
  view.setUint16(0x1E, pk3.unknown, true);
  new Uint8Array(buffer, 0x20, 48).set(pk3.data);

  return buffer;
}

/**
 * Helper to deserialize Pk3Data from ArrayBuffer
 */
export function deserializePk3FromStorage(buffer: ArrayBuffer): Pk3Data {
  const view = new DataView(buffer);

  return {
    personality: view.getUint32(0x00, true),
    otId: view.getUint32(0x04, true),
    nickname: new Uint8Array(buffer, 0x08, 10),
    language: view.getUint16(0x12, true),
    otName: new Uint8Array(buffer, 0x14, 7),
    markings: view.getUint8(0x1B),
    checksum: view.getUint16(0x1C, true),
    unknown: view.getUint16(0x1E, true),
    data: new Uint8Array(buffer, 0x20, 48),
  };
}
