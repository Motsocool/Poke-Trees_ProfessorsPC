# Cross-Generation Injection Guide

## Overview

Pokémon Tree's Professor's PC now supports tracking the **source generation** of every Pokémon in your vault, enabling future cross-generation injection capabilities.

## Source Generation Tracking

Every Pokémon imported into the vault now includes:
- **sourceGeneration**: The original generation (1, 2, or 3)
- **sourceGame**: The specific game it was imported from
- **Conversion Status**: Visual indicators for converted Pokémon

### Example:
```
Pikachu
OT: ASH • YELLOW (Gen 1 → 3) [Converted Badge]
```

## Current Capabilities (Phase 3 Complete)

### ✅ Import & Conversion
- **Gen 1** (Red/Blue/Yellow) → Gen 3 with PCCS conversion
- **Gen 2** (Gold/Silver/Crystal) → Gen 3 with PCCS conversion
- **Gen 3** (Ruby/Sapphire/Emerald/FireRed/LeafGreen) → Native format

### ✅ Injection
- **Gen 3 → Gen 3**: Full injection support
  - Inject any Pokémon (native or converted) into Gen 3 saves
  - Automatic checksum recalculation
  - Batch injection support
  - Empty slot detection

## Future Cross-Generation Injection (Roadmap)

### Phase 4: Same-Gen Injection
**Gen 1 → Gen 1** and **Gen 2 → Gen 2**
- Inject Pokémon back into their original generation saves
- Reverse DV conversion (IV → DV) for Gen 3 → Gen 1/2 transfers
- Maintain data integrity within generation limits

### Phase 5: Forward Injection
**Gen 1 → Gen 2** and **Gen 1/2 → Gen 3**
- Transfer Pokémon forward across generations
- Apply appropriate conversion rules
- Handle held items, gender, abilities, natures

### Phase 6: Backward Compatibility
**Gen 3 → Gen 2** (with limitations)
- Strip Gen 3-exclusive features (abilities, natures, etc.)
- Convert IV → DV using PCCS reverse formula
- Validate compatibility (species, moves, etc.)

## Technical Implementation

### pk3 Encoding (Completed ✅)
All Pokémon in the vault now have complete pk3 binary encoding:
- Growth substructure (species, exp, friendship, held item)
- Attacks substructure (moves, PP)
- EVs substructure (EVs, contest condition)
- Misc substructure (IVs, met data, ribbons)
- Encryption and shuffling
- Checksum calculation

### Data Preservation
Converted Pokémon preserve:
- ✅ Original DVs → IVs via PCCS formula `IV = (DV × 2) + 1`
- ✅ Shiny status (PID generation)
- ✅ EV scaling (Gen 1/2's 0-65535 → Gen 3's 0-255)
- ✅ Nature determination from DVs
- ✅ Gender (from Attack DV in Gen 2)
- ✅ Moves and PP
- ✅ Experience and level

### Reverse Conversion (Future)
For Gen 3 → Gen 1/2 injection:
```typescript
// Reverse PCCS formula
DV = floor(IV / 2)

// This ensures:
// - DV of 15 converts to IV 31
// - IV 31 converts back to DV 15
// - Bidirectional compatibility
```

## Usage Examples

### Current: Import & Inject to Gen 3
```
1. Import Yellow save (32KB)
   → Extracts Pikachu with DVs
   → Converts to Gen 3 with PCCS
   → Stores in vault as Gen 3 format

2. Load Emerald save (128KB)
   → Select Pikachu from vault
   → Inject to Box 1, Slot 1
   → Download modified Emerald save
```

### Future: Cross-Gen Injection
```
1. Import Yellow save → Vault (Gen 1 source tagged)
2. Import Crystal save → Vault (Gen 2 source tagged)  
3. Import Emerald save → Vault (Gen 3 source tagged)

Injection Options:
- Yellow Pikachu → Crystal save (Gen 1 → 2)
- Yellow Pikachu → Emerald save (Gen 1 → 3) ✅ Already supported
- Crystal Typhlosion → Emerald save (Gen 2 → 3) ✅ Already supported
- Emerald Rayquaza → Crystal save (Gen 3 → 2, stripped features)
```

## Data Integrity

### Validation Rules
When injecting across generations, the system will validate:
- **Species compatibility**: Species exists in target generation
- **Move compatibility**: Moves are learnable in target generation
- **Item compatibility**: Held items exist in target generation
- **Ability handling**: Strip abilities when going to Gen 1/2
- **Nature handling**: Strip natures when going to Gen 1/2
- **Gender handling**: Preserve or recalculate based on DVs

### Safety Mechanisms
- ✅ Checksum recalculation
- ✅ Section integrity validation
- ✅ Save counter increment
- ✅ Backup warnings
- ✅ Pre-injection validation
- ✅ Empty slot detection

## Benefits of Source Generation Tracking

1. **Informed Decisions**: Users know where each Pokémon came from
2. **Conversion Awareness**: Clear indication of converted Pokémon
3. **Future-Proof**: Architecture ready for cross-gen injection
4. **Data Preservation**: Can implement reverse conversion accurately
5. **Compatibility Checks**: Validate before attempting injection

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Gen 1/2 → Gen 3 Import | ✅ Complete | Full PCCS conversion |
| Gen 3 Native Import | ✅ Complete | No conversion needed |
| Source Gen Tracking | ✅ Complete | All Pokémon tagged |
| Gen 3 → Gen 3 Injection | ✅ Complete | Full support |
| pk3 Encoding | ✅ Complete | All substructures |
| Gen 1 → Gen 1 Injection | ⏸️ Planned | Phase 4 |
| Gen 2 → Gen 2 Injection | ⏸️ Planned | Phase 4 |
| Gen 1 → Gen 2 Injection | ⏸️ Planned | Phase 5 |
| Gen 2 → Gen 1 Injection | ⏸️ Planned | Phase 5 (limited) |
| Gen 3 → Gen 2 Injection | ⏸️ Planned | Phase 6 (limited) |
| Gen 3 → Gen 1 Injection | ⏸️ Planned | Phase 6 (very limited) |

## Technical Architecture

```
┌─────────────┐
│   Gen 1/2   │
│  Save File  │
└──────┬──────┘
       │ Parse DVs
       ▼
┌─────────────┐
│  Gen12      │
│  Pokemon    │◄── DV Format (0-15 per stat)
└──────┬──────┘
       │ PCCS Conversion
       ▼
┌─────────────┐
│  Gen3       │
│  Pokemon    │◄── IV Format (0-31 per stat)
└──────┬──────┘
       │ pk3 Encoding
       ▼
┌─────────────┐
│  pk3 Binary │
│  80 bytes   │◄── Full pk3 structure
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  IndexedDB  │
│   Vault     │◄── sourceGeneration: 1|2|3
└──────┬──────┘
       │ Injection
       ▼
┌─────────────┐
│  Gen 3 Save │
│  128KB      │◄── Currently supported
└─────────────┘
```

## Next Steps

To enable full cross-generation injection:

1. **Implement Gen 1/2 Injection** (8-10 hours)
   - Reverse pk3 encoding
   - DV reconstruction
   - Gen 1/2 save modification
   - Checksum recalculation

2. **Implement Reverse Conversion** (4-6 hours)
   - IV → DV conversion
   - Feature stripping (abilities, natures)
   - Move compatibility validation
   - Item mapping

3. **UI Updates** (2-3 hours)
   - Generation-aware injection dialog
   - Compatibility warnings
   - Feature loss notifications

**Total Est:** 14-19 hours

## References

- **PCCS Standard**: https://github.com/GearsProgress/Pokemon-Community-Conversion-Standard
- **pret/pokered**: Gen 1 save structure
- **pret/pokecrystal**: Gen 2 save structure
- **pret/pokeemerald**: Gen 3 save structure
