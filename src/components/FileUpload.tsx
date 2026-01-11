/**
 * File upload component for importing save files
 */

import { useState } from 'react';
import { parseGen1Save } from '../lib/parsers/gen1';
import { parseGen2Save } from '../lib/parsers/gen2';
import { parseGen3Save } from '../lib/parsers/gen3';
import { convertGen12ToGen3 } from '../lib/conversion/dvToIv';
import { checkLegality } from '../lib/legality/validator';
import { addMultiplePokemon } from '../store/db';
import type { ParsedSaveFile, VaultPokemon, Gen12Pokemon, Gen3Pokemon } from '../lib/types';

interface FileUploadProps {
  onImportComplete: (count: number) => void;
}

export function FileUpload({ onImportComplete }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setStatus('Reading file...');

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Detect generation and parse
      setStatus('Parsing save file...');
      const parsedSave = await parseSaveFile(data);

      // Extract Pokémon from boxes
      setStatus('Extracting Pokémon...');
      const pokemonList: VaultPokemon[] = [];

      for (const box of parsedSave.boxes) {
        for (const pokemon of box.pokemon) {
          if (pokemon) {
            // Convert to Gen 3 format if needed
            let vaultPokemon: Omit<VaultPokemon, 'id'>;

            if (parsedSave.metadata.generation === 3) {
              const gen3Pokemon = pokemon as Gen3Pokemon;
              
              // Validate legality
              const legalityCheck = checkLegality(gen3Pokemon);
              
              vaultPokemon = {
                ...gen3Pokemon,
                sourceGeneration: parsedSave.metadata.generation,
                sourceGame: parsedSave.metadata.game,
                importDate: new Date(),
                isLegal: legalityCheck.isLegal,
                legalityNotes: [...legalityCheck.errors, ...legalityCheck.warnings],
              };
            } else {
              const converted = convertGen12ToGen3(
                pokemon as Gen12Pokemon,
                parsedSave.metadata.game
              );
              
              // Validate legality
              const legalityCheck = checkLegality(converted);
              
              vaultPokemon = {
                ...converted,
                importDate: new Date(),
                isLegal: legalityCheck.isLegal,
                legalityNotes: [...legalityCheck.errors, ...legalityCheck.warnings],
              };
            }

            pokemonList.push(vaultPokemon as VaultPokemon);
          }
        }
      }

      // Save to IndexedDB
      setStatus(`Saving ${pokemonList.length} Pokémon to vault...`);
      await addMultiplePokemon(pokemonList);

      setStatus(`Successfully imported ${pokemonList.length} Pokémon!`);
      onImportComplete(pokemonList.length);

      // Clear file input
      event.target.value = '';
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import save file');
      setStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="upload-container">
        <h2>Import Save File</h2>
        <p className="upload-description">
          Upload a Pokémon save file from Gen 1 (Red/Blue/Yellow), Gen 2 (Gold/Silver/Crystal),
          or Gen 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen).
        </p>

        <label htmlFor="file-input" className="file-label">
          <div className="file-button">
            {isProcessing ? 'Processing...' : 'Choose Save File'}
          </div>
        </label>
        <input
          id="file-input"
          type="file"
          accept=".sav,.gba,.gbc,.gb"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="file-input"
        />

        {status && (
          <div className="status-message">
            {status}
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="file-info">
          <h3>Supported Files:</h3>
          <ul>
            <li>Gen 1: .sav files (32KB) - Red, Blue, Yellow</li>
            <li>Gen 2: .sav files (32KB) - Gold, Silver, Crystal</li>
            <li>Gen 3: .sav files (128KB) - Ruby, Sapphire, Emerald, FireRed, LeafGreen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Detect generation and parse save file
 */
async function parseSaveFile(data: Uint8Array): Promise<ParsedSaveFile> {
  // Detect by file size
  if (data.length === 0x8000) {
    // 32KB - Gen 1 or Gen 2
    // Try Gen 2 first (more features)
    try {
      return parseGen2Save(data);
    } catch {
      // Fall back to Gen 1
      return parseGen1Save(data);
    }
  } else if (data.length === 0x20000) {
    // 128KB - Gen 3
    return parseGen3Save(data);
  } else {
    throw new Error(
      `Unsupported save file size: ${data.length} bytes. ` +
      `Expected 32KB (Gen 1/2) or 128KB (Gen 3).`
    );
  }
}
