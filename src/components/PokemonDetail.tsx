import { StoredPokemon, deletePokemon, deserializePk3FromStorage } from '../lib/db/vaultDb';
import { getSpeciesName } from '../lib/species/speciesTranscode';
import { decryptAndUnshufflePk3, verifyPk3Checksum } from '../lib/gen3/pk3/pk3';
import { parseGrowth, parseAttacks, parseEVs, parseMisc, extractIVs } from '../lib/gen3/pk3/substruct';

interface PokemonDetailProps {
  pokemon: StoredPokemon;
  onClose: () => void;
  onDelete: () => void;
}

export default function PokemonDetail({ pokemon, onClose, onDelete }: PokemonDetailProps) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${pokemon.nickname} from the vault?`)) {
      return;
    }

    try {
      if (pokemon.id !== undefined) {
        await deletePokemon(pokemon.id);
        onDelete();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete Pokémon');
    }
  };

  // Parse detailed data
  let details = null;
  try {
    const pk3 = deserializePk3FromStorage(pokemon.pk3Data);
    const substructs = decryptAndUnshufflePk3(pk3);
    const growth = parseGrowth(substructs.growth);
    const attacks = parseAttacks(substructs.attacks);
    const evs = parseEVs(substructs.evs);
    const misc = parseMisc(substructs.misc);
    const ivData = extractIVs(misc.ivs);
    const checksumValid = verifyPk3Checksum(pk3);

    details = {
      pk3,
      growth,
      attacks,
      evs,
      misc,
      ivData,
      checksumValid,
    };
  } catch (err) {
    console.error('Failed to parse Pokémon details:', err);
  }

  return (
    <div className="card" style={{ position: 'sticky', top: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Pokémon Details</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
          ×
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {pokemon.nickname}
            </div>
            <div style={{ color: '#666', fontSize: '16px' }}>
              {getSpeciesName(pokemon.species)} (#{pokemon.species})
            </div>
          </div>
          <div style={{
            background: pokemon.isValid ? '#c6f6d5' : '#fed7d7',
            color: pokemon.isValid ? '#22543d' : '#c53030',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
            Lv.{pokemon.level}
          </div>
        </div>

        {!pokemon.isValid && (
          <div className="error" style={{ marginBottom: '12px' }}>
            ⚠️ Warning: This Pokémon has an invalid checksum
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <DetailRow label="OT Name" value={pokemon.otName} />
        <DetailRow label="TID" value={pokemon.tid.toString()} />
        <DetailRow label="SID" value={pokemon.sid.toString()} />
        <DetailRow label="PID" value={`0x${pokemon.personality.toString(16).toUpperCase().padStart(8, '0')}`} />

        {details && (
          <>
            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            
            <DetailRow label="Experience" value={details.growth.experience.toLocaleString()} />
            <DetailRow label="Friendship" value={details.growth.friendship.toString()} />
            
            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Moves</div>
            {[
              { move: details.attacks.move1, pp: details.attacks.pp1 },
              { move: details.attacks.move2, pp: details.attacks.pp2 },
              { move: details.attacks.move3, pp: details.attacks.pp3 },
              { move: details.attacks.move4, pp: details.attacks.pp4 },
            ].filter(m => m.move > 0).map((m, i) => (
              <DetailRow key={i} label={`Move ${i + 1}`} value={`#${m.move} (PP: ${m.pp})`} />
            ))}

            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>IVs</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '14px' }}>
              <div>HP: {details.ivData.hp}</div>
              <div>Atk: {details.ivData.attack}</div>
              <div>Def: {details.ivData.defense}</div>
              <div>SpA: {details.ivData.spAtk}</div>
              <div>SpD: {details.ivData.spDef}</div>
              <div>Spe: {details.ivData.speed}</div>
            </div>

            <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>EVs</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '14px' }}>
              <div>HP: {details.evs.hp}</div>
              <div>Atk: {details.evs.attack}</div>
              <div>Def: {details.evs.defense}</div>
              <div>SpA: {details.evs.spAtk}</div>
              <div>SpD: {details.evs.spDef}</div>
              <div>Spe: {details.evs.speed}</div>
            </div>
          </>
        )}

        <div style={{ borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />
        <DetailRow
          label="Imported"
          value={new Date(pokemon.importedAt).toLocaleString()}
        />
      </div>

      <button
        className="btn-danger"
        onClick={handleDelete}
        style={{ width: '100%', marginTop: '20px' }}
      >
        Delete from Vault
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ color: '#666', fontWeight: 500 }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
