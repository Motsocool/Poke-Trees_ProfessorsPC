/**
 * Stat calculation utilities for Gen 1, 2, and 3
 * Based on well-documented Pokemon mechanics from Bulbapedia and community research
 */

/**
 * Gen 1/2: Convert Stat Exp to stat points
 * Stat Exp is stored in Gen 1/2 saves, not EVs like Gen 3+
 * Formula: floor(ceil(sqrt(statExp)) / 4)
 * This is well-documented in Pokemon mechanics research
 */
export function statExpToStatPoints(statExp: number): number {
  const root = Math.ceil(Math.sqrt(Math.max(0, statExp)));
  return Math.floor(root / 4);
}

/**
 * Calculate HP stat for Gen 1
 * Formula: floor((((base + dv) * 2 + statPoints) * level) / 100) + level + 10
 */
export function calcGen1HP(base: number, dv: number, statExp: number, level: number): number {
  const sp = statExpToStatPoints(statExp);
  return Math.floor((((base + dv) * 2 + sp) * level) / 100) + level + 10;
}

/**
 * Calculate non-HP stat for Gen 1
 * Formula: floor((((base + dv) * 2 + statPoints) * level) / 100) + 5
 */
export function calcGen1Stat(base: number, dv: number, statExp: number, level: number): number {
  const sp = statExpToStatPoints(statExp);
  return Math.floor((((base + dv) * 2 + sp) * level) / 100) + 5;
}

/**
 * Calculate HP stat for Gen 2 (same formula as Gen 1)
 */
export function calcGen2HP(base: number, dv: number, statExp: number, level: number): number {
  const sp = statExpToStatPoints(statExp);
  return Math.floor((((base + dv) * 2 + sp) * level) / 100) + level + 10;
}

/**
 * Calculate non-HP stat for Gen 2 (same formula as Gen 1)
 * Note: Gen 2 has separate SpAtk and SpDef, but uses one Special DV for both
 */
export function calcGen2Stat(base: number, dv: number, statExp: number, level: number): number {
  const sp = statExpToStatPoints(statExp);
  return Math.floor((((base + dv) * 2 + sp) * level) / 100) + 5;
}

/**
 * Cap EV value for Gen 3+
 * EVs are stored 0-255, but effective cap per stat is 252
 */
function capEv(ev: number): number {
  return Math.max(0, Math.min(252, ev | 0));
}

/**
 * Calculate HP stat for Gen 3
 * Formula: floor(((2 * base + iv + floor(ev/4)) * level) / 100) + level + 10
 */
export function calcGen3HP(base: number, iv: number, ev: number, level: number): number {
  const e = Math.floor(capEv(ev) / 4);
  return Math.floor(((2 * base + iv + e) * level) / 100) + level + 10;
}

/**
 * Calculate non-HP stat for Gen 3 (before nature modifier)
 * Formula: floor(((2 * base + iv + floor(ev/4)) * level) / 100) + 5
 */
export function calcGen3Stat(base: number, iv: number, ev: number, level: number): number {
  const e = Math.floor(capEv(ev) / 4);
  return Math.floor(((2 * base + iv + e) * level) / 100) + 5;
}

/**
 * Nature effects on stats (Gen 3+)
 * Each nature modifies one stat by x1.1 and one by x0.9, or is neutral
 */
type Gen3StatKey = 'attack' | 'defense' | 'speed' | 'specialAttack' | 'specialDefense';

interface NatureEffect {
  plus?: Gen3StatKey;
  minus?: Gen3StatKey;
}

/**
 * Nature lookup table (0-24)
 * Based on standard Gen 3 nature mechanics
 */
const NATURE_EFFECTS: NatureEffect[] = [
  {}, // 0: Hardy (neutral)
  { plus: 'attack', minus: 'defense' }, // 1: Lonely
  { plus: 'attack', minus: 'speed' }, // 2: Brave
  { plus: 'attack', minus: 'specialAttack' }, // 3: Adamant
  { plus: 'attack', minus: 'specialDefense' }, // 4: Naughty
  { plus: 'defense', minus: 'attack' }, // 5: Bold
  {}, // 6: Docile (neutral)
  { plus: 'defense', minus: 'speed' }, // 7: Relaxed
  { plus: 'defense', minus: 'specialAttack' }, // 8: Impish
  { plus: 'defense', minus: 'specialDefense' }, // 9: Lax
  { plus: 'speed', minus: 'attack' }, // 10: Timid
  { plus: 'speed', minus: 'defense' }, // 11: Hasty
  {}, // 12: Serious (neutral)
  { plus: 'speed', minus: 'specialAttack' }, // 13: Jolly
  { plus: 'speed', minus: 'specialDefense' }, // 14: Naive
  { plus: 'specialAttack', minus: 'attack' }, // 15: Modest
  { plus: 'specialAttack', minus: 'defense' }, // 16: Mild
  { plus: 'specialAttack', minus: 'speed' }, // 17: Quiet
  {}, // 18: Bashful (neutral)
  { plus: 'specialAttack', minus: 'specialDefense' }, // 19: Rash
  { plus: 'specialDefense', minus: 'attack' }, // 20: Calm
  { plus: 'specialDefense', minus: 'defense' }, // 21: Gentle
  { plus: 'specialDefense', minus: 'speed' }, // 22: Sassy
  { plus: 'specialDefense', minus: 'specialAttack' }, // 23: Careful
  {}, // 24: Quirky (neutral)
];

/**
 * Apply nature modifier to a stat
 * Returns floor(stat * multiplier)
 */
export function applyNatureModifier(stat: number, nature: number, statKey: Gen3StatKey): number {
  if (nature < 0 || nature >= NATURE_EFFECTS.length) {
    return stat; // Invalid nature, return unmodified
  }

  const effect = NATURE_EFFECTS[nature];
  
  if (!effect) {
    return stat;
  }

  if (effect.plus === statKey) {
    return Math.floor(stat * 1.1);
  }
  
  if (effect.minus === statKey) {
    return Math.floor(stat * 0.9);
  }

  return stat;
}
