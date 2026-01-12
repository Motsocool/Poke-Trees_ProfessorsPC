import { useState } from 'react';
import { loadGen3Save, extractPokemonFromSave, canSafelyModifySave } from '../lib/gen3/save/gen3Save';
import { addMultiplePokemon, serializePk3ForStorage, StoredPokemon } from '../lib/db/vaultDb';
import { decryptAndUnshufflePk3 } from '../lib/gen3/pk3/pk3';
import { parseGrowth, calculateLevel, extractTrainerIds } from '../lib/gen3/pk3/substruct';
import { decodeGen3String } from '../lib/species/speciesTranscode';

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

      // Validate size
      if (buffer.byteLength !== 131072) {
        throw new Error(`Invalid save file size: ${buffer.byteLength} bytes. Expected 131,072 bytes (128KB)`);
      }

      // Load and validate save
      const save = loadGen3Save(buffer);

      // Check if we can safely modify
      const safetyCheck = canSafelyModifySave(save);
      if (!safetyCheck.canModify) {
        throw new Error(`Save file failed integrity checks:\n${safetyCheck.reasons.join('\n')}`);
      }

      // Extract Pokémon
      const extracted = extractPokemonFromSave(save);

      if (extracted.length === 0) {
        setSuccess('Save file loaded successfully, but no Pokémon found in PC boxes.');
        return;
      }

      // Convert to StoredPokemon format
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
            sourceGame: 'Gen3', // Could be enhanced to detect specific game
            importedAt: Date.now(),
          });
        } catch (err) {
          console.warn(`Failed to parse Pokémon at box ${box}, slot ${slot}:`, err);
        }
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

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
        Import Save File
      </h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Select a Gen 3 GBA save file (Ruby/Sapphire/Emerald/FireRed/LeafGreen) to extract Pokémon from PC boxes.
        File must be exactly 128KB (131,072 bytes).
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
        <ul style={{ paddingLeft: '20px', color: '#666' }}>
          <li>Pokémon Ruby</li>
          <li>Pokémon Sapphire</li>
          <li>Pokémon Emerald</li>
          <li>Pokémon FireRed</li>
          <li>Pokémon LeafGreen</li>
        </ul>
      </div>
    </div>
  );
}
