import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPokemonTypes, getTypeEffectiveness } from '../services/pokeApi'
import { TYPE_COLORS } from '../types/pokemon'

export default function TypesPage() {
  const [types, setTypes] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [typeEffectiveness, setTypeEffectiveness] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTypes() {
      try {
        setLoading(true)
        const typesData = await getPokemonTypes()
        setTypes(typesData)
        setError(null)
      } catch (err) {
        console.error('Error cargando tipos:', err)
        setError('No se pudieron cargar los tipos de Pokémon. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    
    loadTypes()
  }, [])

  useEffect(() => {
    async function loadTypeEffectiveness() {
      if (!selectedType) return
      
      try {
        setLoading(true)
        const effectiveness = await getTypeEffectiveness(selectedType)
        setTypeEffectiveness(effectiveness)
        setError(null)
      } catch (err) {
        console.error('Error cargando efectividad de tipos:', err)
        setError('No se pudo cargar la información de efectividad. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    
    loadTypeEffectiveness()
  }, [selectedType])

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Tabla de Tipos
      </motion.h1>
      
      <p className="text-center mb-6">
        Selecciona un tipo para ver sus fortalezas y debilidades
      </p>
      
      {loading && !selectedType ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      ) : error && !selectedType ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {types.map(type => (
            <motion.button
              key={type.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-lg text-white font-medium capitalize text-center"
              style={{ 
                backgroundColor: TYPE_COLORS[type.name as keyof typeof TYPE_COLORS],
                opacity: selectedType && selectedType !== type.name ? 0.6 : 1
              }}
              onClick={() => setSelectedType(type.name)}
            >
              {type.name}
            </motion.button>
          ))}
        </div>
      )}
      
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title capitalize">
              Efectividad del tipo {selectedType}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="loading loading-spinner loading-md text-primary"></div>
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            ) : typeEffectiveness && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="font-bold mb-2">Ataque</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Súper efectivo contra:</h4>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.doubleDamageTo.length > 0 ? (
                        typeEffectiveness.doubleDamageTo.map((type: string) => (
                          <span
                            key={type}
                            className="badge text-white px-2 py-1 capitalize text-xs"
                            style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Poco efectivo contra:</h4>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.halfDamageTo.length > 0 ? (
                        typeEffectiveness.halfDamageTo.map((type: string) => (
                          <span
                            key={type}
                            className="badge text-white px-2 py-1 capitalize text-xs"
                            style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Sin efecto contra:</h4>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.noDamageTo.length > 0 ? (
                        typeEffectiveness.noDamageTo.map((type: string) => (
                          <span
                            key={type}
                            className="badge text-white px-2 py-1 capitalize text-xs"
                            style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2">Defensa</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Débil contra:</h4>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.doubleDamageFrom.length > 0 ? (
                        typeEffectiveness.doubleDamageFrom.map((type: string) => (
                          <span
                            key={type}
                            className="badge text-white px-2 py-1 capitalize text-xs"
                            style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Resistente contra:</h4>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.halfDamageFrom.length > 0 ? (
                        typeEffectiveness.halfDamageFrom.map((type: string) => (
                          <span
                            key={type}
                            className="badge text-white px-2 py-1 capitalize text-xs"
                            style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Inmune contra:</h4>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.noDamageFrom.length > 0 ? (
                        typeEffectiveness.noDamageFrom.map((type: string) => (
                          <span
                            key={type}
                            className="badge text-white px-2 py-1 capitalize text-xs"
                            style={{ backgroundColor: TYPE_COLORS[type as keyof typeof TYPE_COLORS] }}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}