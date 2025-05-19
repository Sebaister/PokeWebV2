import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProcessedPokemon, TYPE_COLORS } from '../../types/pokemon';
import { getPokemonDetails } from '../../services/pokeApi';
import PokemonStats from './PokemonStats';
import PokemonEvolution from './PokemonEvolution';
import PokemonAbilities from './PokemonAbilities';

interface PokemonDetailProps {
  pokemonId: string;
}

export default function PokemonDetail({ pokemonId }: PokemonDetailProps) {
  const [pokemon, setPokemon] = useState<ProcessedPokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);
        const data = await getPokemonDetails(pokemonId);
        setPokemon(data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el Pokémon. Intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, [pokemonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="alert alert-error">
        <span>{error || 'Ocurrió un error inesperado'}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda - Imagen y datos básicos */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="card bg-base-100 shadow-xl overflow-hidden"
          >
            <figure className="pt-8 px-8 pb-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 h-64 flex items-center justify-center">
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 2
                }}
                src={pokemon.image}
                alt={pokemon.name}
                className="w-48 h-48 object-contain drop-shadow-xl"
              />
            </figure>
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h1 className="card-title text-2xl capitalize">
                  {pokemon.name.replace(/-/g, ' ')}
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  #{pokemon.id.toString().padStart(3, '0')}
                </span>
              </div>
              
              <div className="flex gap-2 mt-2">
                {pokemon.types.map(type => (
                  <span
                    key={type}
                    className="badge text-white px-3 py-2 capitalize"
                    style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                  >
                    {type}
                  </span>
                ))}
              </div>
              
              <div className="divider"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="stat p-2">
                  <div className="stat-title text-xs">Altura</div>
                  <div className="stat-value text-lg">{pokemon.height} m</div>
                </div>
                <div className="stat p-2">
                  <div className="stat-title text-xs">Peso</div>
                  <div className="stat-value text-lg">{pokemon.weight} kg</div>
                </div>
                {pokemon.habitat && (
                  <div className="stat p-2">
                    <div className="stat-title text-xs">Hábitat</div>
                    <div className="stat-value text-lg capitalize">{pokemon.habitat}</div>
                  </div>
                )}
                <div className="stat p-2">
                  <div className="stat-title text-xs">Generación</div>
                  <div className="stat-value text-lg capitalize">{pokemon.generation?.replace('generation-', '')}</div>
                </div>
              </div>
              
              {(pokemon.isLegendary || pokemon.isMythical) && (
                <div className="badge badge-accent badge-lg mt-2 w-full justify-center">
                  {pokemon.isLegendary ? 'Legendario' : 'Mítico'}
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Columna derecha - Estadísticas y más información */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h2 className="card-title">Descripción</h2>
              <p className="text-gray-700 dark:text-gray-300">{pokemon.description}</p>
            </div>
          </motion.div>
          
          {/* Estadísticas */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PokemonStats stats={pokemon.stats} />
          </motion.div>
          
          {/* Habilidades */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <PokemonAbilities abilities={pokemon.abilities} />
          </motion.div>
          
          {/* Cadena evolutiva */}
          {pokemon.evolutionChain && pokemon.evolutionChain.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <PokemonEvolution evolutions={pokemon.evolutionChain} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}