import { Pokemon, PokemonSpecies, EvolutionChain, ProcessedPokemon, ProcessedEvolution, PokemonListResponse } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Función para procesar un Pokémon y obtener todos sus datos
export async function getPokemonDetails(idOrName: string | number): Promise<ProcessedPokemon> {
  try {
    // Obtener datos básicos del Pokémon
    const pokemonResponse = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
    const pokemon: Pokemon = await pokemonResponse.json();
    
    // Obtener datos de la especie
    const speciesResponse = await fetch(pokemon.species.url);
    const species: PokemonSpecies = await speciesResponse.json();
    
    // Obtener descripción en español
    const description = species.flavor_text_entries
      .find(entry => entry.language.name === 'es')?.flavor_text
      .replace(/\f/g, ' ') || 
      species.flavor_text_entries
      .find(entry => entry.language.name === 'en')?.flavor_text
      .replace(/\f/g, ' ') || '';
    
    // Obtener cadena evolutiva
    const evolutionChain = await getEvolutionChain(species.evolution_chain.url);
    
    return {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
      types: pokemon.types.map(type => type.type.name),
      stats: pokemon.stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat
      })),
      abilities: pokemon.abilities.map(ability => ({
        name: ability.ability.name,
        isHidden: ability.is_hidden
      })),
      height: pokemon.height / 10, // Convertir a metros
      weight: pokemon.weight / 10, // Convertir a kilogramos
      description,
      evolutionChain,
      generation: species.generation.name,
      habitat: species.habitat?.name,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
      color: species.color.name
    };
  } catch (error) {
    console.error('Error obteniendo detalles del Pokémon:', error);
    throw error;
  }
}

// Función para obtener la cadena evolutiva
async function getEvolutionChain(url: string): Promise<ProcessedEvolution[]> {
  try {
    const response = await fetch(url);
    const data: EvolutionChain = await response.json();
    
    return processEvolutionChain(data.chain);
  } catch (error) {
    console.error('Error obteniendo cadena evolutiva:', error);
    return [];
  }
}

// Función para procesar la cadena evolutiva
function processEvolutionChain(chain: EvolutionNode): ProcessedEvolution[] {
  const evolutions: ProcessedEvolution[] = [];
  
  // Función recursiva para procesar cada nodo de evolución
  function processNode(node: EvolutionNode, evolutions: ProcessedEvolution[]) {
    // Extraer el ID del Pokémon de la URL
    const id = parseInt(node.species.url.split('/').filter(Boolean).pop() || '0');
    
    evolutions.push({
      name: node.species.name,
      id,
      minLevel: node.evolution_details[0]?.min_level || null,
      trigger: node.evolution_details[0]?.trigger?.name || null,
      item: node.evolution_details[0]?.item?.name || null
    });
    
    // Procesar evoluciones siguientes
    node.evolves_to.forEach(evolution => {
      processNode(evolution, evolutions);
    });
  }
  
  processNode(chain, evolutions);
  
  // Obtener imágenes para cada evolución
  return evolutions;
}

// Función para obtener una lista de Pokémon con paginación
export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo lista de Pokémon:', error);
    throw error;
  }
}

// Función para buscar Pokémon por nombre
export async function searchPokemon(query: string): Promise<ProcessedPokemon[]> {
  try {
    // Si es un número, intentar buscar por ID
    if (!isNaN(Number(query))) {
      const pokemon = await getPokemonDetails(query);
      return [pokemon];
    }
    
    // Buscar por nombre
    const response = await fetch(`${BASE_URL}/pokemon?limit=1000`);
    const data: PokemonListResponse = await response.json();
    
    // Filtrar resultados que coincidan con la búsqueda
    const matches = data.results
      .filter(pokemon => pokemon.name.includes(query.toLowerCase()))
      .slice(0, 5); // Limitar a 5 resultados
    
    // Obtener detalles de cada Pokémon encontrado
    const pokemonDetails = await Promise.all(
      matches.map(match => getPokemonDetails(match.name))
    );
    
    return pokemonDetails;
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    return [];
  }
}

// Función para obtener todos los tipos de Pokémon
export async function getPokemonTypes() {
  try {
    const response = await fetch(`${BASE_URL}/type`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error obteniendo tipos:', error);
    throw error;
  }
}

// Función para obtener efectividad de tipos
export async function getTypeEffectiveness(typeName: string) {
  try {
    const response = await fetch(`${BASE_URL}/type/${typeName}`);
    const data = await response.json();
    
    return {
      doubleDamageTo: data.damage_relations.double_damage_to.map((t: any) => t.name),
      halfDamageTo: data.damage_relations.half_damage_to.map((t: any) => t.name),
      noDamageTo: data.damage_relations.no_damage_to.map((t: any) => t.name),
      doubleDamageFrom: data.damage_relations.double_damage_from.map((t: any) => t.name),
      halfDamageFrom: data.damage_relations.half_damage_from.map((t: any) => t.name),
      noDamageFrom: data.damage_relations.no_damage_from.map((t: any) => t.name)
    };
  } catch (error) {
    console.error('Error obteniendo efectividad de tipos:', error);
    throw error;
  }
}