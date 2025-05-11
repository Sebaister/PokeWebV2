document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la API
    const pokeAPI = new PokeAPI();
    
    // Inicializar la UI
    const pokedexUI = new PokedexUI(pokeAPI);
    
    // Cargar el primer Pokémon
    pokedexUI.loadPokemon(1);
});