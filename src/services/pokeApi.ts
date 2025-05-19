import { ProcessedPokemon, ProcessedEvolution } from '../types/pokemon';

// Función para obtener la lista de Pokémon
export async function getPokemonList(limit = 20, offset = 0) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  return await response.json();
}

// Función para obtener detalles completos de un Pokémon
export async function getPokemonDetails(idOrName: string | number): Promise<ProcessedPokemon> {
  try {
    // Obtener datos básicos del Pokémon
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    const pokemon = await pokemonResponse.json();
    
    // Obtener datos de la especie para descripción, hábitat, etc.
    const speciesResponse = await fetch(pokemon.species.url);
    const species = await speciesResponse.json();
    
    // Obtener descripción en español
    const description = species.flavor_text_entries
      .find((entry: any) => entry.language.name === 'es')?.flavor_text
      || species.flavor_text_entries
      .find((entry: any) => entry.language.name === 'en')?.flavor_text
      || '';
    
    // Obtener cadena evolutiva
    const evolutionResponse = await fetch(species.evolution_chain.url);
    const evolutionData = await evolutionResponse.json();
    
    // Procesar cadena evolutiva
    const evolutionChain = await processEvolutionChain(evolutionData.chain);
    
    // Construir objeto Pokémon procesado
    return {
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
        isHidden: ability.is_hidden,
        description: '' // Se llenará con una función adicional si es necesario
      })),
      height: pokemon.height / 10, // Convertir a metros
      weight: pokemon.weight / 10, // Convertir a kilogramos
      description: description.replace(/\f/g, ' '),
      evolutionChain,
      generation: species.generation.name,
      habitat: species.habitat?.name || '',
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
      color: species.color.name,
      baseExperience: pokemon.base_experience,
      moves: pokemon.moves.slice(0, 20).map((move: any) => ({
        name: move.move.name,
        url: move.move.url
      })),
      // Añadir más información según necesites
      eggGroups: species.egg_groups.map((group: any) => group.name),
      genderRate: species.gender_rate,
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      growthRate: species.growth_rate.name
    };
  } catch (error) {
    console.error('Error obteniendo detalles del Pokémon:', error);
    throw error;
  }
}

// Función para procesar la cadena evolutiva
async function processEvolutionChain(chain: any): Promise<ProcessedEvolution[]> {
  const evolutions: ProcessedEvolution[] = [];
  
  // Procesar el Pokémon base
  const basePokemon = await getBasicPokemonInfo(chain.species.name);
  evolutions.push(basePokemon);
  
  // Procesar evoluciones recursivamente
  if (chain.evolves_to && chain.evolves_to.length > 0) {
    await processEvolutionLevel(chain.evolves_to, evolutions);
  }
  
  return evolutions;
}

// Función auxiliar para procesar niveles de evolución
async function processEvolutionLevel(evolvesTo: any[], evolutions: ProcessedEvolution[]) {
  for (const evolution of evolvesTo) {
    const evolutionDetails = evolution.evolution_details[0];
    
    const pokemonInfo = await getBasicPokemonInfo(evolution.species.name);
    
    // Añadir detalles de evolución
    pokemonInfo.minLevel = evolutionDetails.min_level || null;
    pokemonInfo.trigger = evolutionDetails.trigger?.name || null;
    pokemonInfo.item = evolutionDetails.item?.name || null;
    
    evolutions.push(pokemonInfo);
    
    // Procesar siguiente nivel de evolución si existe
    if (evolution.evolves_to && evolution.evolves_to.length > 0) {
      await processEvolutionLevel(evolution.evolves_to, evolutions);
    }
  }
}

// Función para obtener información básica de un Pokémon
async function getBasicPokemonInfo(name: string): Promise<ProcessedEvolution> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await response.json();
    
    return {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
      types: pokemon.types.map((type: any) => type.type.name),
      minLevel: null,
      trigger: null,
      item: null
    };
  } catch (error) {
    console.error(`Error obteniendo información básica de ${name}:`, error);
    throw error;
  }
}

// Función para obtener información de tipos
export async function getTypesList() {
  const response = await fetch('https://pokeapi.co/api/v2/type');
  const data = await response.json();
  return data.results;
}

// Función para obtener detalles de un tipo
export async function getTypeDetails(name: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${name}`);
  return await response.json();
}

// Función para obtener lista de habilidades
export async function getAbilitiesList(limit = 20, offset = 0) {
  const response = await fetch(`https://pokeapi.co/api/v2/ability?limit=${limit}&offset=${offset}`);
  return await response.json();
}

// Función para obtener detalles de una habilidad
export async function getAbilityDetails(name: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/ability/${name}`);
  const data = await response.json();
  
  // Obtener descripción en español
  const description = data.flavor_text_entries
    .find((entry: any) => entry.language.name === 'es')?.flavor_text
    || data.flavor_text_entries
    .find((entry: any) => entry.language.name === 'en')?.flavor_text
    || '';
  
  return {
    id: data.id,
    name: data.name,
    description: description.replace(/\f/g, ' '),
    pokemon: data.pokemon.map((p: any) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
      isHidden: p.is_hidden
    }))
  };
}

// Función para obtener lista de movimientos
export async function getMovesList(limit = 20, offset = 0) {
  const response = await fetch(`https://pokeapi.co/api/v2/move?limit=${limit}&offset=${offset}`);
  return await response.json();
}

// Función para obtener detalles de un movimiento
export async function getMoveDetails(name: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
  const data = await response.json();
  
  // Obtener descripción en español
  const description = data.flavor_text_entries
    .find((entry: any) => entry.language.name === 'es')?.flavor_text
    || data.flavor_text_entries
    .find((entry: any) => entry.language.name === 'en')?.flavor_text
    || '';
  
  return {
    id: data.id,
    name: data.name,
    description: description.replace(/\f/g, ' '),
    type: data.type.name,
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp,
    damageClass: data.damage_class.name,
    target: data.target.name,
    effectChance: data.effect_chance
  };
}