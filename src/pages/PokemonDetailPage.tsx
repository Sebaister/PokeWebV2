import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPokemon, getEvolutionChain } from '../services/pokeApi';
import { Pokemon, ProcessedEvolution } from '../types/pokemon';
import PokemonStats from '../components/pokemon/PokemonStats';
import PokemonAbilities from '../components/pokemon/PokemonAbilities';
import PokemonEvolution from '../components/pokemon/PokemonEvolution';
import { TYPE_COLORS } from '../types/pokemon';

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [evolutions, setEvolutions] = useState<ProcessedEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPokemon() {
      if (!id) return;
      
      try {
        setLoading(true);
        const pokemonData = await getPokemon(id);
        setPokemon(pokemonData);
        
        // Cargar cadena evolutiva
        const evolutionData = await getEvolutionChain(pokemonData.species.url);
        setEvolutions(evolutionData);
        
        setError(null);
      } catch (err) {
        console.error('Error cargando datos del Pokémon:', err);
        setError('No se pudo cargar la información del Pokémon. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    
    loadPokemon();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }
  
  if (error || !pokemon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error || 'No se encontró el Pokémon'}</span>
        </div>
        <Link to="/pokemon" className="btn btn-primary mt-4">
          Volver a la lista
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navegación */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          to={`/pokemon/${pokemon.id - 1}`} 
          className={`btn btn-ghost ${pokemon.id <= 1 ? 'invisible' : ''}`}
        >
          <i className="fas fa-chevron-left mr-2"></i>
          #{String(pokemon.id - 1).padStart(3, '0')}
        </Link>
        
        <Link to="/pokemon" className="btn btn-ghost">
          <i className="fas fa-th mr-2"></i>
          Lista
        </Link>
        
        <Link 
          to={`/pokemon/${pokemon.id + 1}`} 
          className="btn btn-ghost"
        >
          #{String(pokemon.id + 1).padStart(3, '0')}
          <i className="fas fa-chevron-right ml-2"></i>
        </Link>
      </div>
      
      {/* Encabezado del Pokémon */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-xl mb-8"
      >
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-48 h-48 object-contain"
              />
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold capitalize">
                  {pokemon.name.replace(/-/g, ' ')}
                </h1>
                <span className="text-xl text-gray-500">
                  #{String(pokemon.id).padStart(3, '0')}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 my-4">
                {pokemon.types.map(type => (
                  <span
                    key={type.type.name}
                    className="badge text-white px-3 py-2 capitalize"
                    style={{ backgroundColor: TYPE_COLORS[type.type.name as keyof typeof TYPE_COLORS] }}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Altura</div>
                  <div className="stat-value text-lg">{pokemon.height / 10} m</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Peso</div>
                  <div className="stat-value text-lg">{pokemon.weight / 10} kg</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Experiencia Base</div>
                  <div className="stat-value text-lg">{pokemon.base_experience || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Información detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Estadísticas */}
        <PokemonStats stats={pokemon.stats.map(stat => ({
          name: stat.stat.name,
          value: stat.base_stat
        }))} />
        
        {/* Habilidades */}
        <PokemonAbilities abilities={pokemon.abilities.map(ability => ({
          name: ability.ability.name,
          isHidden: ability.is_hidden
        }))} />
      </div>
      
      {/* Cadena evolutiva */}
      <div className="mt-8">
        {evolutions.length > 0 ? (
          <PokemonEvolution evolutions={evolutions} />
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Cadena Evolutiva</h2>
              <p>Este Pokémon no tiene evoluciones conocidas.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Movimientos */}
      <div className="mt-8 card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Movimientos</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Método</th>
                  <th>Nivel</th>
                </tr>
              </thead>
              <tbody>
                {pokemon.moves.slice(0, 20).map((move, index) => (
                  <motion.tr 
                    key={move.move.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="capitalize">
                      <Link to={`/moves/${move.move.name}`} className="hover:text-primary">
                        {move.move.name.replace(/-/g, ' ')}
                      </Link>
                    </td>
                    <td>
                      {move.version_group_details[0]?.move_learn_method.name.replace(/-/g, ' ')}
                    </td>
                    <td>
                      {move.version_group_details[0]?.level_learned_at || 'N/A'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {pokemon.moves.length > 20 && (
            <div className="text-center mt-4">
              <Link to={`/pokemon/${pokemon.id}/moves`} className="btn btn-primary">
                Ver todos los movimientos ({pokemon.moves.length})
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}