class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
        this.cache = new Map();
        this.dbName = 'PokeWebDB';
        this.dbVersion = 1;
        this.initDB();
        this.typeColors = {
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
            fairy: '#EE99AC'
        };
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
            stats: this.processStats(data.stats),
            abilities: data.abilities.map(a => ({
                name: a.ability.name,
                isHidden: a.is_hidden,
                url: a.ability.url
            })),
            moves: data.moves.map(m => ({
                name: m.move.name,
                url: m.move.url
            })),
            species: data.species.url,
            height: data.height / 10, // en metros
            weight: data.weight / 10, // en kg
            baseExperience: data.base_experience,
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
        const evoChain = [];
        let currentChain = chain;

        do {
            const evoDetails = currentChain.evolution_details[0] || {};
            
            evoChain.push({
                species_name: currentChain.species.name,
                species_url: currentChain.species.url,
                min_level: evoDetails.min_level || null,
                trigger: evoDetails.trigger ? evoDetails.trigger.name : null,
                item: evoDetails.item ? evoDetails.item.name : null
            });

            // Manejar múltiples evoluciones (como Eevee)
            if (currentChain.evolves_to.length > 1) {
                currentChain.evolves_to.forEach(branch => {
                    const branchDetails = branch.evolution_details[0] || {};
                    
                    evoChain.push({
                        species_name: branch.species.name,
                        species_url: branch.species.url,
                        min_level: branchDetails.min_level || null,
                        trigger: branchDetails.trigger ? branchDetails.trigger.name : null,
                        item: branchDetails.item ? branchDetails.item.name : null,
                        parent: currentChain.species.name
                    });
                });
                break;
            }
            
            currentChain = currentChain.evolves_to[0];
        } while (currentChain && currentChain.evolves_to);

        return evoChain;
    }

    // Método para obtener el color de un tipo
    getTypeColor(type) {
        return this.typeColors[type] || '#777777';
    }

    // Nuevos métodos para obtener más datos
    async getAllTypes() {
        const url = `${this.baseUrl}/type`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    }

    async getTypeEffectiveness(typeName) {
        const url = `${this.baseUrl}/type/${typeName}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return {
            doubleDamageTo: data.damage_relations.double_damage_to.map(t => t.name),
            halfDamageTo: data.damage_relations.half_damage_to.map(t => t.name),
            noDamageTo: data.damage_relations.no_damage_to.map(t => t.name),
            doubleDamageFrom: data.damage_relations.double_damage_from.map(t => t.name),
            halfDamageFrom: data.damage_relations.half_damage_from.map(t => t.name),
            noDamageFrom: data.damage_relations.no_damage_from.map(t => t.name)
        };
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

    processStats(stats) {
        return stats.map(stat => ({
            name: stat.stat.name,
            value: stat.base_stat,
            effort: stat.effort
        }));
    }
}

// Exportar la instancia para uso global
window.pokeAPI = new PokeAPI();