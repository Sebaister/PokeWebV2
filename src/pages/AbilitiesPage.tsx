import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAbilitiesList, getAbilityDetails } from '../services/pokeApi';
import { ProcessedAbility } from '../types/pokemon';

export default function AbilitiesPage() {
  const [abilities, setAbilities] = useState<{name: string, url: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAbility, setSelectedAbility] = useState<ProcessedAbility | null>(null);
  const [loadingAbility, setLoadingAbility] = useState(false);
  const limit = 20;

  useEffect(() => {
    async function loadAbilities() {
      try {
        setLoading(true);
        const offset = (page - 1) * limit;
        const response = await getAbilitiesList(limit, offset);
        setAbilities(response.results);
        setError(null);
      } catch (err) {
        console.error('Error cargando la lista de habilidades:', err);
        setError('No se pudo cargar la lista de habilidades. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    
    loadAbilities();
  }, [page]);

  const handleAbilityClick = async (name: string) => {
    try {
      setLoadingAbility(true);
      const abilityDetails = await getAbilityDetails(name);
      setSelectedAbility(abilityDetails);
    } catch (err) {
      console.error('Error cargando detalles de la habilidad:', err);
    } finally {
      setLoadingAbility(false);
    }
  };

  const filteredAbilities = abilities.filter(ability => 
    ability.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Habilidades Pokémon
      </motion.h1>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar habilidad..."
            className="w-full p-3 pl-10 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pokeblue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i className="fas fa-search"></i>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de habilidades */}
        <div className="md:col-span-1 bg-base-100 shadow-xl rounded-lg p-4">
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Lista de Habilidades</h2>
              <ul className="menu bg-base-200 rounded-box">
                {filteredAbilities.map((ability) => (
                  <li key={ability.name}>
                    <button 
                      className="capitalize"
                      onClick={() => handleAbilityClick(ability.name)}
                    >
                      {ability.name.replace(/-/g, ' ')}
                    </button>
                  </li>
                ))}
              </ul>
              
              {!searchTerm && (
                <div className="flex justify-center mt-8 gap-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Anterior
                  </button>
                  <span className="flex items-center px-4">
                    Página {page}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-primary btn-sm"
                  >
                    Siguiente
                    <i className="fas fa-chevron-right ml-2"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Detalles de la habilidad */}
        <div className="md:col-span-2 bg-base-100 shadow-xl rounded-lg p-4">
          {loadingAbility ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : selectedAbility ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {selectedAbility.name.replace(/-/g, ' ')}
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedAbility.description || "No hay descripción disponible."}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Pokémon con esta habilidad</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedAbility.pokemon.slice(0, 12).map((pokemon) => {
                    const pokemonId = pokemon.url.split('/').filter(Boolean).pop();
                    return (
                      <Link 
                        key={pokemon.name} 
                        to={`/pokemon/${pokemonId}`}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                          alt={pokemon.name}
                          className="w-16 h-16 object-contain"
                          loading="lazy"
                        />
                        <span className="text-center capitalize text-xs mt-1">
                          {pokemon.name.replace(/-/g, ' ')}
                          {pokemon.isHidden && <span className="text-gray-500 text-xs"> (Oculta)</span>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                {selectedAbility.pokemon.length > 12 && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-500">
                      Y {selectedAbility.pokemon.length - 12} más...
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
              <i className="fas fa-info-circle text-4xl mb-4"></i>
              <p>Selecciona una habilidad para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}