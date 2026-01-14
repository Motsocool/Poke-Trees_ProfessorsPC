/**
 * Encounter Validator
 * Validates Pokémon against encounter definitions
 */

import { Encounter, ValidationIssue } from './encounterTypes';
import { StoredPokemon } from '../db/vaultDb';

/**
 * Validate a Pokémon against an encounter definition
 */
export function validate(pokemon: StoredPokemon, encounter: Encounter): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Common validations
  if ('species' in encounter && pokemon.species !== encounter.species) {
    issues.push({
      severity: 'error',
      field: 'species',
      message: `Expected species ${encounter.species}, got ${pokemon.species}`,
    });
  }
  
  if ('level' in encounter && pokemon.level !== encounter.level) {
    issues.push({
      severity: 'warning',
      field: 'level',
      message: `Expected level ${encounter.level}, got ${pokemon.level}`,
    });
  }
  
  // Type-specific validations
  switch (encounter.kind) {
    case 'Gen3MysteryGift':
      validateGen3MysteryGift(pokemon, encounter, issues);
      break;
    case 'Gen3TicketIsland':
      validateGen3TicketIsland(pokemon, encounter, issues);
      break;
    case 'Gen2OddEgg':
      validateGen2OddEgg(pokemon, encounter, issues);
      break;
    case 'Gen3InGameEgg':
      validateGen3InGameEgg(pokemon, encounter, issues);
      break;
    case 'GameCubeBoxEgg':
      validateGameCubeBoxEgg(pokemon, encounter, issues);
      break;
    case 'GameCubeBonusDisc':
      validateGameCubeBonusDisc(pokemon, encounter, issues);
      break;
    case 'N64StadiumGift':
      validateN64StadiumGift(pokemon, encounter, issues);
      break;
  }
  
  return issues;
}

function validateGen3MysteryGift(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'Gen3MysteryGift' },
  issues: ValidationIssue[]
) {
  if (pokemon.otName !== encounter.otName) {
    issues.push({
      severity: 'error',
      field: 'otName',
      message: `Expected OT "${encounter.otName}", got "${pokemon.otName}"`,
    });
  }
  
  if (pokemon.tid !== encounter.tid) {
    issues.push({
      severity: 'error',
      field: 'tid',
      message: `Expected TID ${encounter.tid}, got ${pokemon.tid}`,
    });
  }
  
  if (pokemon.sid !== encounter.sid) {
    issues.push({
      severity: 'error',
      field: 'sid',
      message: `Expected SID ${encounter.sid}, got ${pokemon.sid}`,
    });
  }
  
  // Mystery Gift events should have fateful encounter flag
  if (encounter.fatefulEncounter) {
    issues.push({
      severity: 'info',
      field: 'fatefulEncounter',
      message: 'Gen 3 Mystery Gift should have fateful encounter flag set',
    });
  }
}

function validateGen3TicketIsland(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'Gen3TicketIsland' },
  issues: ValidationIssue[]
) {
  // Ticket island Pokémon are wild encounters with player's OT
  // Can't validate OT/TID since they vary by player
  issues.push({
    severity: 'info',
    field: 'encounter',
    message: `Ticket island encounter at ${encounter.location}. OT/TID should match player.`,
  });
}

function validateGen2OddEgg(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'Gen2OddEgg' },
  issues: ValidationIssue[]
) {
  // Check if species is in the valid pool
  if (!encounter.speciesPool.includes(pokemon.species)) {
    issues.push({
      severity: 'error',
      field: 'species',
      message: `Species ${pokemon.species} not in Odd Egg pool: ${encounter.speciesPool.join(', ')}`,
    });
  }
  
  // Odd Egg Pokémon should be shiny
  if (encounter.guaranteedShiny) {
    issues.push({
      severity: 'info',
      field: 'shiny',
      message: 'Odd Egg Pokémon should be shiny',
    });
  }
  
  // Should have player's OT/TID
  issues.push({
    severity: 'info',
    field: 'otName',
    message: 'Odd Egg uses player\'s OT/TID, not fixed values',
  });
}

function validateGen3InGameEgg(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'Gen3InGameEgg' },
  issues: ValidationIssue[]
) {
  // In-game eggs should have player's OT
  issues.push({
    severity: 'info',
    field: 'otName',
    message: `In-game egg from ${encounter.location}. Should have player's OT/TID.`,
  });
  
  if (pokemon.level !== 5) {
    issues.push({
      severity: 'warning',
      field: 'level',
      message: 'Hatched eggs should be level 5',
    });
  }
}

function validateGameCubeBoxEgg(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'GameCubeBoxEgg' },
  issues: ValidationIssue[]
) {
  if (pokemon.otName !== encounter.otName) {
    issues.push({
      severity: 'error',
      field: 'otName',
      message: `Expected OT "${encounter.otName}", got "${pokemon.otName}"`,
    });
  }
  
  if (pokemon.tid !== encounter.tid) {
    issues.push({
      severity: 'error',
      field: 'tid',
      message: `Expected TID ${encounter.tid}, got ${pokemon.tid}`,
    });
  }
  
  issues.push({
    severity: 'info',
    field: 'moves',
    message: `Should know special move ${encounter.specialMove}`,
  });
}

function validateGameCubeBonusDisc(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'GameCubeBonusDisc' },
  issues: ValidationIssue[]
) {
  if (pokemon.otName !== encounter.otName) {
    issues.push({
      severity: 'error',
      field: 'otName',
      message: `Expected OT "${encounter.otName}", got "${pokemon.otName}"`,
    });
  }
  
  if (pokemon.tid !== encounter.tid) {
    issues.push({
      severity: 'error',
      field: 'tid',
      message: `Expected TID ${encounter.tid}, got ${pokemon.tid}`,
    });
  }
  
  if (encounter.fatefulEncounter) {
    issues.push({
      severity: 'info',
      field: 'fatefulEncounter',
      message: `${encounter.disc} distribution should have fateful encounter flag`,
    });
  }
}

function validateN64StadiumGift(
  pokemon: StoredPokemon,
  encounter: Encounter & { kind: 'N64StadiumGift' },
  issues: ValidationIssue[]
) {
  // Stadium gifts don't have fateful encounter (Gen 1/2)
  issues.push({
    severity: 'info',
    field: 'generation',
    message: `Gen ${encounter.generation} Stadium gift. No fateful encounter flag in Gen 1/2.`,
  });
  
  issues.push({
    severity: 'info',
    field: 'moves',
    message: `Should know special move ${encounter.specialMove}`,
  });
}
