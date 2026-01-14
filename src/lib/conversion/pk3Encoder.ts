/**
 * Complete pk3 encoding for converted Gen 1/2 Pokémon
 * Creates valid pk3 binary data from VaultPokemon structure
 */

import { encodePk3, type Pk3Data, encryptPk3Data, shufflePk3Data, type Pk3Substructures } from '../gen3/pk3/pk3.js';
import type { VaultPokemon, Gen3Pokemon } from '../types/index.js';
import { encodeGen3String } from '../species/speciesTranscode.js';

/**
 * Encode a VaultPokemon into pk3 binary format
 * This is used for Gen 1/2 Pokémon after PCCS conversion
 */
export function encodePokemonToPk3(pokemon: VaultPokemon | Gen3Pokemon): ArrayBuffer {
  // Create pk3 structure from pokemon data
  const pk3Data: Pk3Data = {
    personality: pokemon.personalityValue,
    otId: combineTidSid(pokemon.otId, pokemon.otSecretId || 0),
    nickname: encodeGen3String(pokemon.nickname, 10),
    language: 0x02, // English
    otName: encodeGen3String(pokemon.ot, 7),
    markings: (pokemon as any).markings || 0,
    checksum: 0, // Will be calculated during encoding
    unknown: 0,
    data: new Uint8Array(48), // Will be filled by substructure encoding
  };

  // Create substructures
  const growth = encodeGrowthSubstructure(pokemon);
  const attacks = encodeAttacksSubstructure(pokemon);
  const evsCondition = encodeEVsSubstructure(pokemon);
  const misc = encodeMiscSubstructure(pokemon);

  // Create substructures object
  const substructures: Pk3Substructures = {
    growth,
    attacks,
    evs: evsCondition,
    misc,
  };

  // Shuffle the substructures based on personality value
  const shuffled = shufflePk3Data(substructures, pokemon.personalityValue);
  
  // Encrypt the shuffled data
  const encrypted = encryptPk3Data(shuffled, pokemon.personalityValue, pk3Data.otId);

  pk3Data.data = encrypted;

  // Encode to ArrayBuffer (this calculates checksum)
  return encodePk3(pk3Data);
}

/**
 * Combine TID and SID into 32-bit OT ID
 */
function combineTidSid(tid: number, sid: number): number {
  return ((sid & 0xFFFF) << 16) | (tid & 0xFFFF);
}

/**
 * Encode growth substructure (12 bytes)
 * Offsets: species(0-2), item(2-4), exp(4-8), ppBonuses(8), friendship(9), unknown(10-12)
 */
function encodeGrowthSubstructure(pokemon: VaultPokemon | Gen3Pokemon): Uint8Array {
  const buffer = new Uint8Array(12);
  const view = new DataView(buffer.buffer);

  // Species (16-bit)
  view.setUint16(0, pokemon.species, true);

  // Held item (16-bit) - default to 0 for converted Pokémon
  const heldItem = (pokemon as any).heldItem || 0;
  view.setUint16(2, heldItem, true);

  // Experience (32-bit)
  view.setUint32(4, pokemon.exp, true);

  // PP Bonuses (8-bit) - packed as 2 bits per move
  let ppBonuses = 0;
  for (let i = 0; i < 4 && i < pokemon.moves.length; i++) {
    const move = pokemon.moves[i];
    if (move) {
      const ppUps = move.ppUps || 0;
      ppBonuses |= (ppUps & 0x3) << (i * 2);
    }
  }
  view.setUint8(8, ppBonuses);

  // Friendship (8-bit)
  view.setUint8(9, pokemon.friendship || 70);

  // Unknown bytes (10-11) - typically 0
  view.setUint16(10, 0, true);

  return buffer;
}

/**
 * Encode attacks substructure (12 bytes)
 * Offsets: move1(0-2), move2(2-4), move3(4-6), move4(6-8), pp1(8), pp2(9), pp3(10), pp4(11)
 */
function encodeAttacksSubstructure(pokemon: VaultPokemon | Gen3Pokemon): Uint8Array {
  const buffer = new Uint8Array(12);
  const view = new DataView(buffer.buffer);

  // Encode up to 4 moves
  for (let i = 0; i < 4; i++) {
    const move = i < pokemon.moves.length ? pokemon.moves[i] : undefined;
    if (move) {
      // Move ID (16-bit)
      view.setUint16(i * 2, move.id, true);
      // PP (8-bit)
      view.setUint8(8 + i, move.pp);
    } else {
      // Empty move slot
      view.setUint16(i * 2, 0, true);
      view.setUint8(8 + i, 0);
    }
  }

  return buffer;
}

/**
 * Encode EVs & Condition substructure (12 bytes)
 * Offsets: hpEV(0), atkEV(1), defEV(2), speEV(3), spAtkEV(4), spDefEV(5),
 *          coolness(6), beauty(7), cuteness(8), smartness(9), toughness(10), feel(11)
 */
function encodeEVsSubstructure(pokemon: VaultPokemon | Gen3Pokemon): Uint8Array {
  const buffer = new Uint8Array(12);
  const view = new DataView(buffer.buffer);

  // EVs (6 bytes)
  view.setUint8(0, pokemon.evs.hp || 0);
  view.setUint8(1, pokemon.evs.attack || 0);
  view.setUint8(2, pokemon.evs.defense || 0);
  view.setUint8(3, pokemon.evs.speed || 0);
  view.setUint8(4, pokemon.evs.specialAttack || 0);
  view.setUint8(5, pokemon.evs.specialDefense || 0);

  // Contest condition (6 bytes) - default to 0 for converted Pokémon
  const condition = (pokemon as any).condition || { coolness: 0, beauty: 0, cuteness: 0, smartness: 0, toughness: 0, feel: 0 };
  view.setUint8(6, condition.coolness || 0);
  view.setUint8(7, condition.beauty || 0);
  view.setUint8(8, condition.cuteness || 0);
  view.setUint8(9, condition.smartness || 0);
  view.setUint8(10, condition.toughness || 0);
  view.setUint8(11, condition.feel || 0);

  return buffer;
}

/**
 * Encode misc substructure (12 bytes)
 * Offsets: pokerus(0), metLocation(1), origins(2-4), ivEggAbility(4-8), ribbons(8-12)
 */
function encodeMiscSubstructure(pokemon: VaultPokemon | Gen3Pokemon): Uint8Array {
  const buffer = new Uint8Array(12);
  const view = new DataView(buffer.buffer);

  // Pokérus (8-bit) - default to 0
  const pokerus = (pokemon as any).pokerus || 0;
  view.setUint8(0, pokerus);

  // Met location (8-bit) - default to 0 for converted Pokémon
  const metLocation = pokemon.metLocation || 0;
  view.setUint8(1, metLocation);

  // Origins info (16-bit)
  // Bits 0-6: met level, 7-10: game origin, 11-14: ball, 15: OT gender
  const metLevel = pokemon.metLevel || pokemon.level;
  const gameOrigin = getGameOriginValue(pokemon);
  const ball = pokemon.ball || 4; // Poké Ball default
  const otGender = 0; // Male default
  
  const origins = (metLevel & 0x7F) | 
                  ((gameOrigin & 0xF) << 7) | 
                  ((ball & 0xF) << 11) | 
                  ((otGender & 0x1) << 15);
  view.setUint16(2, origins, true);

  // IVs, Egg, Ability (32-bit)
  const ivData = packIVsEggAbility(pokemon);
  view.setUint32(4, ivData, true);

  // Ribbons (32-bit) - default to 0 for converted Pokémon
  const ribbons = (pokemon as any).ribbons || 0;
  view.setUint32(8, ribbons, true);

  return buffer;
}

/**
 * Pack IVs, egg flag, and ability into 32-bit value
 * Bits 0-4: HP IV, 5-9: Atk IV, 10-14: Def IV, 15-19: Spd IV, 20-24: SpAtk IV, 25-29: SpDef IV, 30: Egg, 31: Ability
 */
function packIVsEggAbility(pokemon: VaultPokemon | Gen3Pokemon): number {
  let packed = 0;
  
  packed |= (pokemon.ivs.hp & 0x1F);
  packed |= (pokemon.ivs.attack & 0x1F) << 5;
  packed |= (pokemon.ivs.defense & 0x1F) << 10;
  packed |= (pokemon.ivs.speed & 0x1F) << 15;
  packed |= (pokemon.ivs.specialAttack & 0x1F) << 20;
  packed |= (pokemon.ivs.specialDefense & 0x1F) << 25;

  // Egg flag (bit 30) - default to 0 (not an egg)
  const isEgg = (pokemon as any).isEgg || false;
  if (isEgg) {
    packed |= (1 << 30);
  }

  // Ability (bit 31) - 0 or 1
  const ability = pokemon.ability || 0;
  if (ability & 1) {
    packed |= (1 << 31);
  }

  return packed >>> 0; // Ensure unsigned
}

/**
 * Get game origin value based on source game
 */
function getGameOriginValue(_pokemon: VaultPokemon | Gen3Pokemon): number {
  // For converted Gen 1/2 Pokémon, we'll mark them as coming from the game they were converted from
  // but technically they're "from" the current Gen 3 game after conversion
  // Game origin codes: 1=Sapphire, 2=Ruby, 3=Emerald, 4=FireRed, 5=LeafGreen, 15=Event/Transfer
  
  // Use event/transfer code for converted Pokémon
  return 15;
}
