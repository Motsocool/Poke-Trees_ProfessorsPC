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
  const [showInvalidOnly, setShowInvalidOnly] = useState(false);
  const [showShinyOnly, setShowShinyOnly] = useState(false);
  const [filterGeneration, setFilterGeneration] = useState<number | null>(null);

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
    // Text search filter
    if (filter) {
      const query = filter.toLowerCase();
      const matchesText = (
        p.nickname.toLowerCase().includes(query) ||
        p.otName.toLowerCase().includes(query) ||
        getSpeciesName(p.species).toLowerCase().includes(query) ||
        p.species.toString().includes(query)
      );
      if (!matchesText) return false;
    }

    // Invalid checksum filter
    if (showInvalidOnly && p.isValid) return false;

    // Shiny filter (check if personality value indicates shiny)
    if (showShinyOnly) {
      // Simplified shiny check - bit 0 XOR bit 16 of personality
      const isShiny = ((p.personality & 0xFFFF) ^ (p.personality >>> 16)) < 8;
      if (!isShiny) return false;
    }

    // Generation filter
    if (filterGeneration !== null && p.sourceGeneration !== filterGeneration) {
      return false;
    }

    return true;
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
        <>
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
              marginBottom: '12px',
              fontSize: '16px',
            }}
          />
          
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setShowInvalidOnly(!showInvalidOnly)}
              style={{
                padding: '8px 16px',
                background: showInvalidOnly ? '#fed7d7' : '#f7fafc',
                color: showInvalidOnly ? '#c53030' : '#666',
                border: `2px solid ${showInvalidOnly ? '#c53030' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ⚠️ Invalid Only
            </button>
            
            <button
              onClick={() => setShowShinyOnly(!showShinyOnly)}
              style={{
                padding: '8px 16px',
                background: showShinyOnly ? '#fef5e7' : '#f7fafc',
                color: showShinyOnly ? '#b7791f' : '#666',
                border: `2px solid ${showShinyOnly ? '#b7791f' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ✨ Shiny Only
            </button>

            <select
              value={filterGeneration ?? ''}
              onChange={(e) => setFilterGeneration(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '8px 16px',
                background: '#f7fafc',
                border: `2px solid ${filterGeneration !== null ? '#667eea' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              <option value="">All Generations</option>
              <option value="1">Gen 1</option>
              <option value="2">Gen 2</option>
              <option value="3">Gen 3</option>
            </select>
            
            {(showInvalidOnly || showShinyOnly || filterGeneration !== null || filter) && (
              <button
                onClick={() => {
                  setFilter('');
                  setShowInvalidOnly(false);
                  setShowShinyOnly(false);
                  setFilterGeneration(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#f7fafc',
                  color: '#666',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </>
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
          {filteredPokemon.map((p) => {
            // Calculate if shiny
            const isShiny = ((p.personality & 0xFFFF) ^ (p.personality >>> 16)) < 8;
            
            return (
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
                position: 'relative',
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
              {isShiny && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '20px',
                  filter: 'drop-shadow(0 0 2px gold)',
                }}>
                  ✨
                </div>
              )}
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
          )})}
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
