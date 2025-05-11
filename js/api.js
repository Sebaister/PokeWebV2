// Clase para manejar las llamadas a la PokeAPI v2
class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
        this.cache = {};
    }
    
    // Método para obtener datos con caché
    async fetchData(endpoint) {
        if (this.cache[endpoint]) {
            return this.cache[endpoint];
        }
        
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache[endpoint] = data;
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    
    // Obtener un Pokémon por ID o nombre
    async getPokemon(idOrName) {
        return this.fetchData(`/pokemon/${idOrName.toString().toLowerCase()}`);
    }
    
    // Obtener especies de Pokémon (para descripciones)
    async getPokemonSpecies(idOrName) {
        return this.fetchData(`/pokemon-species/${idOrName.toString().toLowerCase()}`);
    }
    
    // Obtener cadena de evolución
    async getEvolutionChain(url) {
        // Extraer el ID de la URL
        const id = url.split('/').filter(Boolean).pop();
        return this.fetchData(`/evolution-chain/${id}`);
    }
    
    // Obtener lista de Pokémon con paginación
    async getPokemonList(limit = 20, offset = 0) {
        return this.fetchData(`/pokemon?limit=${limit}&offset=${offset}`);
    }
    
    // Obtener detalles de un movimiento
    async getMoveDetails(url) {
        // Extraer el ID de la URL
        const id = url.split('/').filter(Boolean).pop();
        return this.fetchData(`/move/${id}`);
    }
    
    // Obtener texto en español
    getSpanishText(textEntries) {
        const spanishEntry = textEntries.find(entry => entry.language.name === 'es');
        return spanishEntry ? spanishEntry.flavor_text.replace(/\f/g, ' ') : 
               textEntries[0].flavor_text.replace(/\f/g, ' ');
    }
}

// Exportar la instancia
const pokeApi = new PokeAPI();