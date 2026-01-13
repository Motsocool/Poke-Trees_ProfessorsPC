import { useState, useEffect } from 'react';
import SaveImport from './components/SaveImport';
import VaultView from './components/VaultView';
import PokemonDetail from './components/PokemonDetail';
import { ExportSave } from './components/ExportSave';
import { StoredPokemon, getAllPokemon } from './lib/db/vaultDb';

type Tab = 'import' | 'vault' | 'export';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('import');
  const [selectedPokemon, setSelectedPokemon] = useState<StoredPokemon | null>(null);
  const [vaultKey, setVaultKey] = useState(0);
  const [vaultPokemon, setVaultPokemon] = useState<StoredPokemon[]>([]);

  const handleImportComplete = () => {
    setVaultKey(prev => prev + 1);
    setActiveTab('vault');
  };

  const handlePokemonDeleted = () => {
    setSelectedPokemon(null);
    setVaultKey(prev => prev + 1);
  };

  // Load vault Pokémon for export tab
  useEffect(() => {
    if (activeTab === 'export') {
      getAllPokemon().then(setVaultPokemon).catch(console.error);
    }
  }, [activeTab, vaultKey]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
            🎮 Pokémon Tree's: Professor's PC
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Import, manage, and inject Pokémon from Gen 3 save files
          </p>
        </div>
      </header>

      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '30px',
        padding: '0 20px'
      }}>
        <button
          onClick={() => setActiveTab('import')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'import' ? '#667eea' : 'rgba(255, 255, 255, 0.9)',
            color: activeTab === 'import' ? '#fff' : '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          📁 Import
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'vault' ? '#667eea' : 'rgba(255, 255, 255, 0.9)',
            color: activeTab === 'vault' ? '#fff' : '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          💾 Vault
        </button>
        <button
          onClick={() => setActiveTab('export')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'export' ? '#667eea' : 'rgba(255, 255, 255, 0.9)',
            color: activeTab === 'export' ? '#fff' : '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          💉 Inject
        </button>
      </nav>

      <main className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {activeTab === 'import' && (
            <SaveImport onImportComplete={handleImportComplete} />
          )}
          
          {activeTab === 'vault' && (
            <div style={{ display: 'grid', gridTemplateColumns: selectedPokemon ? '2fr 1fr' : '1fr', gap: '20px' }}>
              <VaultView
                key={vaultKey}
                onSelectPokemon={setSelectedPokemon}
                selectedPokemon={selectedPokemon}
              />
              
              {selectedPokemon && (
                <PokemonDetail
                  pokemon={selectedPokemon}
                  onClose={() => setSelectedPokemon(null)}
                  onDelete={handlePokemonDeleted}
                />
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <ExportSave vaultPokemon={vaultPokemon} />
          )}
        </div>
      </main>

      <footer style={{
        marginTop: '60px',
        padding: '20px 0',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px'
      }}>
        <p>Offline-first PWA • All data stored locally in your browser</p>
      </footer>
    </div>
  );
}

export default App;
