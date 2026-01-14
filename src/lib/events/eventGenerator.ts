/**
 * Event Pokémon generator
 * Converts event Pokémon data to pk3 format for vault storage
 */

import { EventPokemon } from './eventPokemon';
import { Pk3Data } from '../gen3/pk3/pk3';
import { encodeGen3String } from '../species/speciesTranscode';
import { StoredPokemon, serializePk3ForStorage } from '../db/vaultDb';

/**
 * Generate a random personality value (PID)
 */
function generatePID(): number {
  return Math.floor(Math.random() * 0xFFFFFFFF);
}

/**
 * Generate random IVs (0-31 for each stat)
 */
function generateRandomIVs() {
  return {
    hp: Math.floor(Math.random() * 32),
    atk: Math.floor(Math.random() * 32),
    def: Math.floor(Math.random() * 32),
    spe: Math.floor(Math.random() * 32),
    spa: Math.floor(Math.random() * 32),
    spd: Math.floor(Math.random() * 32),
  };
}

/**
 * Pack IVs into Gen 3 format (30 bits)
 */
function packIVs(ivs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number }): number {
  return (
    ivs.hp |
    (ivs.atk << 5) |
    (ivs.def << 10) |
    (ivs.spe << 15) |
    (ivs.spa << 20) |
    (ivs.spd << 25)
  );
}

/**
 * Calculate checksum for pk3 data
 */
function calculatePk3Checksum(data: Uint8Array): number {
  let checksum = 0;
  for (let i = 0; i < data.length; i += 2) {
    const byte1 = data[i] ?? 0;
    const byte2 = data[i + 1] ?? 0;
    const word = byte1 | (byte2 << 8);
    checksum = (checksum + word) & 0xFFFF;
  }
  return checksum;
}

/**
 * Create a pk3 data structure from event Pokémon definition
 */
export function createEventPk3(event: EventPokemon): Pk3Data {
  const personality = generatePID();
  const otId = event.tid | (event.sid << 16);
  
  // Encode nickname and OT name
  const nickname = encodeGen3String(event.nickname, 10);
  const otName = encodeGen3String(event.otName, 7);
  
  // Create data buffer (48 bytes of encrypted data)
  const data = new Uint8Array(48);
  
  // For simplicity, we'll create a basic structure
  // In a full implementation, this would properly encode all substructures
  // and encrypt them based on the personality value
  
  // Substructure 0 (Growth): Species, Item, Experience
  const speciesLow = event.species & 0xFF;
  const speciesHigh = (event.species >> 8) & 0xFF;
  data[0] = speciesLow;
  data[1] = speciesHigh;
  
  const item = event.heldItem || 0;
  data[2] = item & 0xFF;
  data[3] = (item >> 8) & 0xFF;
  
  // Experience for level (simplified - using approximation)
  const exp = event.level * event.level * event.level;
  data[4] = exp & 0xFF;
  data[5] = (exp >> 8) & 0xFF;
  data[6] = (exp >> 16) & 0xFF;
  data[7] = (exp >> 24) & 0xFF;
  
  // Substructure 1 (Attacks): Moves and PP
  for (let i = 0; i < 4; i++) {
    const move = event.moves[i] || 0;
    data[12 + i * 2] = move & 0xFF;
    data[13 + i * 2] = (move >> 8) & 0xFF;
    data[20 + i] = move > 0 ? 35 : 0; // Default PP
  }
  
  // Substructure 2 (EVs and Contest): All zeros for event Pokémon
  // Bytes 24-35
  if (event.evs) {
    data[24] = event.evs.hp;
    data[25] = event.evs.atk;
    data[26] = event.evs.def;
    data[27] = event.evs.spe;
    data[28] = event.evs.spa;
    data[29] = event.evs.spd;
  }
  
  // Substructure 3 (Misc): IVs, Ribbons, etc.
  const ivs = event.ivs || generateRandomIVs();
  const packedIVs = packIVs(ivs);
  data[36] = packedIVs & 0xFF;
  data[37] = (packedIVs >> 8) & 0xFF;
  data[38] = (packedIVs >> 16) & 0xFF;
  data[39] = (packedIVs >> 24) & 0xFF;
  
  // Ribbons and obedience
  if (event.ribbons && event.ribbons.length > 0) {
    data[40] = event.ribbons[0] ?? 0;
    data[41] = event.ribbons[1] ?? 0;
    data[42] = event.ribbons[2] ?? 0;
    data[43] = event.ribbons[3] ?? 0;
  }
  
  // Fateful encounter flag
  if (event.fatefulEncounter) {
    data[40] = (data[40] ?? 0) | 0x80; // Set bit 7 of first ribbon byte
  }
  
  // Calculate checksum
  const checksum = calculatePk3Checksum(data);
  
  return {
    personality,
    otId,
    nickname,
    language: 2, // English
    otName,
    markings: 0,
    checksum,
    unknown: 0,
    data,
  };
}

/**
 * Create a StoredPokemon from event Pokémon definition
 */
export function createEventStoredPokemon(event: EventPokemon): StoredPokemon {
  const pk3 = createEventPk3(event);
  
  return {
    pk3Data: serializePk3ForStorage(pk3),
    personality: pk3.personality,
    species: event.species,
    nickname: event.nickname,
    otName: event.otName,
    level: event.level,
    tid: event.tid,
    sid: event.sid,
    isValid: true, // Event Pokémon are considered valid
    sourceGame: 'Event Distribution',
    sourceGeneration: 3,
    importedAt: Date.now(),
  };
}
