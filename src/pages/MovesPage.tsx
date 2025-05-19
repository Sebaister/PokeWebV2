import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMovesList, getMoveDetails } from '../services/pokeApi';
import { ProcessedMove } from '../types/pokemon';
import { TYPE_COLORS } from '../types/pokemon';

export default function MovesPage() {
  const [moves, setMoves] = useState<{name: string, url: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMove, setSelectedMove] = useState<ProcessedMove | null>(null);
  const [loadingMove, setLoadingMove] = useState(false);
  const limit = 20;

  useEffect(() => {
    async function loadMoves() {
      try {
        setLoading(true);
        const offset = (page - 1) * limit;
        const response = await getMovesList(limit, offset);
        setMoves(response.results);
        setError(null);
      } catch (err) {
        console.error('Error cargando la lista de movimientos:', err);
        setError('No se pudo cargar la lista de movimientos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    
    loadMoves();
  }, [page]);

  const handleMoveClick = async (name: string) => {
    try {
      setLoadingMove(true);
      const moveDetails = await getMoveDetails(name);
      setSelectedMove(moveDetails);
    } catch (err) {
      console.error('Error cargando detalles del movimiento:', err);
    } finally {
      setLoadingMove(false);
    }
  };

  const filteredMoves = moves.filter(move => 
    move.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Movimientos Pokémon
      </motion.h1>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar movimiento..."
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
        {/* Lista de movimientos */}
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
              <h2 className="text-xl font-bold mb-4">Lista de Movimientos</h2>
              <ul className="menu bg-base-200 rounded-box">
                {filteredMoves.map((move) => (
                  <li key={move.name}>
                    <button 
                      className="capitalize"
                      onClick={() => handleMoveClick(move.name)}
                    >
                      {move.name.replace(/-/g, ' ')}
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
        
        {/* Detalles del movimiento */}
        <div className="md:col-span-2 bg-base-100 shadow-xl rounded-lg p-4">
          {loadingMove ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : selectedMove ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold capitalize">
                  {selectedMove.name.replace(/-/g, ' ')}
                </h2>
                <span 
                  className="badge text-white px-3 py-2 capitalize"
                  style={{ backgroundColor: TYPE_COLORS[selectedMove.type as keyof typeof TYPE_COLORS] }}
                >
                  {selectedMove.type}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedMove.description || "No hay descripción disponible."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Potencia</div>
                  <div className="stat-value text-lg">{selectedMove.power || 'N/A'}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Precisión</div>
                  <div className="stat-value text-lg">{selectedMove.accuracy ? `${selectedMove.accuracy}%` : 'N/A'}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">PP</div>
                  <div className="stat-value text-lg">{selectedMove.pp}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap