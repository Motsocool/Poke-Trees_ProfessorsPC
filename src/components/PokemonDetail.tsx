/**
 * Pokémon detail viewer component
 */

import type { VaultPokemon } from '../lib/types';

interface PokemonDetailProps {
  pokemon: VaultPokemon | null;
  onClose: () => void;
}

export function PokemonDetail({ pokemon, onClose }: PokemonDetailProps) {
  if (!pokemon) return null;

  return (
    <div className="pokemon-detail-overlay" onClick={onClose}>
      <div className="pokemon-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="detail-header">
          <h2>
            {pokemon.nickname || `Pokémon #${pokemon.species}`}
            {pokemon.shiny && <span className="shiny-badge">✨ Shiny</span>}
          </h2>
          <div className="detail-subtitle">
            Species #{pokemon.species.toString().padStart(3, '0')} • Level {pokemon.level}
          </div>
        </div>

        <div className="detail-section">
          <h3>Trainer Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">OT:</span>
              <span className="value">{pokemon.ot}</span>
            </div>
            <div className="info-item">
              <span className="label">ID:</span>
              <span className="value">{pokemon.otId.toString().padStart(5, '0')}</span>
            </div>
            {pokemon.otSecretId !== undefined && (
              <div className="info-item">
                <span className="label">SID:</span>
                <span className="value">{pokemon.otSecretId.toString().padStart(5, '0')}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">Gender:</span>
              <span className="value">{pokemon.gender === 'M' ? '♂' : pokemon.gender === 'F' ? '♀' : '-'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-name">HP</span>
              <span className="stat-bar" style={{ width: `${(pokemon.stats.hp / 255) * 100}%` }}></span>
              <span className="stat-number">{pokemon.stats.hp}</span>
            </div>
            <div className="stat-item">
              <span className="stat-name">Attack</span>
              <span className="stat-bar" style={{ width: `${(pokemon.stats.attack / 255) * 100}%` }}></span>
              <span className="stat-number">{pokemon.stats.attack}</span>
            </div>
            <div className="stat-item">
              <span className="stat-name">Defense</span>
              <span className="stat-bar" style={{ width: `${(pokemon.stats.defense / 255) * 100}%` }}></span>
              <span className="stat-number">{pokemon.stats.defense}</span>
            </div>
            <div className="stat-item">
              <span className="stat-name">Sp. Atk</span>
              <span className="stat-bar" style={{ width: `${((pokemon.stats.specialAttack || 50) / 255) * 100}%` }}></span>
              <span className="stat-number">{pokemon.stats.specialAttack || '-'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-name">Sp. Def</span>
              <span className="stat-bar" style={{ width: `${((pokemon.stats.specialDefense || 50) / 255) * 100}%` }}></span>
              <span className="stat-number">{pokemon.stats.specialDefense || '-'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-name">Speed</span>
              <span className="stat-bar" style={{ width: `${(pokemon.stats.speed / 255) * 100}%` }}></span>
              <span className="stat-number">{pokemon.stats.speed}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>IVs (Individual Values)</h3>
          <div className="ivs-grid">
            <div className="iv-item">HP: {pokemon.ivs.hp}/31</div>
            <div className="iv-item">Atk: {pokemon.ivs.attack}/31</div>
            <div className="iv-item">Def: {pokemon.ivs.defense}/31</div>
            <div className="iv-item">SpA: {pokemon.ivs.specialAttack}/31</div>
            <div className="iv-item">SpD: {pokemon.ivs.specialDefense}/31</div>
            <div className="iv-item">Spe: {pokemon.ivs.speed}/31</div>
          </div>
        </div>

        <div className="detail-section">
          <h3>EVs (Effort Values)</h3>
          <div className="evs-grid">
            <div className="ev-item">HP: {pokemon.evs.hp || 0}/255</div>
            <div className="ev-item">Atk: {pokemon.evs.attack || 0}/255</div>
            <div className="ev-item">Def: {pokemon.evs.defense || 0}/255</div>
            <div className="ev-item">SpA: {pokemon.evs.specialAttack || 0}/255</div>
            <div className="ev-item">SpD: {pokemon.evs.specialDefense || 0}/255</div>
            <div className="ev-item">Spe: {pokemon.evs.speed || 0}/255</div>
          </div>
          <div className="ev-total">
            Total: {
              (pokemon.evs.hp || 0) +
              (pokemon.evs.attack || 0) +
              (pokemon.evs.defense || 0) +
              (pokemon.evs.specialAttack || 0) +
              (pokemon.evs.specialDefense || 0) +
              (pokemon.evs.speed || 0)
            }/510
          </div>
        </div>

        <div className="detail-section">
          <h3>Moves</h3>
          <div className="moves-grid">
            {pokemon.moves.map((move, index) => (
              <div key={index} className="move-item">
                <span className="move-id">Move #{move.id}</span>
                <span className="move-pp">PP: {move.pp}</span>
              </div>
            ))}
            {pokemon.moves.length === 0 && <div className="no-moves">No moves</div>}
          </div>
        </div>

        <div className="detail-section">
          <h3>Source & Legality</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Source:</span>
              <span className="value">Generation {pokemon.sourceGeneration} - {pokemon.sourceGame}</span>
            </div>
            <div className="info-item">
              <span className="label">Imported:</span>
              <span className="value">{new Date(pokemon.importDate).toLocaleString()}</span>
            </div>
            <div className="info-item full-width">
              <span className="label">Status:</span>
              <span className={`value ${pokemon.isLegal ? 'legal' : 'illegal'}`}>
                {pokemon.isLegal ? '✓ Legal' : '⚠️ Needs Review'}
              </span>
            </div>
          </div>

          {pokemon.legalityNotes.length > 0 && (
            <div className="legality-notes">
              <h4>Notes:</h4>
              <ul>
                {pokemon.legalityNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
