/**
 * Clase para manejar las llamadas a la PokeAPI
 */
class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
        this.cache = {};
    }

    /**
     * Obtiene datos de la API con caché
     */
    async fetchData(endpoint) {
        if (this.cache[endpoint]) {
            return this.cache[endpoint];
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error de API: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache[endpoint] = data;
            return data;
        } catch (error) {
            console.error('Error al obtener datos:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los tipos de Pokémon
     */
    async getTypes() {
        const data = await this.fetchData('/type');
        return data.results;
    }

    /**
     * Obtiene información detallada de un tipo específico
     */
    async getTypeDetails(typeId) {
        return await this.fetchData(`/type/${typeId}`);
    }

    /**
     * Obtiene información de un Pokémon por nombre o ID
     */
    async getPokemon(nameOrId) {
        try {
            const query = nameOrId.toString().toLowerCase();
            return await this.fetchData(`/pokemon/${query}`);
        } catch (error) {
            console.error(`Pokémon no encontrado: ${nameOrId}`);
            return null;
        }
    }

    /**
     * Obtiene información de la especie de un Pokémon
     */
    async getPokemonSpecies(id) {
        return await this.fetchData(`/pokemon-species/${id}`);
    }
}

// Exportar la instancia para uso global
const pokeApi = new PokeAPI();