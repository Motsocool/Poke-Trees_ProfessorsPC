# 🎮 Pokémon Tree's: Professor's PC

A Progressive Web App (PWA) for importing, legalizing, and injecting Pokémon across save files from Gen 1, Gen 2, and Gen 3 games. Built with React, TypeScript, and Vite with offline-first functionality via IndexedDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff.svg)

## ✨ Features

### 🎲 Import Save Files
- **Gen 1**: Red, Blue, Yellow (32KB .sav files)
- **Gen 2**: Gold, Silver, Crystal (32KB .sav files)
- **Gen 3**: Ruby, Sapphire, Emerald, FireRed, LeafGreen (128KB .sav files)

### 🔄 Automatic Conversion
- **DV → IV Conversion**: Converts Gen 1/2 Determinant Values (DVs) to Gen 3 Individual Values (IVs)
- **PCCS Compliance**: Follows the [Pokémon Community Conversion Standard](https://github.com/GearsProgress/Pokemon-Community-Conversion-Standard)
- **Shiny Preservation**: Maintains shiny status during conversion
- **Gender Mapping**: Properly maps gender from Gen 2+ to Gen 3

### ✅ Legality Validation
- IV/EV range validation
- Move legality checking
- Species and level validation
- Shiny verification
- Automatic flagging of suspicious Pokémon

### 💾 Local-First Storage
- **IndexedDB**: All Pokémon stored locally in your browser
- **Offline Support**: Full functionality without internet connection
- **PWA**: Install as a native app on any device
- **Search & Filter**: Find Pokémon by species, level, legality status

### 💉 Export & Injection (Coming Soon)
- Inject validated Pokémon back into Gen 3 save files
- Automatic checksum calculation and verification
- Preserve save file integrity

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Motsocool/Poke-Trees_ProfessorsPC.git
   cd Poke-Trees_ProfessorsPC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📖 Usage

### Importing Save Files

1. Navigate to the **Import** tab
2. Click "Choose Save File"
3. Select your Pokémon save file (.sav, .gba, .gbc, .gb)
4. Wait for processing to complete
5. View imported Pokémon in the **Vault** tab

### Managing Your Vault

- **View All**: See all imported Pokémon
- **Filter by Legality**: View only legal or flagged Pokémon
- **View Details**: Click any Pokémon card to see full stats, IVs, EVs, and moves
- **Delete**: Remove Pokémon from your vault

## 🏗️ Architecture

### Key Technologies

- **React 19**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **IndexedDB (idb)**: Client-side database
- **Vite PWA Plugin**: Progressive Web App support

## 📚 References

### Game Disassemblies
- [pret/pokered](https://github.com/pret/pokered) - Gen 1 Red/Blue/Yellow
- [pret/pokecrystal](https://github.com/pret/pokecrystal) - Gen 2 Gold/Silver/Crystal
- [pret/pokeemerald](https://github.com/pret/pokeemerald) - Gen 3 Emerald

### Standards & Tools
- [Pokemon Community Conversion Standard](https://github.com/GearsProgress/Pokemon-Community-Conversion-Standard)
- [Poke Transporter GB](https://github.com/GearsProgress/Poke_Transporter_GB)

## ⚠️ Disclaimer

This tool is for educational purposes and personal backup management. Always keep backups of your save files.

Pokémon and all related names are trademarks of Nintendo, Game Freak, and The Pokémon Company.

---

**Made with ❤️ for the Pokémon community**
