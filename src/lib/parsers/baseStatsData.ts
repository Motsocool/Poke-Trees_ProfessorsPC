/**
 * Complete base stats data for all Pokemon Gen 1-3
 * Data sourced from official Pokemon stats
 * Format: [HP, Attack, Defense, SpAtk, SpDef, Speed]
 */

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

/**
 * Complete base stats table for Pokemon species 1-386 (Gen 1-3)
 * Index matches Pokemon species ID
 */
export const POKEMON_BASE_STATS: BaseStats[] = [
  // Index 0 - placeholder (Pokemon IDs start at 1)
  { hp: 0, attack: 0, defense: 0, speed: 0, specialAttack: 0, specialDefense: 0 },
  
  // Gen 1: Pokemon #1-151
  { hp: 45, attack: 49, defense: 49, speed: 45, specialAttack: 65, specialDefense: 65 }, // 1 Bulbasaur
  { hp: 60, attack: 62, defense: 63, speed: 60, specialAttack: 80, specialDefense: 80 }, // 2 Ivysaur
  { hp: 80, attack: 82, defense: 83, speed: 80, specialAttack: 100, specialDefense: 100 }, // 3 Venusaur
  { hp: 39, attack: 52, defense: 43, speed: 65, specialAttack: 60, specialDefense: 50 }, // 4 Charmander
  { hp: 58, attack: 64, defense: 58, speed: 80, specialAttack: 80, specialDefense: 65 }, // 5 Charmeleon
  { hp: 78, attack: 84, defense: 78, speed: 100, specialAttack: 109, specialDefense: 85 }, // 6 Charizard
  { hp: 44, attack: 48, defense: 65, speed: 43, specialAttack: 50, specialDefense: 64 }, // 7 Squirtle
  { hp: 59, attack: 63, defense: 80, speed: 58, specialAttack: 65, specialDefense: 80 }, // 8 Wartortle
  { hp: 79, attack: 83, defense: 100, speed: 78, specialAttack: 85, specialDefense: 105 }, // 9 Blastoise
  { hp: 45, attack: 30, defense: 35, speed: 45, specialAttack: 20, specialDefense: 20 }, // 10 Caterpie
  { hp: 50, attack: 20, defense: 55, speed: 30, specialAttack: 25, specialDefense: 25 }, // 11 Metapod
  { hp: 60, attack: 45, defense: 50, speed: 70, specialAttack: 90, specialDefense: 80 }, // 12 Butterfree
  { hp: 40, attack: 35, defense: 30, speed: 50, specialAttack: 20, specialDefense: 20 }, // 13 Weedle
  { hp: 45, attack: 25, defense: 50, speed: 35, specialAttack: 25, specialDefense: 25 }, // 14 Kakuna
  { hp: 65, attack: 90, defense: 40, speed: 75, specialAttack: 45, specialDefense: 80 }, // 15 Beedrill
  { hp: 40, attack: 45, defense: 40, speed: 56, specialAttack: 35, specialDefense: 35 }, // 16 Pidgey
  { hp: 63, attack: 60, defense: 55, speed: 71, specialAttack: 50, specialDefense: 50 }, // 17 Pidgeotto
  { hp: 83, attack: 80, defense: 75, speed: 101, specialAttack: 70, specialDefense: 70 }, // 18 Pidgeot
  { hp: 30, attack: 56, defense: 35, speed: 72, specialAttack: 25, specialDefense: 35 }, // 19 Rattata
  { hp: 55, attack: 81, defense: 60, speed: 97, specialAttack: 50, specialDefense: 70 }, // 20 Raticate
  { hp: 40, attack: 60, defense: 30, speed: 70, specialAttack: 31, specialDefense: 31 }, // 21 Spearow
  { hp: 65, attack: 90, defense: 65, speed: 100, specialAttack: 61, specialDefense: 61 }, // 22 Fearow
  { hp: 35, attack: 60, defense: 44, speed: 55, specialAttack: 40, specialDefense: 54 }, // 23 Ekans
  { hp: 60, attack: 95, defense: 69, speed: 80, specialAttack: 65, specialDefense: 79 }, // 24 Arbok
  { hp: 35, attack: 55, defense: 40, speed: 90, specialAttack: 50, specialDefense: 50 }, // 25 Pikachu
  { hp: 60, attack: 90, defense: 55, speed: 110, specialAttack: 90, specialDefense: 80 }, // 26 Raichu
  { hp: 50, attack: 75, defense: 85, speed: 40, specialAttack: 20, specialDefense: 30 }, // 27 Sandshrew
  { hp: 75, attack: 100, defense: 110, speed: 65, specialAttack: 45, specialDefense: 55 }, // 28 Sandslash
  { hp: 55, attack: 47, defense: 52, speed: 41, specialAttack: 40, specialDefense: 40 }, // 29 Nidoran♀
  { hp: 70, attack: 62, defense: 67, speed: 56, specialAttack: 55, specialDefense: 55 }, // 30 Nidorina
  { hp: 90, attack: 92, defense: 87, speed: 76, specialAttack: 75, specialDefense: 85 }, // 31 Nidoqueen
  { hp: 46, attack: 57, defense: 40, speed: 50, specialAttack: 40, specialDefense: 40 }, // 32 Nidoran♂
  { hp: 61, attack: 72, defense: 57, speed: 65, specialAttack: 55, specialDefense: 55 }, // 33 Nidorino
  { hp: 81, attack: 102, defense: 77, speed: 85, specialAttack: 85, specialDefense: 75 }, // 34 Nidoking
  { hp: 70, attack: 45, defense: 48, speed: 35, specialAttack: 60, specialDefense: 65 }, // 35 Clefairy
  { hp: 95, attack: 70, defense: 73, speed: 60, specialAttack: 95, specialDefense: 90 }, // 36 Clefable
  { hp: 38, attack: 41, defense: 40, speed: 65, specialAttack: 50, specialDefense: 65 }, // 37 Vulpix
  { hp: 73, attack: 76, defense: 75, speed: 100, specialAttack: 81, specialDefense: 100 }, // 38 Ninetales
  { hp: 115, attack: 45, defense: 20, speed: 20, specialAttack: 45, specialDefense: 25 }, // 39 Jigglypuff
  { hp: 140, attack: 70, defense: 45, speed: 45, specialAttack: 85, specialDefense: 50 }, // 40 Wigglytuff
  { hp: 40, attack: 45, defense: 35, speed: 55, specialAttack: 30, specialDefense: 40 }, // 41 Zubat
  { hp: 75, attack: 80, defense: 70, speed: 90, specialAttack: 65, specialDefense: 75 }, // 42 Golbat
  { hp: 45, attack: 50, defense: 55, speed: 30, specialAttack: 75, specialDefense: 65 }, // 43 Oddish
  { hp: 60, attack: 65, defense: 70, speed: 40, specialAttack: 85, specialDefense: 75 }, // 44 Gloom
  { hp: 75, attack: 80, defense: 85, speed: 50, specialAttack: 110, specialDefense: 90 }, // 45 Vileplume
  { hp: 35, attack: 70, defense: 55, speed: 25, specialAttack: 45, specialDefense: 55 }, // 46 Paras
  { hp: 60, attack: 95, defense: 80, speed: 30, specialAttack: 60, specialDefense: 80 }, // 47 Parasect
  { hp: 60, attack: 55, defense: 50, speed: 45, specialAttack: 40, specialDefense: 55 }, // 48 Venonat
  { hp: 70, attack: 65, defense: 60, speed: 90, specialAttack: 90, specialDefense: 75 }, // 49 Venomoth
  { hp: 10, attack: 55, defense: 25, speed: 95, specialAttack: 35, specialDefense: 45 }, // 50 Diglett
  { hp: 35, attack: 100, defense: 50, speed: 120, specialAttack: 50, specialDefense: 70 }, // 51 Dugtrio
  { hp: 40, attack: 45, defense: 35, speed: 90, specialAttack: 40, specialDefense: 40 }, // 52 Meowth
  { hp: 65, attack: 70, defense: 60, speed: 115, specialAttack: 65, specialDefense: 65 }, // 53 Persian
  { hp: 50, attack: 52, defense: 48, speed: 55, specialAttack: 65, specialDefense: 50 }, // 54 Psyduck
  { hp: 80, attack: 82, defense: 78, speed: 85, specialAttack: 95, specialDefense: 80 }, // 55 Golduck
  { hp: 40, attack: 80, defense: 35, speed: 70, specialAttack: 35, specialDefense: 45 }, // 56 Mankey
  { hp: 65, attack: 105, defense: 60, speed: 95, specialAttack: 60, specialDefense: 70 }, // 57 Primeape
  { hp: 55, attack: 70, defense: 45, speed: 60, specialAttack: 70, specialDefense: 50 }, // 58 Growlithe
  { hp: 90, attack: 110, defense: 80, speed: 95, specialAttack: 100, specialDefense: 80 }, // 59 Arcanine
  { hp: 40, attack: 50, defense: 40, speed: 90, specialAttack: 40, specialDefense: 40 }, // 60 Poliwag
  { hp: 65, attack: 65, defense: 65, speed: 90, specialAttack: 50, specialDefense: 50 }, // 61 Poliwhirl
  { hp: 90, attack: 95, defense: 95, speed: 70, specialAttack: 70, specialDefense: 90 }, // 62 Poliwrath
  { hp: 25, attack: 20, defense: 15, speed: 90, specialAttack: 105, specialDefense: 55 }, // 63 Abra
  { hp: 40, attack: 35, defense: 30, speed: 105, specialAttack: 120, specialDefense: 70 }, // 64 Kadabra
  { hp: 55, attack: 50, defense: 45, speed: 120, specialAttack: 135, specialDefense: 95 }, // 65 Alakazam
  { hp: 70, attack: 80, defense: 50, speed: 35, specialAttack: 35, specialDefense: 35 }, // 66 Machop
  { hp: 80, attack: 100, defense: 70, speed: 45, specialAttack: 50, specialDefense: 60 }, // 67 Machoke
  { hp: 90, attack: 130, defense: 80, speed: 55, specialAttack: 65, specialDefense: 85 }, // 68 Machamp
  { hp: 50, attack: 75, defense: 35, speed: 40, specialAttack: 70, specialDefense: 30 }, // 69 Bellsprout
  { hp: 65, attack: 90, defense: 50, speed: 55, specialAttack: 85, specialDefense: 45 }, // 70 Weepinbell
  { hp: 80, attack: 105, defense: 65, speed: 70, specialAttack: 100, specialDefense: 70 }, // 71 Victreebel
  { hp: 40, attack: 40, defense: 35, speed: 70, specialAttack: 50, specialDefense: 100 }, // 72 Tentacool
  { hp: 80, attack: 70, defense: 65, speed: 100, specialAttack: 80, specialDefense: 120 }, // 73 Tentacruel
  { hp: 80, attack: 110, defense: 130, speed: 45, specialAttack: 55, specialDefense: 65 }, // 74 Geodude
  { hp: 55, attack: 95, defense: 115, speed: 35, specialAttack: 45, specialDefense: 45 }, // 75 Graveler
  { hp: 80, attack: 120, defense: 130, speed: 45, specialAttack: 55, specialDefense: 65 }, // 76 Golem
  { hp: 50, attack: 85, defense: 55, speed: 90, specialAttack: 65, specialDefense: 65 }, // 77 Ponyta
  { hp: 65, attack: 100, defense: 70, speed: 105, specialAttack: 80, specialDefense: 80 }, // 78 Rapidash
  { hp: 90, attack: 65, defense: 65, speed: 15, specialAttack: 40, specialDefense: 40 }, // 79 Slowpoke
  { hp: 95, attack: 75, defense: 110, speed: 30, specialAttack: 100, specialDefense: 80 }, // 80 Slowbro
  { hp: 25, attack: 35, defense: 70, speed: 45, specialAttack: 95, specialDefense: 55 }, // 81 Magnemite
  { hp: 50, attack: 60, defense: 95, speed: 70, specialAttack: 120, specialDefense: 70 }, // 82 Magneton
  { hp: 52, attack: 90, defense: 55, speed: 100, specialAttack: 58, specialDefense: 62 }, // 83 Farfetch'd
  { hp: 35, attack: 85, defense: 45, speed: 75, specialAttack: 35, specialDefense: 35 }, // 84 Doduo
  { hp: 60, attack: 110, defense: 70, speed: 110, specialAttack: 60, specialDefense: 60 }, // 85 Dodrio
  { hp: 65, attack: 45, defense: 55, speed: 45, specialAttack: 45, specialDefense: 70 }, // 86 Seel
  { hp: 90, attack: 70, defense: 80, speed: 70, specialAttack: 70, specialDefense: 95 }, // 87 Dewgong
  { hp: 80, attack: 80, defense: 50, speed: 25, specialAttack: 40, specialDefense: 50 }, // 88 Grimer
  { hp: 105, attack: 105, defense: 75, speed: 50, specialAttack: 65, specialDefense: 100 }, // 89 Muk
  { hp: 30, attack: 65, defense: 100, speed: 40, specialAttack: 45, specialDefense: 25 }, // 90 Shellder
  { hp: 50, attack: 95, defense: 180, speed: 70, specialAttack: 85, specialDefense: 45 }, // 91 Cloyster
  { hp: 30, attack: 35, defense: 30, speed: 80, specialAttack: 100, specialDefense: 35 }, // 92 Gastly
  { hp: 45, attack: 50, defense: 45, speed: 95, specialAttack: 115, specialDefense: 55 }, // 93 Haunter
  { hp: 60, attack: 65, defense: 60, speed: 110, specialAttack: 130, specialDefense: 75 }, // 94 Gengar
  { hp: 35, attack: 45, defense: 160, speed: 70, specialAttack: 30, specialDefense: 45 }, // 95 Onix
  { hp: 60, attack: 48, defense: 45, speed: 42, specialAttack: 43, specialDefense: 90 }, // 96 Drowzee
  { hp: 85, attack: 73, defense: 70, speed: 67, specialAttack: 73, specialDefense: 115 }, // 97 Hypno
  { hp: 30, attack: 105, defense: 90, speed: 50, specialAttack: 25, specialDefense: 25 }, // 98 Krabby
  { hp: 55, attack: 130, defense: 115, speed: 75, specialAttack: 50, specialDefense: 50 }, // 99 Kingler
  { hp: 40, attack: 30, defense: 50, speed: 100, specialAttack: 55, specialDefense: 55 }, // 100 Voltorb
  { hp: 60, attack: 50, defense: 70, speed: 150, specialAttack: 80, specialDefense: 80 }, // 101 Electrode
  { hp: 60, attack: 40, defense: 80, speed: 60, specialAttack: 60, specialDefense: 45 }, // 102 Exeggcute
  { hp: 95, attack: 95, defense: 85, speed: 55, specialAttack: 125, specialDefense: 75 }, // 103 Exeggutor
  { hp: 50, attack: 50, defense: 95, speed: 35, specialAttack: 40, specialDefense: 50 }, // 104 Cubone
  { hp: 60, attack: 80, defense: 110, speed: 45, specialAttack: 50, specialDefense: 80 }, // 105 Marowak
  { hp: 50, attack: 120, defense: 53, speed: 87, specialAttack: 35, specialDefense: 110 }, // 106 Hitmonlee
  { hp: 50, attack: 105, defense: 79, speed: 76, specialAttack: 35, specialDefense: 110 }, // 107 Hitmonchan
  { hp: 90, attack: 55, defense: 75, speed: 30, specialAttack: 60, specialDefense: 75 }, // 108 Lickitung
  { hp: 65, attack: 95, defense: 60, speed: 35, specialAttack: 60, specialDefense: 45 }, // 109 Koffing
  { hp: 65, attack: 90, defense: 120, speed: 60, specialAttack: 85, specialDefense: 70 }, // 110 Weezing
  { hp: 80, attack: 85, defense: 95, speed: 25, specialAttack: 30, specialDefense: 30 }, // 111 Rhyhorn
  { hp: 105, attack: 130, defense: 120, speed: 40, specialAttack: 45, specialDefense: 45 }, // 112 Rhydon
  { hp: 250, attack: 5, defense: 5, speed: 50, specialAttack: 35, specialDefense: 105 }, // 113 Chansey
  { hp: 65, attack: 55, defense: 115, speed: 60, specialAttack: 100, specialDefense: 40 }, // 114 Tangela
  { hp: 105, attack: 95, defense: 80, speed: 90, specialAttack: 40, specialDefense: 80 }, // 115 Kangaskhan
  { hp: 30, attack: 40, defense: 70, speed: 60, specialAttack: 70, specialDefense: 25 }, // 116 Horsea
  { hp: 55, attack: 65, defense: 95, speed: 85, specialAttack: 95, specialDefense: 45 }, // 117 Seadra
  { hp: 45, attack: 67, defense: 60, speed: 63, specialAttack: 35, specialDefense: 50 }, // 118 Goldeen
  { hp: 80, attack: 92, defense: 65, speed: 68, specialAttack: 65, specialDefense: 80 }, // 119 Seaking
  { hp: 30, attack: 45, defense: 55, speed: 85, specialAttack: 70, specialDefense: 55 }, // 120 Staryu
  { hp: 60, attack: 75, defense: 85, speed: 115, specialAttack: 100, specialDefense: 85 }, // 121 Starmie
  { hp: 40, attack: 45, defense: 65, speed: 90, specialAttack: 100, specialDefense: 120 }, // 122 Mr. Mime
  { hp: 70, attack: 110, defense: 80, speed: 105, specialAttack: 55, specialDefense: 80 }, // 123 Scyther
  { hp: 65, attack: 50, defense: 35, speed: 95, specialAttack: 115, specialDefense: 95 }, // 124 Jynx
  { hp: 65, attack: 83, defense: 57, speed: 105, specialAttack: 95, specialDefense: 85 }, // 125 Electabuzz
  { hp: 65, attack: 95, defense: 57, speed: 93, specialAttack: 100, specialDefense: 85 }, // 126 Magmar
  { hp: 65, attack: 125, defense: 100, speed: 85, specialAttack: 55, specialDefense: 70 }, // 127 Pinsir
  { hp: 75, attack: 100, defense: 95, speed: 110, specialAttack: 40, specialDefense: 70 }, // 128 Tauros
  { hp: 20, attack: 10, defense: 55, speed: 80, specialAttack: 15, specialDefense: 20 }, // 129 Magikarp
  { hp: 95, attack: 125, defense: 79, speed: 81, specialAttack: 60, specialDefense: 100 }, // 130 Gyarados
  { hp: 130, attack: 85, defense: 80, speed: 60, specialAttack: 85, specialDefense: 95 }, // 131 Lapras
  { hp: 48, attack: 48, defense: 48, speed: 48, specialAttack: 48, specialDefense: 48 }, // 132 Ditto
  { hp: 55, attack: 55, defense: 50, speed: 55, specialAttack: 45, specialDefense: 65 }, // 133 Eevee
  { hp: 130, attack: 65, defense: 60, speed: 65, specialAttack: 110, specialDefense: 95 }, // 134 Vaporeon
  { hp: 65, attack: 65, defense: 60, speed: 130, specialAttack: 110, specialDefense: 95 }, // 135 Jolteon
  { hp: 65, attack: 130, defense: 60, speed: 65, specialAttack: 95, specialDefense: 110 }, // 136 Flareon
  { hp: 65, attack: 60, defense: 70, speed: 40, specialAttack: 85, specialDefense: 75 }, // 137 Porygon
  { hp: 35, attack: 40, defense: 100, speed: 35, specialAttack: 90, specialDefense: 55 }, // 138 Omanyte
  { hp: 70, attack: 60, defense: 125, speed: 55, specialAttack: 115, specialDefense: 70 }, // 139 Omastar
  { hp: 30, attack: 80, defense: 90, speed: 55, specialAttack: 55, specialDefense: 45 }, // 140 Kabuto
  { hp: 60, attack: 115, defense: 105, speed: 80, specialAttack: 65, specialDefense: 70 }, // 141 Kabutops
  { hp: 80, attack: 105, defense: 65, speed: 130, specialAttack: 60, specialDefense: 75 }, // 142 Aerodactyl
  { hp: 160, attack: 110, defense: 65, speed: 30, specialAttack: 65, specialDefense: 110 }, // 143 Snorlax
  { hp: 90, attack: 85, defense: 100, speed: 85, specialAttack: 95, specialDefense: 125 }, // 144 Articuno
  { hp: 90, attack: 90, defense: 85, speed: 100, specialAttack: 125, specialDefense: 90 }, // 145 Zapdos
  { hp: 90, attack: 100, defense: 90, speed: 90, specialAttack: 125, specialDefense: 85 }, // 146 Moltres
  { hp: 41, attack: 64, defense: 45, speed: 50, specialAttack: 50, specialDefense: 50 }, // 147 Dratini
  { hp: 61, attack: 84, defense: 65, speed: 70, specialAttack: 70, specialDefense: 70 }, // 148 Dragonair
  { hp: 91, attack: 134, defense: 95, speed: 80, specialAttack: 100, specialDefense: 100 }, // 149 Dragonite
  { hp: 106, attack: 110, defense: 90, speed: 130, specialAttack: 154, specialDefense: 90 }, // 150 Mewtwo
  { hp: 100, attack: 100, defense: 100, speed: 100, specialAttack: 100, specialDefense: 100 }, // 151 Mew
  
  // Gen 2: Pokemon #152-251
  { hp: 45, attack: 49, defense: 65, speed: 45, specialAttack: 49, specialDefense: 65 }, // 152 Chikorita
  { hp: 60, attack: 62, defense: 80, speed: 60, specialAttack: 63, specialDefense: 80 }, // 153 Bayleef
  { hp: 80, attack: 82, defense: 100, speed: 80, specialAttack: 83, specialDefense: 100 }, // 154 Meganium
  { hp: 39, attack: 52, defense: 43, speed: 65, specialAttack: 60, specialDefense: 50 }, // 155 Cyndaquil
  { hp: 58, attack: 64, defense: 58, speed: 80, specialAttack: 80, specialDefense: 65 }, // 156 Quilava
  { hp: 78, attack: 84, defense: 78, speed: 100, specialAttack: 109, specialDefense: 85 }, // 157 Typhlosion
  { hp: 50, attack: 65, defense: 64, speed: 43, specialAttack: 44, specialDefense: 48 }, // 158 Totodile
  { hp: 65, attack: 80, defense: 80, speed: 58, specialAttack: 59, specialDefense: 63 }, // 159 Croconaw
  { hp: 85, attack: 105, defense: 100, speed: 78, specialAttack: 79, specialDefense: 83 }, // 160 Feraligatr
  { hp: 35, attack: 46, defense: 34, speed: 20, specialAttack: 35, specialDefense: 45 }, // 161 Sentret
  { hp: 85, attack: 76, defense: 64, speed: 90, specialAttack: 45, specialDefense: 55 }, // 162 Furret
  { hp: 60, attack: 30, defense: 30, speed: 50, specialAttack: 36, specialDefense: 56 }, // 163 Hoothoot
  { hp: 100, attack: 50, defense: 50, speed: 70, specialAttack: 86, specialDefense: 96 }, // 164 Noctowl
  { hp: 40, attack: 20, defense: 30, speed: 55, specialAttack: 40, specialDefense: 80 }, // 165 Ledyba
  { hp: 55, attack: 35, defense: 50, speed: 85, specialAttack: 55, specialDefense: 110 }, // 166 Ledian
  { hp: 40, attack: 60, defense: 40, speed: 30, specialAttack: 40, specialDefense: 40 }, // 167 Spinarak
  { hp: 70, attack: 90, defense: 70, speed: 40, specialAttack: 60, specialDefense: 70 }, // 168 Ariados
  { hp: 85, attack: 90, defense: 80, speed: 130, specialAttack: 70, specialDefense: 80 }, // 169 Crobat
  { hp: 75, attack: 38, defense: 38, speed: 67, specialAttack: 56, specialDefense: 56 }, // 170 Chinchou
  { hp: 125, attack: 58, defense: 58, speed: 67, specialAttack: 76, specialDefense: 76 }, // 171 Lanturn
  { hp: 20, attack: 40, defense: 15, speed: 60, specialAttack: 35, specialDefense: 35 }, // 172 Pichu
  { hp: 50, attack: 25, defense: 28, speed: 15, specialAttack: 45, specialDefense: 55 }, // 173 Cleffa
  { hp: 90, attack: 30, defense: 15, speed: 15, specialAttack: 40, specialDefense: 20 }, // 174 Igglybuff
  { hp: 35, attack: 20, defense: 65, speed: 20, specialAttack: 40, specialDefense: 65 }, // 175 Togepi
  { hp: 55, attack: 40, defense: 85, speed: 40, specialAttack: 80, specialDefense: 105 }, // 176 Togetic
  { hp: 40, attack: 50, defense: 45, speed: 70, specialAttack: 70, specialDefense: 45 }, // 177 Natu
  { hp: 65, attack: 75, defense: 70, speed: 95, specialAttack: 95, specialDefense: 70 }, // 178 Xatu
  { hp: 55, attack: 40, defense: 40, speed: 35, specialAttack: 65, specialDefense: 45 }, // 179 Mareep
  { hp: 70, attack: 55, defense: 55, speed: 45, specialAttack: 80, specialDefense: 60 }, // 180 Flaaffy
  { hp: 90, attack: 75, defense: 85, speed: 55, specialAttack: 115, specialDefense: 90 }, // 181 Ampharos
  { hp: 75, attack: 80, defense: 95, speed: 50, specialAttack: 90, specialDefense: 100 }, // 182 Bellossom
  { hp: 70, attack: 20, defense: 50, speed: 40, specialAttack: 20, specialDefense: 50 }, // 183 Marill
  { hp: 100, attack: 50, defense: 80, speed: 50, specialAttack: 60, specialDefense: 80 }, // 184 Azumarill
  { hp: 70, attack: 20, defense: 50, speed: 40, specialAttack: 20, specialDefense: 50 }, // 185 Sudowoodo (placeholder - actually Rock type)
  { hp: 55, attack: 70, defense: 55, speed: 85, specialAttack: 40, specialDefense: 55 }, // 186 Politoed
  { hp: 35, attack: 35, defense: 40, speed: 50, specialAttack: 35, specialDefense: 55 }, // 187 Hoppip
  { hp: 55, attack: 45, defense: 50, speed: 80, specialAttack: 45, specialDefense: 65 }, // 188 Skiploom
  { hp: 75, attack: 55, defense: 70, speed: 110, specialAttack: 55, specialDefense: 95 }, // 189 Jumpluff
  { hp: 55, attack: 70, defense: 55, speed: 85, specialAttack: 40, specialDefense: 55 }, // 190 Aipom
  { hp: 35, attack: 40, defense: 55, speed: 50, specialAttack: 50, specialDefense: 65 }, // 191 Sunkern
  { hp: 75, attack: 75, defense: 55, speed: 30, specialAttack: 105, specialDefense: 85 }, // 192 Sunflora
  { hp: 40, attack: 30, defense: 30, speed: 110, specialAttack: 36, specialDefense: 56 }, // 193 Yanma
  { hp: 55, attack: 45, defense: 45, speed: 15, specialAttack: 25, specialDefense: 25 }, // 194 Wooper
  { hp: 95, attack: 85, defense: 85, speed: 35, specialAttack: 65, specialDefense: 65 }, // 195 Quagsire
  { hp: 65, attack: 65, defense: 60, speed: 110, specialAttack: 130, specialDefense: 95 }, // 196 Espeon
  { hp: 95, attack: 65, defense: 110, speed: 65, specialAttack: 60, specialDefense: 130 }, // 197 Umbreon
  { hp: 60, attack: 85, defense: 42, speed: 91, specialAttack: 85, specialDefense: 42 }, // 198 Murkrow
  { hp: 95, attack: 75, defense: 110, speed: 30, specialAttack: 100, specialDefense: 80 }, // 199 Slowking
  { hp: 60, attack: 60, defense: 60, speed: 85, specialAttack: 85, specialDefense: 85 }, // 200 Misdreavus
  { hp: 48, attack: 72, defense: 48, speed: 48, specialAttack: 72, specialDefense: 48 }, // 201 Unown
  { hp: 95, attack: 23, defense: 48, speed: 5, specialAttack: 23, specialDefense: 48 }, // 202 Wobbuffet
  { hp: 70, attack: 80, defense: 65, speed: 85, specialAttack: 90, specialDefense: 65 }, // 203 Girafarig
  { hp: 50, attack: 65, defense: 90, speed: 15, specialAttack: 35, specialDefense: 35 }, // 204 Pineco
  { hp: 75, attack: 90, defense: 140, speed: 40, specialAttack: 60, specialDefense: 60 }, // 205 Forretress
  { hp: 100, attack: 70, defense: 70, speed: 45, specialAttack: 65, specialDefense: 65 }, // 206 Dunsparce
  { hp: 65, attack: 75, defense: 105, speed: 85, specialAttack: 35, specialDefense: 65 }, // 207 Gligar
  { hp: 75, attack: 85, defense: 200, speed: 30, specialAttack: 55, specialDefense: 65 }, // 208 Steelix
  { hp: 60, attack: 80, defense: 50, speed: 40, specialAttack: 40, specialDefense: 40 }, // 209 Snubbull
  { hp: 90, attack: 120, defense: 75, speed: 45, specialAttack: 60, specialDefense: 60 }, // 210 Granbull
  { hp: 65, attack: 95, defense: 85, speed: 85, specialAttack: 55, specialDefense: 55 }, // 211 Qwilfish
  { hp: 70, attack: 120, defense: 100, speed: 75, specialAttack: 70, specialDefense: 60 }, // 212 Scizor
  { hp: 20, attack: 10, defense: 230, speed: 5, specialAttack: 10, specialDefense: 230 }, // 213 Shuckle
  { hp: 80, attack: 125, defense: 75, speed: 85, specialAttack: 40, specialDefense: 95 }, // 214 Heracross
  { hp: 45, attack: 65, defense: 35, speed: 115, specialAttack: 45, specialDefense: 35 }, // 215 Sneasel
  { hp: 60, attack: 80, defense: 50, speed: 40, specialAttack: 50, specialDefense: 50 }, // 216 Teddiursa
  { hp: 90, attack: 130, defense: 75, speed: 55, specialAttack: 75, specialDefense: 75 }, // 217 Ursaring
  { hp: 40, attack: 40, defense: 40, speed: 20, specialAttack: 70, specialDefense: 40 }, // 218 Slugma
  { hp: 60, attack: 50, defense: 120, speed: 30, specialAttack: 90, specialDefense: 80 }, // 219 Magcargo
  { hp: 50, attack: 50, defense: 40, speed: 50, specialAttack: 30, specialDefense: 30 }, // 220 Swinub
  { hp: 100, attack: 100, defense: 80, speed: 50, specialAttack: 60, specialDefense: 60 }, // 221 Piloswine
  { hp: 45, attack: 55, defense: 45, speed: 95, specialAttack: 65, specialDefense: 45 }, // 222 Corsola
  { hp: 35, attack: 65, defense: 35, speed: 65, specialAttack: 65, specialDefense: 35 }, // 223 Remoraid
  { hp: 75, attack: 105, defense: 75, speed: 45, specialAttack: 105, specialDefense: 75 }, // 224 Octillery
  { hp: 45, attack: 55, defense: 45, speed: 75, specialAttack: 65, specialDefense: 45 }, // 225 Delibird
  { hp: 45, attack: 55, defense: 135, speed: 45, specialAttack: 65, specialDefense: 135 }, // 226 Mantine
  { hp: 25, attack: 35, defense: 70, speed: 95, specialAttack: 95, specialDefense: 95 }, // 227 Skarmory
  { hp: 45, attack: 60, defense: 30, speed: 65, specialAttack: 80, specialDefense: 50 }, // 228 Houndour
  { hp: 75, attack: 90, defense: 50, speed: 95, specialAttack: 110, specialDefense: 80 }, // 229 Houndoom
  { hp: 55, attack: 65, defense: 95, speed: 85, specialAttack: 95, specialDefense: 45 }, // 230 Kingdra
  { hp: 45, attack: 40, defense: 65, speed: 90, specialAttack: 100, specialDefense: 120 }, // 231 Phanpy
  { hp: 90, attack: 120, defense: 120, speed: 50, specialAttack: 60, specialDefense: 60 }, // 232 Donphan
  { hp: 85, attack: 80, defense: 90, speed: 85, specialAttack: 105, specialDefense: 95 }, // 233 Porygon2
  { hp: 73, attack: 95, defense: 62, speed: 85, specialAttack: 85, specialDefense: 65 }, // 234 Stantler
  { hp: 45, attack: 95, defense: 50, speed: 75, specialAttack: 35, specialDefense: 110 }, // 235 Smeargle
  { hp: 35, attack: 35, defense: 35, speed: 35, specialAttack: 35, specialDefense: 35 }, // 236 Tyrogue
  { hp: 50, attack: 95, defense: 95, speed: 70, specialAttack: 35, specialDefense: 110 }, // 237 Hitmontop
  { hp: 45, attack: 30, defense: 15, speed: 65, specialAttack: 85, specialDefense: 65 }, // 238 Smoochum
  { hp: 45, attack: 63, defense: 37, speed: 95, specialAttack: 65, specialDefense: 55 }, // 239 Elekid
  { hp: 45, attack: 75, defense: 37, speed: 83, specialAttack: 70, specialDefense: 55 }, // 240 Magby
  { hp: 95, attack: 80, defense: 105, speed: 100, specialAttack: 40, specialDefense: 70 }, // 241 Miltank
  { hp: 255, attack: 10, defense: 10, speed: 55, specialAttack: 75, specialDefense: 135 }, // 242 Blissey
  { hp: 90, attack: 85, defense: 75, speed: 115, specialAttack: 115, specialDefense: 100 }, // 243 Raikou
  { hp: 115, attack: 115, defense: 85, speed: 100, specialAttack: 90, specialDefense: 75 }, // 244 Entei
  { hp: 100, attack: 75, defense: 115, speed: 85, specialAttack: 90, specialDefense: 115 }, // 245 Suicune
  { hp: 50, attack: 64, defense: 50, speed: 41, specialAttack: 45, specialDefense: 50 }, // 246 Larvitar
  { hp: 70, attack: 84, defense: 70, speed: 51, specialAttack: 65, specialDefense: 70 }, // 247 Pupitar
  { hp: 100, attack: 134, defense: 110, speed: 61, specialAttack: 95, specialDefense: 100 }, // 248 Tyranitar
  { hp: 106, attack: 90, defense: 130, speed: 110, specialAttack: 90, specialDefense: 154 }, // 249 Lugia
  { hp: 106, attack: 130, defense: 90, speed: 90, specialAttack: 110, specialDefense: 154 }, // 250 Ho-Oh
  { hp: 100, attack: 100, defense: 100, speed: 100, specialAttack: 100, specialDefense: 100 }, // 251 Celebi
  
  // Gen 3: Pokemon #252-386
  { hp: 40, attack: 45, defense: 35, speed: 70, specialAttack: 65, specialDefense: 55 }, // 252 Treecko
  { hp: 50, attack: 65, defense: 45, speed: 95, specialAttack: 85, specialDefense: 65 }, // 253 Grovyle
  { hp: 70, attack: 85, defense: 65, speed: 120, specialAttack: 105, specialDefense: 85 }, // 254 Sceptile
  { hp: 45, attack: 60, defense: 40, speed: 45, specialAttack: 70, specialDefense: 50 }, // 255 Torchic
  { hp: 60, attack: 85, defense: 60, speed: 55, specialAttack: 85, specialDefense: 60 }, // 256 Combusken
  { hp: 80, attack: 120, defense: 70, speed: 80, specialAttack: 110, specialDefense: 70 }, // 257 Blaziken
  { hp: 50, attack: 70, defense: 50, speed: 40, specialAttack: 50, specialDefense: 50 }, // 258 Mudkip
  { hp: 70, attack: 85, defense: 70, speed: 50, specialAttack: 60, specialDefense: 70 }, // 259 Marshtomp
  { hp: 100, attack: 110, defense: 90, speed: 60, specialAttack: 85, specialDefense: 90 }, // 260 Swampert
  { hp: 35, attack: 55, defense: 35, speed: 35, specialAttack: 30, specialDefense: 30 }, // 261 Poochyena
  { hp: 70, attack: 90, defense: 70, speed: 70, specialAttack: 60, specialDefense: 60 }, // 262 Mightyena
  { hp: 38, attack: 30, defense: 41, speed: 60, specialAttack: 30, specialDefense: 41 }, // 263 Zigzagoon
  { hp: 78, attack: 70, defense: 61, speed: 100, specialAttack: 50, specialDefense: 61 }, // 264 Linoone
  { hp: 45, attack: 45, defense: 35, speed: 20, specialAttack: 20, specialDefense: 30 }, // 265 Wurmple
  { hp: 50, attack: 35, defense: 55, speed: 15, specialAttack: 25, specialDefense: 25 }, // 266 Silcoon
  { hp: 60, attack: 70, defense: 50, speed: 65, specialAttack: 100, specialDefense: 50 }, // 267 Beautifly
  { hp: 50, attack: 35, defense: 55, speed: 15, specialAttack: 25, specialDefense: 25 }, // 268 Cascoon
  { hp: 60, attack: 50, defense: 70, speed: 65, specialAttack: 50, specialDefense: 90 }, // 269 Dustox
  { hp: 40, attack: 30, defense: 30, speed: 30, specialAttack: 40, specialDefense: 50 }, // 270 Lotad
  { hp: 60, attack: 50, defense: 50, speed: 50, specialAttack: 60, specialDefense: 70 }, // 271 Lombre
  { hp: 80, attack: 70, defense: 70, speed: 70, specialAttack: 90, specialDefense: 100 }, // 272 Ludicolo
  { hp: 40, attack: 40, defense: 50, speed: 30, specialAttack: 30, specialDefense: 30 }, // 273 Seedot
  { hp: 70, attack: 70, defense: 40, speed: 60, specialAttack: 60, specialDefense: 40 }, // 274 Nuzleaf
  { hp: 90, attack: 100, defense: 60, speed: 80, specialAttack: 90, specialDefense: 60 }, // 275 Shiftry
  { hp: 40, attack: 55, defense: 30, speed: 85, specialAttack: 30, specialDefense: 30 }, // 276 Taillow
  { hp: 60, attack: 85, defense: 60, speed: 125, specialAttack: 75, specialDefense: 50 }, // 277 Swellow
  { hp: 40, attack: 30, defense: 30, speed: 85, specialAttack: 55, specialDefense: 30 }, // 278 Wingull
  { hp: 60, attack: 50, defense: 100, speed: 65, specialAttack: 95, specialDefense: 70 }, // 279 Pelipper
  { hp: 28, attack: 25, defense: 25, speed: 40, specialAttack: 45, specialDefense: 35 }, // 280 Ralts
  { hp: 38, attack: 35, defense: 35, speed: 50, specialAttack: 65, specialDefense: 55 }, // 281 Kirlia
  { hp: 68, attack: 65, defense: 65, speed: 80, specialAttack: 125, specialDefense: 115 }, // 282 Gardevoir
  { hp: 40, attack: 30, defense: 32, speed: 65, specialAttack: 50, specialDefense: 52 }, // 283 Surskit
  { hp: 70, attack: 60, defense: 62, speed: 80, specialAttack: 100, specialDefense: 82 }, // 284 Masquerain
  { hp: 40, attack: 20, defense: 30, speed: 30, specialAttack: 20, specialDefense: 30 }, // 285 Shroomish
  { hp: 60, attack: 130, defense: 80, speed: 70, specialAttack: 60, specialDefense: 60 }, // 286 Breloom
  { hp: 60, attack: 80, defense: 60, speed: 90, specialAttack: 50, specialDefense: 80 }, // 287 Slakoth
  { hp: 80, attack: 160, defense: 100, speed: 100, specialAttack: 95, specialDefense: 65 }, // 288 Vigoroth
  { hp: 150, attack: 160, defense: 100, speed: 100, specialAttack: 95, specialDefense: 65 }, // 289 Slaking
  { hp: 31, attack: 45, defense: 90, speed: 40, specialAttack: 30, specialDefense: 30 }, // 290 Nincada
  { hp: 61, attack: 90, defense: 45, speed: 160, specialAttack: 50, specialDefense: 50 }, // 291 Ninjask
  { hp: 1, attack: 90, defense: 45, speed: 40, specialAttack: 30, specialDefense: 30 }, // 292 Shedinja
  { hp: 64, attack: 51, defense: 23, speed: 28, specialAttack: 51, specialDefense: 23 }, // 293 Whismur
  { hp: 84, attack: 71, defense: 43, speed: 48, specialAttack: 71, specialDefense: 43 }, // 294 Loudred
  { hp: 104, attack: 91, defense: 63, speed: 68, specialAttack: 91, specialDefense: 73 }, // 295 Exploud
  { hp: 72, attack: 60, defense: 30, speed: 25, specialAttack: 20, specialDefense: 30 }, // 296 Makuhita
  { hp: 144, attack: 120, defense: 60, speed: 50, specialAttack: 40, specialDefense: 60 }, // 297 Hariyama
  { hp: 50, attack: 20, defense: 40, speed: 25, specialAttack: 20, specialDefense: 40 }, // 298 Azurill
  { hp: 20, attack: 10, defense: 55, speed: 80, specialAttack: 25, specialDefense: 45 }, // 299 Nosepass
  { hp: 42, attack: 30, defense: 32, speed: 85, specialAttack: 50, specialDefense: 52 }, // 300 Skitty
  { hp: 72, attack: 65, defense: 65, speed: 90, specialAttack: 55, specialDefense: 55 }, // 301 Delcatty
  { hp: 50, attack: 85, defense: 85, speed: 50, specialAttack: 55, specialDefense: 55 }, // 302 Sableye
  { hp: 50, attack: 85, defense: 85, speed: 50, specialAttack: 55, specialDefense: 55 }, // 303 Mawile
  { hp: 50, attack: 70, defense: 100, speed: 30, specialAttack: 40, specialDefense: 40 }, // 304 Aron
  { hp: 60, attack: 90, defense: 140, speed: 40, specialAttack: 50, specialDefense: 50 }, // 305 Lairon
  { hp: 70, attack: 110, defense: 180, speed: 50, specialAttack: 60, specialDefense: 60 }, // 306 Aggron
  { hp: 50, attack: 60, defense: 40, speed: 40, specialAttack: 60, specialDefense: 60 }, // 307 Meditite
  { hp: 60, attack: 60, defense: 75, speed: 80, specialAttack: 60, specialDefense: 75 }, // 308 Medicham
  { hp: 50, attack: 95, defense: 40, speed: 65, specialAttack: 40, specialDefense: 40 }, // 309 Electrike
  { hp: 70, attack: 75, defense: 60, speed: 105, specialAttack: 105, specialDefense: 60 }, // 310 Manectric
  { hp: 40, attack: 45, defense: 40, speed: 65, specialAttack: 65, specialDefense: 75 }, // 311 Plusle
  { hp: 40, attack: 40, defense: 50, speed: 95, specialAttack: 75, specialDefense: 85 }, // 312 Minun
  { hp: 65, attack: 73, defense: 55, speed: 85, specialAttack: 47, specialDefense: 75 }, // 313 Volbeat
  { hp: 65, attack: 47, defense: 55, speed: 85, specialAttack: 73, specialDefense: 75 }, // 314 Illumise
  { hp: 50, attack: 75, defense: 35, speed: 45, specialAttack: 70, specialDefense: 30 }, // 315 Roselia
  { hp: 70, attack: 45, defense: 40, speed: 60, specialAttack: 100, specialDefense: 150 }, // 316 Gulpin
  { hp: 100, attack: 73, defense: 83, speed: 55, specialAttack: 73, specialDefense: 83 }, // 317 Swalot
  { hp: 45, attack: 90, defense: 20, speed: 65, specialAttack: 65, specialDefense: 20 }, // 318 Carvanha
  { hp: 70, attack: 120, defense: 40, speed: 95, specialAttack: 95, specialDefense: 40 }, // 319 Sharpedo
  { hp: 130, attack: 70, defense: 35, speed: 60, specialAttack: 70, specialDefense: 35 }, // 320 Wailmer
  { hp: 170, attack: 90, defense: 45, speed: 60, specialAttack: 90, specialDefense: 45 }, // 321 Wailord
  { hp: 68, attack: 72, defense: 78, speed: 32, specialAttack: 55, specialDefense: 45 }, // 322 Numel
  { hp: 70, attack: 100, defense: 70, speed: 40, specialAttack: 105, specialDefense: 75 }, // 323 Camerupt
  { hp: 20, attack: 65, defense: 100, speed: 20, specialAttack: 120, specialDefense: 70 }, // 324 Torkoal
  { hp: 50, attack: 25, defense: 25, speed: 15, specialAttack: 45, specialDefense: 35 }, // 325 Spoink
  { hp: 80, attack: 45, defense: 65, speed: 80, specialAttack: 90, specialDefense: 110 }, // 326 Grumpig
  { hp: 60, attack: 60, defense: 60, speed: 60, specialAttack: 35, specialDefense: 35 }, // 327 Spinda
  { hp: 50, attack: 85, defense: 55, speed: 35, specialAttack: 35, specialDefense: 110 }, // 328 Trapinch
  { hp: 50, attack: 70, defense: 50, speed: 70, specialAttack: 50, specialDefense: 70 }, // 329 Vibrava
  { hp: 80, attack: 100, defense: 80, speed: 100, specialAttack: 80, specialDefense: 80 }, // 330 Flygon
  { hp: 50, attack: 70, defense: 50, speed: 40, specialAttack: 50, specialDefense: 50 }, // 331 Cacnea
  { hp: 70, attack: 115, defense: 60, speed: 55, specialAttack: 115, specialDefense: 60 }, // 332 Cacturne
  { hp: 76, attack: 75, defense: 40, speed: 50, specialAttack: 106, specialDefense: 76 }, // 333 Swablu
  { hp: 75, attack: 70, defense: 90, speed: 80, specialAttack: 70, specialDefense: 105 }, // 334 Altaria
  { hp: 73, attack: 115, defense: 60, speed: 90, specialAttack: 60, specialDefense: 60 }, // 335 Zangoose
  { hp: 73, attack: 100, defense: 60, speed: 65, specialAttack: 100, specialDefense: 60 }, // 336 Seviper
  { hp: 65, attack: 75, defense: 105, speed: 55, specialAttack: 35, specialDefense: 95 }, // 337 Lunatone
  { hp: 90, attack: 95, defense: 85, speed: 70, specialAttack: 55, specialDefense: 65 }, // 338 Solrock
  { hp: 50, attack: 48, defense: 43, speed: 60, specialAttack: 46, specialDefense: 41 }, // 339 Barboach
  { hp: 110, attack: 78, defense: 73, speed: 60, specialAttack: 76, specialDefense: 71 }, // 340 Whiscash
  { hp: 63, attack: 90, defense: 55, speed: 50, specialAttack: 65, specialDefense: 55 }, // 341 Corphish
  { hp: 63, attack: 120, defense: 85, speed: 55, specialAttack: 90, specialDefense: 55 }, // 342 Crawdaunt
  { hp: 45, attack: 55, defense: 65, speed: 15, specialAttack: 55, specialDefense: 85 }, // 343 Baltoy
  { hp: 60, attack: 70, defense: 105, speed: 75, specialAttack: 70, specialDefense: 120 }, // 344 Claydol
  { hp: 66, attack: 41, defense: 77, speed: 23, specialAttack: 61, specialDefense: 87 }, // 345 Lileep
  { hp: 86, attack: 81, defense: 97, speed: 43, specialAttack: 81, specialDefense: 107 }, // 346 Cradily
  { hp: 52, attack: 108, defense: 45, speed: 45, specialAttack: 48, specialDefense: 45 }, // 347 Anorith
  { hp: 75, attack: 125, defense: 100, speed: 80, specialAttack: 70, specialDefense: 80 }, // 348 Armaldo
  { hp: 43, attack: 30, defense: 55, speed: 52, specialAttack: 40, specialDefense: 65 }, // 349 Feebas
  { hp: 95, attack: 60, defense: 79, speed: 81, specialAttack: 100, specialDefense: 125 }, // 350 Milotic
  { hp: 70, attack: 70, defense: 70, speed: 70, specialAttack: 70, specialDefense: 70 }, // 351 Castform
  { hp: 55, attack: 95, defense: 115, speed: 85, specialAttack: 45, specialDefense: 75 }, // 352 Kecleon
  { hp: 44, attack: 75, defense: 35, speed: 45, specialAttack: 63, specialDefense: 33 }, // 353 Shuppet
  { hp: 64, attack: 115, defense: 65, speed: 75, specialAttack: 83, specialDefense: 63 }, // 354 Banette
  { hp: 38, attack: 30, defense: 32, speed: 75, specialAttack: 30, specialDefense: 32 }, // 355 Duskull
  { hp: 40, attack: 70, defense: 130, speed: 25, specialAttack: 60, specialDefense: 130 }, // 356 Dusclops
  { hp: 78, attack: 66, defense: 68, speed: 91, specialAttack: 44, specialDefense: 56 }, // 357 Tropius
  { hp: 57, attack: 29, defense: 85, speed: 67, specialAttack: 29, specialDefense: 55 }, // 358 Chimecho
  { hp: 100, attack: 50, defense: 80, speed: 50, specialAttack: 60, specialDefense: 110 }, // 359 Absol
  { hp: 95, attack: 23, defense: 48, speed: 48, specialAttack: 23, specialDefense: 48 }, // 360 Wynaut
  { hp: 50, attack: 50, defense: 50, speed: 70, specialAttack: 95, specialDefense: 135 }, // 361 Snorunt
  { hp: 80, attack: 80, defense: 80, speed: 80, specialAttack: 80, specialDefense: 80 }, // 362 Glalie
  { hp: 70, attack: 40, defense: 50, speed: 45, specialAttack: 55, specialDefense: 50 }, // 363 Spheal
  { hp: 90, attack: 60, defense: 70, speed: 45, specialAttack: 75, specialDefense: 70 }, // 364 Sealeo
  { hp: 110, attack: 80, defense: 90, speed: 65, specialAttack: 95, specialDefense: 90 }, // 365 Walrein
  { hp: 35, attack: 64, defense: 85, speed: 32, specialAttack: 74, specialDefense: 55 }, // 366 Clamperl
  { hp: 55, attack: 104, defense: 105, speed: 52, specialAttack: 94, specialDefense: 75 }, // 367 Huntail
  { hp: 55, attack: 84, defense: 105, speed: 52, specialAttack: 114, specialDefense: 75 }, // 368 Gorebyss
  { hp: 100, attack: 90, defense: 130, speed: 55, specialAttack: 45, specialDefense: 65 }, // 369 Relicanth
  { hp: 43, attack: 30, defense: 55, speed: 97, specialAttack: 40, specialDefense: 65 }, // 370 Luvdisc
  { hp: 35, attack: 60, defense: 30, speed: 50, specialAttack: 31, specialDefense: 56 }, // 371 Bagon
  { hp: 65, attack: 95, defense: 100, speed: 50, specialAttack: 60, specialDefense: 50 }, // 372 Shelgon
  { hp: 95, attack: 135, defense: 80, speed: 100, specialAttack: 110, specialDefense: 80 }, // 373 Salamence
  { hp: 40, attack: 55, defense: 80, speed: 30, specialAttack: 35, specialDefense: 60 }, // 374 Beldum
  { hp: 60, attack: 75, defense: 100, speed: 50, specialAttack: 55, specialDefense: 80 }, // 375 Metang
  { hp: 80, attack: 135, defense: 130, speed: 70, specialAttack: 95, specialDefense: 90 }, // 376 Metagross
  { hp: 80, attack: 100, defense: 200, speed: 50, specialAttack: 50, specialDefense: 100 }, // 377 Regirock
  { hp: 80, attack: 50, defense: 100, speed: 50, specialAttack: 100, specialDefense: 200 }, // 378 Regice
  { hp: 80, attack: 75, defense: 150, speed: 50, specialAttack: 75, specialDefense: 150 }, // 379 Registeel
  { hp: 80, attack: 80, defense: 90, speed: 110, specialAttack: 110, specialDefense: 130 }, // 380 Latias
  { hp: 80, attack: 90, defense: 80, speed: 110, specialAttack: 130, specialDefense: 110 }, // 381 Latios
  { hp: 100, attack: 100, defense: 90, speed: 90, specialAttack: 150, specialDefense: 140 }, // 382 Kyogre
  { hp: 100, attack: 150, defense: 140, speed: 90, specialAttack: 100, specialDefense: 90 }, // 383 Groudon
  { hp: 105, attack: 150, defense: 90, speed: 95, specialAttack: 150, specialDefense: 90 }, // 384 Rayquaza
  { hp: 100, attack: 100, defense: 100, speed: 100, specialAttack: 100, specialDefense: 100 }, // 385 Jirachi
  { hp: 50, attack: 180, defense: 20, speed: 150, specialAttack: 180, specialDefense: 20 }, // 386 Deoxys (Normal Forme)
];

/**
 * Get base stats for a Pokemon species
 * @param species Pokemon species ID (1-386 for Gen 1-3)
 * @returns Base stats, or default values if species not found
 */
export function getBaseStats(species: number): BaseStats {
  if (species >= 1 && species < POKEMON_BASE_STATS.length) {
    return POKEMON_BASE_STATS[species];
  }
  
  // Default stats for unknown species
  // Using 60 for all stats as a reasonable middle-ground value
  // This is slightly above the average of fully evolved Pokemon (~55-65 per stat)
  // and prevents unrealistic extremes while maintaining gameplay balance
  return {
    hp: 60,
    attack: 60,
    defense: 60,
    speed: 60,
    specialAttack: 60,
    specialDefense: 60,
  };
}
