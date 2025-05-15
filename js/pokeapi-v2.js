class PokeAPI {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
        this.cache = new Map();
    }

    async getPokemon(idOrName) {
        const url = `${this.baseUrl}/pokemon/${idOrName}`;
        if(this.cache.has(url)) return this.cache.get(url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Enhanced data processing
        const pokemon = {
            id: data.id,
            name: data.name,
            sprite: data.sprites.other['official-artwork'].front_default,
            types: data.types.map(t => t.type.name),
            stats: data.stats,
            abilities: data.abilities,
            moves: data.moves.slice(0, 10) // First 10 moves
        };
        
        this.cache.set(url, pokemon);
        return pokemon;
    }

    // Similar methods for types, abilities, moves with caching
}