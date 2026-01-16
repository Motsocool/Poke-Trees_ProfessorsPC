/**
 * Export/Injection component for injecting Pokémon into Gen 3 saves
 */
import { useState } from 'react';
import { injectPokemonToGen3Save, findEmptySlots, validateInjectionTarget, type InjectionTarget } from '../lib/injection/gen3';
import type { StoredPokemon } from '../lib/db/vaultDb';
import { decodePk3 } from '../lib/gen3/pk3/pk3';
import { loadGen3Save } from '../lib/gen3/save/gen3Save';
import { makeErrorUserFriendly, formatErrorForDisplay } from '../lib/utils/errorMessages';

// Delay before cleaning up download link to ensure download starts
const DOWNLOAD_CLEANUP_DELAY_MS = 100;

interface ExportSaveProps {
  vaultPokemon: StoredPokemon[];
}

export function ExportSave({ vaultPokemon }: ExportSaveProps) {
  const [saveFile, setSaveFile] = useState<ArrayBuffer | null>(null);
  const [saveFileName, setSaveFileName] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<StoredPokemon[]>([]);
  const [targetBox, setTargetBox] = useState<number>(0);
  const [targetSlot, setTargetSlot] = useState<number>(0);
  const [emptySlots, setEmptySlots] = useState<InjectionTarget[]>([]);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Validate size
      if (arrayBuffer.byteLength !== 131072) {
        throw new Error('Invalid save file size. Must be exactly 128KB (131,072 bytes) for Gen 3 saves.');
      }

      // Validate save structure before allowing injection
      // This will throw an error if the save has corrupted section IDs
      loadGen3Save(arrayBuffer);

      setSaveFile(arrayBuffer);
      setSaveFileName(file.name);

      // Find empty slots
      const slots = findEmptySlots(arrayBuffer);
      setEmptySlots(slots);
      setStatus(`Loaded ${file.name}. Found ${slots.length} empty slots.`);
      setError(null);
    } catch (err) {
      console.error('Load error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      const userFriendlyError = makeErrorUserFriendly(error);
      const displayMessage = formatErrorForDisplay(userFriendlyError, true);
      setError(displayMessage);
      setSaveFile(null);
      setStatus('');
    }
  };

  const handleInject = () => {
    if (!saveFile || selectedPokemon.length === 0) {
      setError('Please select a save file and at least one Pokémon to inject');
      return;
    }

    try {
      let currentSave = saveFile;
      let currentBox = targetBox;
      let currentSlot = targetSlot;

      for (const pokemon of selectedPokemon) {
        // Validate target
        const validation = validateInjectionTarget(currentSave, {
          boxIndex: currentBox,
          slotIndex: currentSlot,
        });

        if (!validation.valid) {
          throw new Error(`Invalid injection target Box ${currentBox + 1}, Slot ${currentSlot + 1}: ${validation.reason}`);
        }

        // Get pk3 data from vault Pokémon
        if (!pokemon.pk3Data) {
          throw new Error(`Pokémon ${pokemon.nickname || pokemon.species} has no pk3 data`);
        }

        const pk3Buffer = pokemon.pk3Data;
        const pk3 = decodePk3(pk3Buffer);

        // Inject
        currentSave = injectPokemonToGen3Save(currentSave, pk3, {
          boxIndex: currentBox,
          slotIndex: currentSlot,
        });

        // Move to next slot
        currentSlot++;
        if (currentSlot >= 30) {
          currentSlot = 0;
          currentBox++;
          if (currentBox >= 14) {
            throw new Error('Ran out of space in save file');
          }
        }
      }

      // Download modified save
      try {
        const blob = new Blob([currentSave], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const downloadName = saveFileName.replace('.sav', '_modified.sav');
        a.href = url;
        a.download = downloadName;
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Trigger download
        a.click();
        
        // Clean up after a short delay to ensure download starts
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, DOWNLOAD_CLEANUP_DELAY_MS);

        setStatus(`✅ Successfully injected ${selectedPokemon.length} Pokémon! Download started: "${downloadName}"`);
        setError(null);
      } catch (downloadErr) {
        console.error('Download error:', downloadErr);
        throw new Error(`Failed to download modified save: ${downloadErr instanceof Error ? downloadErr.message : String(downloadErr)}`);
      }
    } catch (err) {
      console.error('Injection error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      const userFriendlyError = makeErrorUserFriendly(error);
      const displayMessage = formatErrorForDisplay(userFriendlyError, true);
      setError(displayMessage);
      setStatus('');
    }
  };

  const togglePokemonSelection = (pokemon: StoredPokemon) => {
    if (selectedPokemon.includes(pokemon)) {
      setSelectedPokemon(selectedPokemon.filter((p) => p !== pokemon));
    } else {
      setSelectedPokemon([...selectedPokemon, pokemon]);
    }
  };

  return (
    <div className="export-save">
      <h2>Export & Inject Pokémon</h2>

      <div className="export-section">
        <h3>1. Load Gen 3 Save File</h3>
        <p>Load a Gen 3 save file (Ruby/Sapphire/Emerald/FireRed/LeafGreen, 128KB) to inject Pokémon into.</p>
        <input
          type="file"
          accept=".sav"
          onChange={handleFileSelect}
          className="file-input"
        />
        {saveFile && (
          <div className="save-info">
            <p>✓ Loaded: {saveFileName}</p>
            <p>Empty slots: {emptySlots.length}</p>
          </div>
        )}
      </div>

      <div className="export-section">
        <h3>2. Select Pokémon to Inject</h3>
        <p>Select which Pokémon from your vault to inject into the save file.</p>
        <div className="pokemon-selection-grid">
          {vaultPokemon.map((pokemon) => (
            <div
              key={pokemon.id}
              className={`pokemon-selection-card ${selectedPokemon.includes(pokemon) ? 'selected' : ''}`}
              onClick={() => togglePokemonSelection(pokemon)}
            >
              <div className="selection-checkbox">
                {selectedPokemon.includes(pokemon) ? '✓' : ''}
              </div>
              <div className="pokemon-info">
                <span className="pokemon-species">#{pokemon.species.toString().padStart(3, '0')}</span>
                <span className="pokemon-nickname">{pokemon.nickname || `Pokémon #${pokemon.species}`}</span>
                <span className="pokemon-level">Lv. {pokemon.level}</span>
              </div>
            </div>
          ))}
        </div>
        {selectedPokemon.length > 0 && (
          <p className="selection-count">Selected: {selectedPokemon.length} Pokémon</p>
        )}
      </div>

      <div className="export-section">
        <h3>3. Choose Injection Target</h3>
        <div className="target-controls">
          <label>
            Box:
            <select value={targetBox} onChange={(e) => setTargetBox(parseInt(e.target.value))}>
              {Array.from({ length: 14 }, (_, i) => (
                <option key={i} value={i}>
                  Box {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Starting Slot:
            <select value={targetSlot} onChange={(e) => setTargetSlot(parseInt(e.target.value))}>
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i} value={i}>
                  Slot {i + 1}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="target-info">
          Pokémon will be injected starting at Box {targetBox + 1}, Slot {targetSlot + 1}
        </p>
      </div>

      <div className="export-section">
        <button
          onClick={handleInject}
          disabled={!saveFile || selectedPokemon.length === 0}
          className="inject-button"
        >
          {selectedPokemon.length > 0 
            ? `Inject & Download (${selectedPokemon.length} Pokémon)` 
            : 'Inject & Download'}
        </button>
        {!saveFile && (
          <p className="button-hint">⬆️ Load a save file first</p>
        )}
        {saveFile && selectedPokemon.length === 0 && (
          <p className="button-hint">⬆️ Select at least one Pokémon</p>
        )}
      </div>

      {status && (
        <div className="status-message success">
          {status}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {status && status.includes('Download started') && (
        <div className="download-help">
          <p><small>💡 If the download didn't start, check your browser's download settings or pop-up blocker.</small></p>
        </div>
      )}

      <div className="export-info">
        <h4>⚠️ Important Notes:</h4>
        <ul>
          <li>Always keep backups of your original save files</li>
          <li>Injected Pokémon will overwrite existing data at the target slots</li>
          <li>Checksums are automatically recalculated to maintain save integrity</li>
          <li>Test the modified save in your game before discarding the original</li>
          <li>Only Gen 3 saves are currently supported for injection</li>
        </ul>
      </div>
    </div>
  );
}
