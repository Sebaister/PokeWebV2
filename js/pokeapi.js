class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
    }

    async fetchPokemon(idOrName) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon/${idOrName.toString().toLowerCase()}`);
            if (!response.ok) throw new Error('Pokémon no encontrado');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener datos del Pokémon:', error);
            throw error;
        }
    }

    async fetchPokemonSpecies(idOrName) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon-species/${idOrName.toString().toLowerCase()}`);
            if (!response.ok) throw new Error('Especie de Pokémon no encontrada');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener datos de la especie:', error);
            throw error;
        }
    }

    async fetchEvolutionChain(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Cadena de evolución no encontrada');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener cadena de evolución:', error);
            throw error;
        }
    }

    async getPokemonDetails(idOrName) {
        try {
            // Obtener datos básicos del Pokémon
            const pokemon = await this.fetchPokemon(idOrName);
            
            // Obtener datos de la especie
            const species = await this.fetchPokemonSpecies(pokemon.id);
            
            // Obtener descripción en español
            const description = species.flavor_text_entries
                .find(entry => entry.language.name === 'es')?.flavor_text || 
                species.flavor_text_entries[0]?.flavor_text || 
                'No hay descripción disponible';
            
            // Obtener cadena de evolución
            let evolutionChain = null;
            if (species.evolution_chain) {
                evolutionChain = await this.fetchEvolutionChain(species.evolution_chain.url);
            }
            
            return {
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
                types: pokemon.types.map(type => type.type.name),
                stats: pokemon.stats.map(stat => ({
                    name: stat.stat.name,
                    value: stat.base_stat
                })),
                height: pokemon.height / 10, // Convertir a metros
                weight: pokemon.weight / 10, // Convertir a kilogramos
                abilities: pokemon.abilities.map(ability => ({
                    name: ability.ability.name,
                    isHidden: ability.is_hidden
                })),
                moves: pokemon.moves.slice(0, 20).map(move => move.move.name),
                description: description.replace(/\f/g, ' '),
                evolutionChain: evolutionChain
            };
        } catch (error) {
            console.error('Error al obtener detalles completos:', error);
            throw error;
        }
    }

    async getAllPokemon(limit = 151, offset = 0) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
            if (!response.ok) throw new Error('No se pudieron obtener los Pokémon');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener lista de Pokémon:', error);
            throw error;
        }
    }
}