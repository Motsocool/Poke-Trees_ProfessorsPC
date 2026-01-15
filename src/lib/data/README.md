# Data Loader Module

This module provides utilities for loading and using reference data from the `useful_data` directory for accurate Pokémon save file parsing.

## Features

- **Text Encoding/Decoding**: Convert between game character codes and Unicode strings
- **Pokémon Name Lookup**: Get Pokémon names by species index
- **Experience Tables**: Calculate levels from experience points with support for different growth curves
- **Multi-Generation Support**: Separate data for Gen1, Gen2, and Gen3
- **Caching**: Automatically caches loaded data for performance

## Usage

### Text Encoding/Decoding

```typescript
import { encodePokemonText, decodePokemonText } from './dataLoader';

// Encode a string to game bytes
const bytes = await encodePokemonText('PIKACHU', 'Gen1');
// Result: [143, 136, 138, 128, 130, 135, 148]

// Decode game bytes to string
const text = await decodePokemonText([143, 136, 138, 128, 130, 135, 148], 'Gen1');
// Result: "PIKACHU"
```

### Pokémon Name Lookup

```typescript
import { getPokemonName, loadPokemonNames } from './dataLoader';

// Get a single Pokémon name
const name = await getPokemonName(25, 'Gen1');
// Result: "Pikachu" (or appropriate name based on index order in Gen1)

// Load all Pokémon names for a generation
const allNames = await loadPokemonNames('Gen1');
// Result: ["MissingNo.", "Rhydon", "Kangaskhan", ...]
```

### Experience Tables

```typescript
import { getLevelFromExp, loadExpTable } from './dataLoader';

// Get level from experience (using default Medium Fast curve)
const level = await getLevelFromExp(15000, 'Gen1');

// Get level using a specific growth curve
const level = await getLevelFromExp(15000, 'Gen1', 3);

// Load experience table for a specific curve
const expTable = await loadExpTable('Gen1', 0); // Medium Fast
// Result: [0, 15, 52, 122, 237, ...]
```

## Growth Curves

The experience tables support 6 different growth curves (0-5):
- **0**: Medium Fast
- **1**: Erratic
- **2**: Fluctuating
- **3**: Medium Slow
- **4**: Fast
- **5**: Slow

Each Pokémon species uses one of these curves to determine how much experience is needed to reach each level.

## Data Files

The module loads data from the following files in `/useful_data/{Generation}/`:

- `text_conv.txt`: Character encoding table (maps characters to game bytes)
- `pokemon_names.txt`: List of Pokémon names (one per line, indexed from 0)
- `pokemon_exp.txt`: Experience tables (99 levels × 6 growth curves)

## Caching

All loaded data is automatically cached in memory to avoid redundant file loads. To clear the cache (useful for testing):

```typescript
import { clearDataCache } from './dataLoader';

clearDataCache();
```

## Examples from Problem Statement

### Example 1: Text Conversion

```typescript
import { loadTextConvTable } from './dataLoader';

// Load the text conversion table
const table = await loadTextConvTable('Gen1');

// Encode a string
function encodeString(text: string): number[] {
  return text.split('').map(c => table[c] ?? 0);
}

// Decode bytes
function decodeBytes(bytes: number[]): string {
  const reverseTable = Object.fromEntries(
    Object.entries(table).map(([k, v]) => [v, k])
  );
  return bytes.map(b => reverseTable[b] ?? '?').join('');
}
```

### Example 2: Pokémon Names

```typescript
import { loadPokemonNames } from './dataLoader';

const pokemonNames = await loadPokemonNames('Gen1');
const speciesIndex = 25;
const pokemonName = pokemonNames[speciesIndex];
console.log(pokemonName); // e.g., "Tentacool" (based on Gen1 internal order)
```

### Example 3: Experience Lookup

```typescript
import { loadExpTable } from './dataLoader';

const expTable = await loadExpTable('Gen1', 0); // Medium Fast curve

function getLevelFromExp(exp: number): number {
  for (let level = 0; level < expTable.length; level++) {
    if (exp < expTable[level]!) {
      return level;
    }
  }
  return expTable.length;
}
```

### Example 4: Multi-Generation Support

```typescript
import { getDataPath, loadTextConvTable } from './dataLoader';

// Get data path for any generation
const gen1Path = getDataPath('Gen1', 'text_conv.txt');
// Result: "/useful_data/Gen1/text_conv.txt"

const gen2Path = getDataPath('Gen2', 'pokemon_names.txt');
// Result: "/useful_data/Gen2/pokemon_names.txt"

// Load generation-specific data
const gen1TextConv = await loadTextConvTable('Gen1');
const gen2TextConv = await loadTextConvTable('Gen2');
const gen3TextConv = await loadTextConvTable('Gen3');
```

## Testing

The module includes comprehensive unit tests covering:
- Text conversion table loading and parsing
- Forward and reverse text encoding/decoding
- Pokémon name loading and lookup
- Experience table loading with multiple curves
- Level calculation from experience
- Caching behavior
- Error handling

Run tests with:
```bash
npm run test
```

## Integration with Parsers

The data loader is designed to work alongside existing parsers. The parsers in `src/lib/parsers/` have their own hardcoded character maps for backward compatibility, but can optionally use this module for enhanced accuracy and completeness.

To integrate with existing parsers:

```typescript
import { decodePokemonText } from '../data/dataLoader';
import { decodeGen12String } from './utils';

// Option 1: Use hardcoded map (fast, no async)
const name1 = decodeGen12String(view, offset, length);

// Option 2: Use data loader (accurate, requires async)
const bytes = Array.from({ length }, (_, i) => view.getUint8(offset + i));
const name2 = await decodePokemonText(bytes, 'Gen1');
```
