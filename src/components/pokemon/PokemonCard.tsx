import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProcessedPokemon, TYPE_COLORS } from '../../types/pokemon';

interface PokemonCardProps {
  pokemon: ProcessedPokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="card bg-base-100 shadow-xl overflow-hidden"
    >
      <Link to={`/pokemon/${pokemon.id}`} className="block">
        <figure className="pt-6 px-6 pb-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            src={pokemon.image}
            alt={pokemon.name}
            className="w-32 h-32 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </figure>
        <div className="card-body p-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            #{pokemon.id.toString().padStart(3, '0')}
          </span>
          <h2 className="card-title text-lg capitalize">
            {pokemon.name.replace(/-/g, ' ')}
          </h2>
          <div className="flex gap-2 mt-1">
            {pokemon.types.map(type => (
              <span
                key={type}
                className="badge text-white px-2 py-1 capitalize text-xs"
                style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}