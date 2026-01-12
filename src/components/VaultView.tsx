import { useState, useEffect } from 'react';
import { getAllPokemon, countPokemon, StoredPokemon, clearVault } from '../lib/db/vaultDb';
import { getSpeciesName } from '../lib/species/speciesTranscode';

interface VaultViewProps {
  onSelectPokemon: (pokemon: StoredPokemon) => void;
  selectedPokemon: StoredPokemon | null;
}

export default function VaultView({ onSelectPokemon, selectedPokemon }: VaultViewProps) {
  const [pokemon, setPokemon] = useState<StoredPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState('');

  const loadPokemon = async () => {
    setLoading(true);
    try {
      const [all, total] = await Promise.all([getAllPokemon(), countPokemon()]);
      setPokemon(all);
      setCount(total);
    } catch (err) {
      console.error('Failed to load vault:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemon();
  }, []);

  const handleClearVault = async () => {
    if (!confirm('Are you sure you want to delete all Pokémon from the vault? This cannot be undone.')) {
      return;
    }

    try {
      await clearVault();
      await loadPokemon();
      onSelectPokemon(null as any);
    } catch (err) {
      console.error('Failed to clear vault:', err);
      alert('Failed to clear vault');
    }
  };

  const filteredPokemon = pokemon.filter(p => {
    if (!filter) return true;
    const query = filter.toLowerCase();
    return (
      p.nickname.toLowerCase().includes(query) ||
      p.otName.toLowerCase().includes(query) ||
      getSpeciesName(p.species).toLowerCase().includes(query) ||
      p.species.toString().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner" />
          <p style={{ marginTop: '16px' }}>Loading vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Pokémon Vault ({count})
        </h2>
        {count > 0 && (
          <button className="btn-danger" onClick={handleClearVault}>
            Clear Vault
          </button>
        )}
      </div>

      {count > 0 && (
        <input
          type="text"
          placeholder="Search by nickname, OT, or species..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            marginBottom: '16px',
            fontSize: '16px',
          }}
        />
      )}

      {count === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No Pokémon in vault</p>
          <p style={{ fontSize: '14px' }}>Import a save file to get started!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          maxHeight: '600px',
          overflowY: 'auto',
          padding: '4px',
        }}>
          {filteredPokemon.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPokemon(p)}
              style={{
                padding: '16px',
                background: selectedPokemon?.id === p.id ? '#e6f2ff' : '#f7fafc',
                border: `2px solid ${selectedPokemon?.id === p.id ? '#667eea' : '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedPokemon?.id !== p.id) {
                  e.currentTarget.style.background = '#edf2f7';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPokemon?.id !== p.id) {
                  e.currentTarget.style.background = '#f7fafc';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    {p.nickname}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {getSpeciesName(p.species)}
                  </div>
                </div>
                <div style={{
                  background: p.isValid ? '#c6f6d5' : '#fed7d7',
                  color: p.isValid ? '#22543d' : '#c53030',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  Lv.{p.level}
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                OT: {p.otName} • {p.sourceGame || 'Gen 3'}
                {p.sourceGeneration && p.sourceGeneration !== 3 && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    background: '#fef5e7',
                    color: '#b7791f',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    Gen {p.sourceGeneration} → 3
                  </span>
                )}
              </div>
              {!p.isValid && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#c53030' }}>
                  ⚠️ Invalid checksum
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredPokemon.length === 0 && filter && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No Pokémon match your search
        </div>
      )}
    </div>
  );
}
