// Clase para manejar las peticiones a la PokeAPI
class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
    }

    // Método para obtener datos de un Pokémon por nombre o ID
    async getPokemon(nameOrId) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon/${nameOrId.toString().toLowerCase()}`);
            if (!response.ok) {
                throw new Error(`Error al obtener Pokémon: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getPokemon:', error);
            throw error;
        }
    }

    // Método para obtener la descripción y otros detalles de la especie
    async getPokemonSpecies(nameOrId) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon-species/${nameOrId.toString().toLowerCase()}`);
            if (!response.ok) {
                throw new Error(`Error al obtener especie: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getPokemonSpecies:', error);
            throw error;
        }
    }

    // Método para obtener la cadena de evolución
    async getEvolutionChain(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al obtener evolución: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getEvolutionChain:', error);
            throw error;
        }
    }

    // Método para obtener una lista de Pokémon (paginada)
    async getPokemonList(limit = 20, offset = 0) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
            if (!response.ok) {
                throw new Error(`Error al obtener lista: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getPokemonList:', error);
            throw error;
        }
    }
}

// Exportar una instancia de la clase
const pokeApi = new PokeAPI();