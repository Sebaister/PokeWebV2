import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PokemonCard from '../components/pokemon/PokemonCard'
import { getPokemonList } from '../services/pokeApi'
import { ProcessedPokemon } from '../types/pokemon'

export default function HomePage() {
  const [pokemonList, setPokemonList] = useState<ProcessedPokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true)
        const offset = (page - 1) * limit
        const response = await getPokemonList(limit, offset)
        
        // Obtener detalles de cada Pokémon
        const pokemonDetails = await Promise.all(
          response.results.map(async (pokemon) => {
            const id = pokemon.url.split('/').filter(Boolean).pop() || '0'
            return await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
          })
        )
        
        // Procesar los datos
        const processedPokemon = pokemonDetails.map(pokemon => ({
          id: pokemon.id,
          name: pokemon.name,
          image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
          types: pokemon.types.map((type: any) => type.type.name),
          stats: pokemon.stats.map((stat: any) => ({
            name: stat.stat.name,
            value: stat.base_stat
          })),
          abilities: pokemon.abilities.map((ability: any) => ({
            name: ability.ability.name,
            isHidden: ability.is_hidden
          })),
          height: pokemon.height / 10,
          weight: pokemon.weight / 10,
          description: '',
          evolutionChain: [],
          generation: '',
          habitat: '',
          isLegendary: false,
          isMythical: false,
          color: ''
        }))
        
        setPokemonList(processedPokemon)
        setError(null)
      } catch (err) {
        console.error('Error cargando la lista de Pokémon:', err)
        setError('No se pudo cargar la lista de Pokémon. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    
    loadPokemon()
  }, [page])

  const filteredPokemon = pokemonList.filter(pokemon => 
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.id.toString().includes(searchTerm)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Pokédex
      </motion.h1>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar Pokémon por nombre o número..."
            className="w-full p-3 pl-10 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pokeblue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i className="fas fa-search"></i>
          </div>
        </div>
      </div>
      
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPokemon.map(pokemon => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
          
          {!searchTerm && (
            <div className="flex justify-center mt-8 gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-primary"
              >
                <i className="fas fa-chevron-left mr-2"></i>
                Anterior
              </button>
              <span className="flex items-center px-4">
                Página {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="btn btn-primary"
              >
                Siguiente
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}