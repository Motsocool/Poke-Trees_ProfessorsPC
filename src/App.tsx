import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { VaultDisplay } from './components/VaultDisplay';
import { PokemonDetail } from './components/PokemonDetail';
import type { VaultPokemon } from './lib/types';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState<VaultPokemon | null>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'vault' | 'export'>('import');

  const handleImportComplete = (_count: number) => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('vault');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 Pokémon Tree's: Professor's PC</h1>
        <p className="app-subtitle">Import, Legalize & Inject Pokémon across Gen 1-3</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'import' ? 'active' : ''}
          onClick={() => setActiveTab('import')}
        >
          📁 Import
        </button>
        <button
          className={activeTab === 'vault' ? 'active' : ''}
          onClick={() => setActiveTab('vault')}
        >
          💾 Vault
        </button>
        <button
          className={activeTab === 'export' ? 'active' : ''}
          onClick={() => setActiveTab('export')}
        >
          💉 Export
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'import' && (
          <FileUpload onImportComplete={handleImportComplete} />
        )}

        {activeTab === 'vault' && (
          <VaultDisplay
            refreshTrigger={refreshTrigger}
            onSelectPokemon={setSelectedPokemon}
          />
        )}

        {activeTab === 'export' && (
          <div className="export-section">
            <h2>Export to Gen 3 Save File</h2>
            <p>Coming soon: Inject Pokémon back into Gen 3 save files</p>
          </div>
        )}
      </main>

      {selectedPokemon && (
        <PokemonDetail
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      <footer className="app-footer">
        <p>Offline-first PWA • All data stored locally in your browser</p>
        <p className="credits">
          Based on <a href="https://github.com/pret/pokered" target="_blank">pokered</a>,{' '}
          <a href="https://github.com/pret/pokecrystal" target="_blank">pokecrystal</a>,{' '}
          <a href="https://github.com/pret/pokeemerald" target="_blank">pokeemerald</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
