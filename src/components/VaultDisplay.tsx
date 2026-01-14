/**
 * Pokémon vault display component
 */

import { useState, useEffect } from 'react';
import type { VaultPokemon } from '../lib/types';
import { getAllPokemon, deletePokemon, getVaultStats } from '../store/db';

interface VaultDisplayProps {
  refreshTrigger?: number;
  onSelectPokemon: (pokemon: VaultPokemon) => void;
}

export function VaultDisplay({ refreshTrigger, onSelectPokemon }: VaultDisplayProps) {
  const [pokemon, setPokemon] = useState<VaultPokemon[]>([]);
  const [stats, setStats] = useState({ total: 0, legal: 0, illegal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'legal' | 'illegal'>('all');

  useEffect(() => {
    loadPokemon();
  }, [refreshTrigger]);

  const loadPokemon = async () => {
    setIsLoading(true);
    try {
      const allPokemon = await getAllPokemon();
      setPokemon(allPokemon);

      const vaultStats = await getVaultStats();
      setStats({
        total: vaultStats.total,
        legal: vaultStats.legal,
        illegal: vaultStats.illegal,
      });
    } catch (err) {
      console.error('Failed to load Pokémon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this Pokémon from the vault?')) {
      try {
        await deletePokemon(id);
        await loadPokemon();
      } catch (err) {
        console.error('Failed to delete Pokémon:', err);
      }
    }
  };

  const filteredPokemon = pokemon.filter((p) => {
    if (filter === 'legal') return p.isLegal;
    if (filter === 'illegal') return !p.isLegal;
    return true;
  });

  if (isLoading) {
    return <div className="vault-loading">Loading vault...</div>;
  }

  return (
    <div className="vault-display">
      <div className="vault-header">
        <h2>Pokémon Vault</h2>
        <div className="vault-stats">
          <span>Total: {stats.total}</span>
          <span className="legal">Legal: {stats.legal}</span>
          <span className="illegal">Illegal: {stats.illegal}</span>
        </div>
      </div>

      <div className="vault-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button
          className={filter === 'legal' ? 'active' : ''}
          onClick={() => setFilter('legal')}
        >
          Legal ({stats.legal})
        </button>
        <button
          className={filter === 'illegal' ? 'active' : ''}
          onClick={() => setFilter('illegal')}
        >
          Needs Review ({stats.illegal})
        </button>
      </div>

      {filteredPokemon.length === 0 ? (
        <div className="vault-empty">
          <p>No Pokémon in vault. Import a save file to get started!</p>
        </div>
      ) : (
        <div className="vault-grid">
          {filteredPokemon.map((p) => (
            <div
              key={p.id}
              className={`pokemon-card ${p.isLegal ? 'legal' : 'illegal'} ${p.shiny ? 'shiny' : ''}`}
              onClick={() => onSelectPokemon(p)}
            >
              <div className="pokemon-header">
                <span className="pokemon-species">#{p.species.toString().padStart(3, '0')}</span>
                {p.shiny && <span className="shiny-badge">✨</span>}
                {!p.isLegal && <span className="illegal-badge">⚠️</span>}
              </div>
              <div className="pokemon-info">
                <div className="pokemon-nickname">{p.nickname || `Pokémon #${p.species}`}</div>
                <div className="pokemon-level">Lv. {p.level}</div>
                <div className="pokemon-ot">OT: {p.ot}</div>
                <div className="pokemon-source">
                  Gen {p.sourceGeneration}
                </div>
              </div>
              <div className="pokemon-stats">
                <div className="stat">
                  <span className="stat-label">HP</span>
                  <span className="stat-value">{p.stats.hp}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">ATK</span>
                  <span className="stat-value">{p.stats.attack}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">DEF</span>
                  <span className="stat-value">{p.stats.defense}</span>
                </div>
              </div>
              <button
                className="delete-button"
                onClick={(e) => handleDelete(p.id, e)}
                title="Delete from vault"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
