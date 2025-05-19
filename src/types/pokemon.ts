export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
      home: {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
  }[];
  height: number;
  weight: number;
  species: {
    url: string;
  };
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
  generation: {
    name: string;
  };
  habitat: {
    name: string;
  } | null;
  is_legendary: boolean;
  is_mythical: boolean;
  color: {
    name: string;
  };
}

export interface EvolutionChain {
  chain: EvolutionNode;
}

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };
  evolution_details: {
    min_level: number | null;
    trigger: {
      name: string;
    } | null;
    item: {
      name: string;
    } | null;
  }[];
  evolves_to: EvolutionNode[];
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

// Tipos para Pokémon procesado
export interface ProcessedPokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats: {
    name: string;
    value: number;
  }[];
  abilities: {
    name: string;
    isHidden: boolean;
    description?: string;
  }[];
  height: number;
  weight: number;
  description: string;
  evolutionChain: ProcessedEvolution[];
  generation: string;
  habitat: string;
  isLegendary: boolean;
  isMythical: boolean;
  color: string;
  baseExperience?: number;
  moves?: {
    name: string;
    url: string;
  }[];
  eggGroups?: string[];
  genderRate?: number;
  captureRate?: number;
  baseHappiness?: number;
  growthRate?: string;
}

// Tipos para evolución procesada
export interface ProcessedEvolution {
  id: number;
  name: string;
  image: string;
  types: string[];
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

// Tipos para habilidad procesada
export interface ProcessedAbility {
  id: number;
  name: string;
  description: string;
  pokemon: {
    name: string;
    url: string;
    isHidden: boolean;
  }[];
}

// Tipos para movimiento procesado
export interface ProcessedMove {
  id: number;
  name: string;
  description: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: string;
  target: string;
  effectChance: number | null;
}

// Tipos para tipo de Pokémon procesado
export interface ProcessedType {
  id: number;
  name: string;
  damageRelations: {
    doubleDamageFrom: string[];
    doubleDamageTo: string[];
    halfDamageFrom: string[];
    halfDamageTo: string[];
    noDamageFrom: string[];
    noDamageTo: string[];
  };
  pokemon: {
    name: string;
    url: string;
  }[];
}

// Colores para los tipos de Pokémon
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};