# 🎮 Pokémon Tree's: Professor's PC

A local-first Progressive Web App (PWA) for managing Pokémon from Gen 3 GBA save files. Extract Pokémon from your save files into an offline vault, view detailed stats, and manage your collection entirely in your browser.

![Professor's PC UI](https://github.com/user-attachments/assets/ff2927a7-8f57-44ee-8fe1-7f37ecf88eaf)

## ✨ Features

### Current (MVP)
- ✅ **Import Gen 3 Save Files** - Load .sav files from Ruby, Sapphire, Emerald, FireRed, and LeafGreen
- ✅ **Safe Extraction** - Validates save integrity with checksum verification before extracting
- ✅ **Offline Vault** - Store extracted Pokémon in IndexedDB for offline access
- ✅ **Detailed View** - See species, level, OT, TID/SID, PID, moves, IVs, EVs, and more
- ✅ **Search & Filter** - Find Pokémon by nickname, OT name, or species
- ✅ **PWA Support** - Install as a standalone app, works offline

### Coming Soon
- 🔄 **Save Injection** - Inject Pokémon back into save files (not yet implemented)
- 🔄 **Gen 1/2 Support** - Support for Game Boy/Color save files (not yet implemented)
- 🔄 **Legality Checking** - Validate Pokémon data for legitimacy (not yet implemented)

## 🎯 Supported Games

Currently supports Gen 3 GBA games with 128KB (131,072 bytes) save files:
- Pokémon Ruby
- Pokémon Sapphire
- Pokémon Emerald
- Pokémon FireRed
- Pokémon LeafGreen

## 🛡️ How Save Integrity Works

The app implements comprehensive integrity checks to prevent data corruption:

### Save File Validation
1. **Size Check** - Verifies file is exactly 128KB
2. **Active Slot Detection** - Determines which of the two save slots is current using save counters
3. **Section Checksums** - Validates all 14 sections of the active save slot
4. **Signature Verification** - Checks for the Gen 3 magic signature (0x08012025)

### Pokémon Data Validation
1. **pk3 Structure** - Validates 80-byte Pokémon data structure
2. **Decryption** - XORs encrypted data with (PID ^ OTID) key
3. **Unshuffling** - Reorders substructures based on PID % 24
4. **Checksum Verification** - Validates pk3 checksum (sum of decrypted 16-bit words)

### Safety Guarantees
- ❌ **No writes to invalid saves** - Won't attempt to modify corrupted data
- ✅ **Read-only extraction** - Current version only reads, doesn't modify saves
- ✅ **Checksum reporting** - Shows which Pokémon have invalid checksums
- ✅ **Empty slot detection** - Skips empty PC boxes automatically

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Motsocool/Poke-Trees_ProfessorsPC.git
cd Poke-Trees_ProfessorsPC

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Open the app** in your browser (http://localhost:5173)
2. **Click "Choose .sav File"** and select a Gen 3 save file
3. **Wait for extraction** - The app will parse and import Pokémon from PC boxes
4. **Browse your vault** - Click on any Pokémon to see detailed stats
5. **Search & filter** - Use the search box to find specific Pokémon

### Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory and include:
- PWA service worker for offline support
- Web manifest for installability
- Optimized bundles

## 🏗️ Architecture

The codebase is split into three layers:

### 1. Core Binary Library (`src/lib/`)
Pure TypeScript, no DOM dependencies:

- **`utils/bin.ts`** - Little-endian read/write, bounds checking
- **`gen3/pk3/`** - pk3 decode/encode, encryption, shuffling, checksums
- **`gen3/save/`** - Save parsing, section validation, PC extraction
- **`species/`** - Species name mapping and Gen3 character encoding
- **`db/`** - IndexedDB vault operations

### 2. App State (`src/store/`)
Currently integrated into components, could be extracted to dedicated state management

### 3. UI Layer (`src/components/`)
React components:
- **SaveImport** - File input and import logic
- **VaultView** - Grid display of all Pokémon
- **PokemonDetail** - Detailed stats panel

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# View test UI
npm run test:ui
```

Tests cover:
- Binary utilities (read/write, bounds checking)
- pk3 encryption/decryption roundtrips
- pk3 shuffle/unshuffle roundtrips  
- Checksum calculations
- Save section parsing
- Active slot detection

## 🔐 Security & Privacy

- **Local-first** - All data stays in your browser's IndexedDB
- **No server** - No data is sent anywhere
- **No tracking** - No analytics or telemetry
- **Offline capable** - Works without internet after first load

## 📝 Technical Details

### Gen 3 Save Structure
- 128KB total (131,072 bytes)
- 2 save slots (A and B) for redundancy
- Each slot has 14 sections of 4KB each
- Sections 5-13 contain PC box data
- Each section has a 12-byte footer with ID, checksum, signature, and save counter

### pk3 Structure (80 bytes)
- **Header (32 bytes)**: PID, OTID, nickname, language, OT name, checksum
- **Data (48 bytes)**: Encrypted substructures containing:
  - Growth: species, item, experience, friendship
  - Attacks: 4 moves and their PP
  - EVs: HP, Attack, Defense, Speed, Sp.Atk, Sp.Def
  - Misc: Pokérus, met location, IVs, ribbons

### Encryption Algorithm
1. XOR data with (PID ^ OTID) key, 16-bit words
2. Unshuffle based on PID % 24 (24 possible orders)
3. Checksum is sum of all 16-bit words in decrypted data

## 🤝 Contributing

Contributions welcome! Areas that need work:
- [ ] Save injection feature (write Pokémon back to saves)
- [ ] Gen 1/2 support
- [ ] Complete species name database (currently partial)
- [ ] Proper experience curve calculations
- [ ] Move name database
- [ ] Nature and ability calculations
- [ ] Legality checking

## 📄 License

ISC

## 🙏 Acknowledgments

Built with:
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [idb](https://github.com/jakearchibald/idb) - IndexedDB wrapper
- [Vitest](https://vitest.dev/) - Testing framework

Pokémon structure documentation from:
- [Project Pokémon](https://projectpokemon.org/)
- [Bulbapedia](https://bulbapedia.bulbagarden.net/)
