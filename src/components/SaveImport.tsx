import { useState } from 'react';
import { loadGen3Save, extractPokemonFromSave, canSafelyModifySave } from '../lib/gen3/save/gen3Save';
import { addMultiplePokemon, serializePk3ForStorage, StoredPokemon } from '../lib/db/vaultDb';
import { decryptAndUnshufflePk3 } from '../lib/gen3/pk3/pk3';
import { parseGrowth, calculateLevel, extractTrainerIds } from '../lib/gen3/pk3/substruct';
import { decodeGen3String } from '../lib/species/speciesTranscode';
import { parseGen1Save } from '../lib/parsers/gen1';
import { parseGen2Save } from '../lib/parsers/gen2';
import { convertGen12ToGen3 } from '../lib/conversion/dvToIv';
import { checkLegality } from '../lib/legality/validator';
import type { Gen12Pokemon } from '../lib/types';

interface SaveImportProps {
  onImportComplete: () => void;
}

export default function SaveImport({ onImportComplete }: SaveImportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer();

      // Detect generation by file size
      const size = buffer.byteLength;
      let toStore: StoredPokemon[] = [];

      if (size === 0x8000) {
        // 32KB - Gen 1 or Gen 2
        toStore = await importGen12Save(buffer, file.name);
      } else if (size === 0x20000) {
        // 128KB - Gen 3
        toStore = await importGen3Save(buffer);
      } else {
        throw new Error(
          `Invalid save file size: ${size} bytes. Expected:\n` +
          `- 32KB (32,768 bytes) for Gen 1/2\n` +
          `- 128KB (131,072 bytes) for Gen 3`
        );
      }

      if (toStore.length === 0) {
        setSuccess('Save file loaded successfully, but no Pokémon found in PC boxes.');
        return;
      }

      // Store in vault
      await addMultiplePokemon(toStore);

      setSuccess(`Successfully imported ${toStore.length} Pokémon from ${file.name}!`);
      onImportComplete();

      // Reset file input
      event.target.value = '';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  async function importGen3Save(buffer: ArrayBuffer): Promise<StoredPokemon[]> {
    // Load and validate save
    const save = loadGen3Save(buffer);

    // Check if we can safely modify
    const safetyCheck = canSafelyModifySave(save);
    if (!safetyCheck.canModify) {
      throw new Error(`Save file failed integrity checks:\n${safetyCheck.reasons.join('\n')}`);
    }

    // Extract Pokémon
    const extracted = extractPokemonFromSave(save);
    const toStore: StoredPokemon[] = [];

    for (const { pk3, box, slot, isValid } of extracted) {
      try {
        const substructs = decryptAndUnshufflePk3(pk3);
        const growth = parseGrowth(substructs.growth);
        const { tid, sid } = extractTrainerIds(pk3.otId);
        
        const nickname = decodeGen3String(pk3.nickname);
        const otName = decodeGen3String(pk3.otName);
        const level = calculateLevel(growth.experience);

        toStore.push({
          pk3Data: serializePk3ForStorage(pk3),
          personality: pk3.personality,
          species: growth.species,
          nickname,
          otName,
          level,
          tid,
          sid,
          isValid,
          sourceGame: 'Gen3',
          importedAt: Date.now(),
        });
      } catch (err) {
        console.warn(`Failed to parse Pokémon at box ${box}, slot ${slot}:`, err);
      }
    }

    return toStore;
  }

  async function importGen12Save(buffer: ArrayBuffer): Promise<StoredPokemon[]> {
    // Try Gen 2 first (more features), fall back to Gen 1
    let parsedSave;
    try {
      parsedSave = parseGen2Save(buffer);
    } catch {
      parsedSave = parseGen1Save(buffer);
    }

    const toStore: StoredPokemon[] = [];

    // Extract and convert all Pokémon
    for (const box of parsedSave.boxes) {
      for (const pokemon of box.pokemon) {
        if (!pokemon) continue;

        try {
          // Convert to Gen 3 format
          const gen3Pokemon = convertGen12ToGen3(
            pokemon as Gen12Pokemon,
            parsedSave.metadata.game
          );

          // Validate legality
          const legalityCheck = checkLegality(gen3Pokemon);

          // For now, store as a placeholder until we have full pk3 encoding
          // This would need the full pk3 encoding implementation
          const placeholderPk3 = new ArrayBuffer(100);
          const pk3View = new DataView(placeholderPk3);
          pk3View.setUint32(0, gen3Pokemon.personalityValue, true);
          pk3View.setUint16(4, gen3Pokemon.species, true);

          toStore.push({
            pk3Data: placeholderPk3,
            personality: gen3Pokemon.personalityValue,
            species: gen3Pokemon.species,
            nickname: gen3Pokemon.nickname,
            otName: gen3Pokemon.ot,
            level: gen3Pokemon.level,
            tid: gen3Pokemon.otId,
            sid: gen3Pokemon.otSecretId || 0,
            isValid: legalityCheck.isLegal,
            sourceGame: `${parsedSave.metadata.game} (Converted)`,
            importedAt: Date.now(),
          });
        } catch (err) {
          console.warn(`Failed to convert Pokémon ${pokemon.nickname}:`, err);
        }
      }
    }

    return toStore;
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
        Import Save File
      </h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Select a Pokémon save file from Gen 1, 2, or 3 to extract Pokémon from PC boxes.
        Gen 1/2 Pokémon will be automatically converted to Gen 3 format using PCCS standards.
      </p>

      {error && (
        <div className="error">
          <strong>Error:</strong>
          <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{error}</pre>
        </div>
      )}

      {success && (
        <div className="success">
          <strong>Success!</strong> {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label
          htmlFor="save-file-input"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: loading ? '#cbd5e0' : '#667eea',
            color: 'white',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Importing...' : 'Choose .sav File'}
        </label>
        <input
          id="save-file-input"
          type="file"
          accept=".sav"
          onChange={handleFileSelect}
          disabled={loading}
          style={{ display: 'none' }}
        />
        {loading && <div className="spinner" />}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>ℹ️ Supported Games</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', color: '#666' }}>
          <div>
            <strong>Gen 1 (32KB)</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
              <li>Pokémon Red</li>
              <li>Pokémon Blue</li>
              <li>Pokémon Yellow</li>
            </ul>
          </div>
          <div>
            <strong>Gen 2 (32KB)</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
              <li>Pokémon Gold</li>
              <li>Pokémon Silver</li>
              <li>Pokémon Crystal</li>
            </ul>
          </div>
          <div>
            <strong>Gen 3 (128KB)</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
              <li>Pokémon Ruby</li>
              <li>Pokémon Sapphire</li>
              <li>Pokémon Emerald</li>
              <li>Pokémon FireRed</li>
              <li>Pokémon LeafGreen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
