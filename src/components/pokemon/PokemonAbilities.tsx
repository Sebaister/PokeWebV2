import { motion } from 'framer-motion';

interface Ability {
  name: string;
  isHidden: boolean;
}

interface PokemonAbilitiesProps {
  abilities: Ability[];
}

export default function PokemonAbilities({ abilities }: PokemonAbilitiesProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Habilidades</h2>
        <ul className="mt-2 space-y-2">
          {abilities.map((ability, index) => (
            <motion.li 
              key={ability.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center"
            >
              <div className="w-2 h-2 bg-pokeblue rounded-full mr-2"></div>
              <span className="capitalize">
                {ability.name.replace(/-/g, ' ')}
                {ability.isHidden && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic">
                    (Oculta)
                  </span>
                )}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}