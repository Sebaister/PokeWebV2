import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProcessedEvolution } from '../../types/pokemon';

interface PokemonEvolutionProps {
  evolutions: ProcessedEvolution[];
}

export default function PokemonEvolution({ evolutions }: PokemonEvolutionProps) {
  const [evolutionChain, setEvolutionChain] = useState<ProcessedEvolution[][]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  const handleImageLoad = (id: number) => {
    setImagesLoaded(prev => ({...prev, [id]: true}));
  };

  useEffect(() => {
    // Organizar las evoluciones en etapas
    const organizeEvolutions = () => {
      const stages: ProcessedEvolution[][] = [];
      let currentStage = 0;
      
      // La primera evolución siempre es la forma base
      if (evolutions.length > 0) {
        stages[0] = [evolutions[0]];
        
        // Organizar el resto de evoluciones
        for (let i = 1; i < evolutions.length; i++) {
          const evolution = evolutions[i];
          
          // Si tiene nivel mínimo o trigger, es una nueva etapa
          if (evolution.minLevel || evolution.trigger) {
            currentStage++;
          }
          
          // Asegurarse de que el array para esta etapa existe
          if (!stages[currentStage]) {
            stages[currentStage] = [];
          }
          
          stages[currentStage].push(evolution);
        }
      }
      
      return stages;
    };
    
    setEvolutionChain(organizeEvolutions());
  }, [evolutions]);

  // Función para mostrar los detalles de evolución
  const getEvolutionDetails = (evolution: ProcessedEvolution) => {
    if (evolution.minLevel) {
      return `Nivel ${evolution.minLevel}`;
    } else if (evolution.trigger === 'level-up' && evolution.item) {
      return `Usar ${evolution.item.replace(/-/g, ' ')}`;
    } else if (evolution.trigger === 'trade' && evolution.item) {
      return `Intercambio con ${evolution.item.replace(/-/g, ' ')}`;
    } else if (evolution.trigger === 'trade') {
      return 'Intercambio';
    } else if (evolution.trigger === 'use-item' && evolution.item) {
      return `Usar ${evolution.item.replace(/-/g, ' ')}`;
    } else if (evolution.trigger) {
      return evolution.trigger.replace(/-/g, ' ');
    }
    return '';
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Cadena Evolutiva</h2>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
          {evolutionChain.map((stage, stageIndex) => (
            <div key={`stage-${stageIndex}`} className="flex flex-wrap justify-center items-center">
              {/* Pokémon de esta etapa */}
              <div className="flex flex-wrap justify-center gap-2">
                {stage.map((pokemon) => (
                  <Link 
                    key={pokemon.id} 
                    to={`/pokemon/${pokemon.id}`}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-24 h-24 flex items-center justify-center relative"
                    >
                      {!imagesLoaded[pokemon.id] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="loading loading-spinner loading-sm"></div>
                        </div>
                      )}
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                        alt={pokemon.name}
                        className={`max-w-full max-h-full object-contain ${!imagesLoaded[pokemon.id] ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(pokemon.id)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                          handleImageLoad(pokemon.id);
                        }}
                      />
                    </motion.div>
                    <span className="text-center capitalize mt-1 text-sm">
                      {pokemon.name.replace(/-/g, ' ')}
                    </span>
                  </Link>
                ))}
              </div>
              
              {/* Flecha de evolución si no es la última etapa */}
              {stageIndex < evolutionChain.length - 1 && (
                <div className="flex flex-col items-center mx-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl mb-1"
                  >
                    →
                  </motion.div>
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-[100px]">
                    {evolutionChain[stageIndex + 1][0] && 
                      getEvolutionDetails(evolutionChain[stageIndex + 1][0])}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}