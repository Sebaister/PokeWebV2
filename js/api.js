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

    /**
     * Obtiene información detallada de una habilidad
     */
    async getAbility(nameOrId) {
        try {
            const query = nameOrId.toString().toLowerCase();
            return await this.fetchData(`/ability/${query}`);
        } catch (error) {
            console.error(`Habilidad no encontrada: ${nameOrId}`);
            return null;
        }
    }

    /**
     * Obtiene información detallada de un movimiento
     */
    async getMove(nameOrId) {
        try {
            const query = nameOrId.toString().toLowerCase();
            return await this.fetchData(`/move/${query}`);
        } catch (error) {
            console.error(`Movimiento no encontrado: ${nameOrId}`);
            return null;
        }
    }

    /**
     * Obtiene una lista de habilidades con paginación
     */
    async getAbilities(limit = 20, offset = 0) {
        return await this.fetchData(`/ability?limit=${limit}&offset=${offset}`);
    }

    /**
     * Obtiene una lista de movimientos con paginación
     */
    async getMoves(limit = 20, offset = 0) {
        return await this.fetchData(`/move?limit=${limit}&offset=${offset}`);
    }

    /**
     * Obtiene información de la cadena evolutiva de un Pokémon
     */
    async getEvolutionChain(id) {
        return await this.fetchData(`/evolution-chain/${id}`);
    }

    /**
     * Obtiene el ID de la cadena evolutiva desde la especie
     */
    async getEvolutionChainFromSpecies(speciesId) {
        const species = await this.getPokemonSpecies(speciesId);
        if (species && species.evolution_chain) {
            // Extraer el ID de la URL
            const urlParts = species.evolution_chain.url.split('/');
            const evolutionId = urlParts[urlParts.length - 2];
            return await this.getEvolutionChain(evolutionId);
        }
        return null;
    }
}

// Exportar la instancia para uso global
const pokeApi = new PokeAPI();