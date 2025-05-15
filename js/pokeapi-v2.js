class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
        this.cache = new Map(); // Añadir esta línea
        this.dbName = 'PokeWebDB';
        this.dbVersion = 1;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('pokemon')) {
                    db.createObjectStore('pokemon', { keyPath: 'url' });
                }
            };
            
            request.onsuccess = () => resolve();
        });
    }
}

    async getPokemon(idOrName) {
        const url = `${this.baseUrl}/pokemon/${idOrName}`;
        
        // Check cache first
        if(this.cache.has(url)) return this.cache.get(url);
        
        // Try to get from IndexedDB for offline support
        const cachedData = await this.getFromIndexedDB(url);
        if(cachedData) return cachedData;

        const response = await fetch(url);
        const data = await response.json();
        
        const pokemon = {
            id: data.id,
            name: data.name,
            sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
            types: data.types.map(t => t.type.name),
            stats: data.stats,
            abilities: data.abilities,
            moves: data.moves,
            species: data.species.url,
            evolutionChain: null
        };

        // Get additional data
        pokemon.evolutionChain = await this.getEvolutionChain(pokemon.species);
        
        this.cache.set(url, pokemon);
        await this.saveToIndexedDB(url, pokemon);
        return pokemon;
    }

    async getEvolutionChain(speciesUrl) {
        try {
            const speciesData = await fetch(speciesUrl).then(res => res.json());
            const chainUrl = speciesData.evolution_chain.url;
            const chainData = await fetch(chainUrl).then(res => res.json());
            return this.parseEvolutionChain(chainData.chain);
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
            return null;
        }
    }

    parseEvolutionChain(chain) {
        // Implementar lógica para procesar la cadena evolutiva
        return chain;
    }

    async getFromIndexedDB(url) {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['pokemon'], 'readonly');
                const store = transaction.objectStore('pokemon');
                const getRequest = store.get(url);
                getRequest.onsuccess = () => resolve(getRequest.result);
                getRequest.onerror = () => resolve(null);
            };
        });
    }

    async saveToIndexedDB(url, data) {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['pokemon'], 'readwrite');
                const store = transaction.objectStore('pokemon');
                store.put({ url, ...data });
                transaction.oncomplete = () => resolve();
            };
        });
    }
}