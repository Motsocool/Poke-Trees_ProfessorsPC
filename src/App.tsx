import { useState } from 'react';
import SaveImport from './components/SaveImport';
import VaultView from './components/VaultView';
import PokemonDetail from './components/PokemonDetail';
import { StoredPokemon } from './lib/db/vaultDb';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<StoredPokemon | null>(null);
  const [vaultKey, setVaultKey] = useState(0); // Key to force re-render of VaultView

  const handleImportComplete = () => {
    // Refresh vault view
    setVaultKey(prev => prev + 1);
  };

  const handlePokemonDeleted = () => {
    setSelectedPokemon(null);
    setVaultKey(prev => prev + 1);
  };

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
            Import and manage Pokémon from Gen 3 save files (Ruby/Sapphire/Emerald/FireRed/LeafGreen)
          </p>
        </div>
      </header>

      <main className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <SaveImport onImportComplete={handleImportComplete} />
          
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
