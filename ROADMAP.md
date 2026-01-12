# Implementation Roadmap: Full Gen 1-3 Support

## Current Status
✅ **Gen 3 MVP Complete** (Commits: 800ea08, 84f1a0b, 3d55a32)
- pk3 parsing with encryption/decryption
- Save integrity validation
- IndexedDB vault
- React UI
- 56 passing tests

## Required Additions for Full Scope

### Phase 1: Gen 1/2 Parsers (~1500 lines)
**Files to Create:**
- `src/lib/constants/gen1.ts` - Gen 1 save structure constants
- `src/lib/constants/gen2.ts` - Gen 2 save structure constants
- `src/lib/parsers/gen1.ts` - Parse Red/Blue/Yellow saves (32KB)
- `src/lib/parsers/gen2.ts` - Parse Gold/Silver/Crystal saves (32KB)
- `src/lib/parsers/utils.ts` - Shared parsing utilities

**Key Features:**
- Extract box Pokémon from 32KB saves
- Parse DV structures (0-15 range)
- Handle Gen 1/2 character encoding
- Checksum validation for Gen 1/2

**Estimated Effort:** 8-12 hours

### Phase 2: DV → IV Conversion (~800 lines)
**Files to Create:**
- `src/lib/conversion/dvToIv.ts` - PCCS-compliant conversion
- `src/lib/conversion/dvToIv.test.ts` - Conversion tests

**Key Features:**
- Convert DVs (0-15) to IVs (0-31) following PCCS
- Preserve shiny status across generations
- Generate valid PID for converted Pokémon
- Convert EV systems (Gen 1/2 → Gen 3)
- Determine nature from DVs

**PCCS Rules:**
```
IV = (DV × 2) + 1  // Preserves DV recovery: DV = floor(IV / 2)
Shiny preserved if DVs match Gen 2 shiny pattern
PID generated to maintain shiny/gender/nature
```

**Estimated Effort:** 4-6 hours

### Phase 3: Legality Validation (~1000 lines)
**Files to Create:**
- `src/lib/legality/validator.ts` - Legality checking engine
- `src/lib/legality/validator.test.ts` - Validation tests

**Key Features:**
- IV/EV range validation (0-31 IVs, 0-255 EVs, max 510 total)
- Move legality checking
- Species/level validation
- Shiny verification (PID vs TID/SID)
- Checksum correction for invalid Pokémon

**Estimated Effort:** 6-8 hours

### Phase 4: Save Injection (~1200 lines)
**Files to Create:**
- `src/lib/injection/gen3.ts` - Safe Gen 3 save injection
- `src/lib/injection/gen3.test.ts` - Injection tests

**Key Features:**
- Inject Pokémon into specific box/slot without corruption
- Recalculate pk3 checksums
- Update section checksums
- Increment save counter (make new slot active)
- Verify no data corruption

**Safety Requirements:**
- Never overwrite existing Pokémon unless explicitly requested
- Validate all checksums before writing
- Create backup of original save data
- Atomic operations (all or nothing)

**Estimated Effort:** 8-10 hours

### Phase 5: UI Integration (~500 lines)
**Files to Update:**
- `src/components/SaveImport.tsx` - Add Gen 1/2 support
- `src/components/VaultView.tsx` - Show generation badges
- `src/components/PokemonDetail.tsx` - Show conversion info
- Create `src/components/InjectionDialog.tsx` - Box/slot selector

**Features:**
- Multi-generation save import
- Legality status indicators
- Checksum repair button
- Injection dialog with box/slot picker
- Export modified Gen 3 save

**Estimated Effort:** 4-6 hours

## Total Estimated Effort
**30-42 hours of development + testing**

## Recommended Approach

Given the scope, I recommend implementing in **focused increments**:

1. **Immediate (This Session):**
   - Set up types and parser structure
   - Implement Gen 1 parser (most referenced)
   - Create basic DV→IV conversion
   - Add legality validator skeleton

2. **Next Session:**
   - Complete Gen 2 parser
   - Refine conversion logic with tests
   - Implement checksum correction

3. **Final Session:**
   - Implement save injection
   - Update UI for all generations
   - Integration testing
   - Documentation

## Alternative: Reference Implementation

The diff you provided earlier contains a complete implementation. If time is critical, we could:
1. Review that implementation for correctness
2. Integrate it with our current Gen 3 foundation
3. Test and validate

## Decision Point

**Option A:** Build incrementally from scratch (higher quality, longer time)
**Option B:** Integrate existing implementation from diff (faster, needs validation)
**Option C:** Implement core features now, defer advanced features

Which approach would you prefer?
