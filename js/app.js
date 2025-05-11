// Clase principal de la aplicación
class PokedexApp {
    constructor() {
        this.currentPokemonId = 1;
        this.totalPokemon = 898; // Número total de Pokémon (ajustar según la generación)
        
        // Referencias a elementos UI
        this.ui = pokedexUI;
        
        // Inicializar eventos
        this.initEvents();
        
        // Cargar tema guardado
        this.loadSavedTheme();
        
        // Cargar Pokémon inicial
        this.loadPokemon(this.currentPokemonId);
    }
    
    // Inicializar eventos
    initEvents() {
        // Evento de búsqueda
        this.ui.searchBtn.addEventListener('click', () => {
            this.searchPokemon();
        });
        
        this.ui.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchPokemon();
            }
        });
        
        // Eventos de navegación
        this.ui.prevBtn.addEventListener('click', () => {
            this.loadPreviousPokemon();
        });
        
        this.ui.nextBtn.addEventListener('click', () => {
            this.loadNextPokemon();
        });
        
        // Evento para teclas de navegación
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.loadPreviousPokemon();
            } else if (e.key === 'ArrowRight') {
                this.loadNextPokemon();
            }
        });
    }
    
    // Cargar tema guardado
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('pokedex-theme') || 'default';
        this.ui.setTheme(savedTheme);
        
        // Marcar botón de tema activo
        document.querySelectorAll('.theme-btn').forEach(btn => {
            if (btn.getAttribute('data-theme') === savedTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Cargar Pokémon por ID o nombre
    async loadPokemon(idOrName) {
        try {
            this.ui.showLoading();
            
            // Obtener datos del Pokémon
            const pokemon = await pokeApi.getPokemon(idOrName);
            
            // Actualizar ID actual
            this.currentPokemonId = pokemon.id;
            
            // Obtener datos de la especie
            const species = await pokeApi.getPokemonSpecies(pokemon.id);
            
            // Mostrar datos en la UI
            this.ui.displayPokemon(pokemon, species);
            
            // Actualizar URL con el ID del Pokémon
            history.replaceState(null, null, `?pokemon=${pokemon.id}`);
            
        } catch (error) {
            console.error('Error al cargar Pokémon:', error);
            this.ui.showError('No se pudo encontrar el Pokémon. Verifica el nombre o número.');
        }
    }
    
    // Buscar Pokémon
    searchPokemon() {
        const searchTerm = this.ui.searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            this.loadPokemon(searchTerm);
        }
    }
    
    // Cargar Pokémon anterior
    loadPreviousPokemon() {
        if (this.currentPokemonId > 1) {
            this.loadPokemon(this.currentPokemonId - 1);
        } else {
            // Ir al último Pokémon si estamos en el primero
            this.loadPokemon(this.totalPokemon);
        }
    }
    
    // Cargar Pokémon siguiente
    loadNextPokemon() {
        if (this.currentPokemonId < this.totalPokemon) {
            this.loadPokemon(this.currentPokemonId + 1);
        } else {
            // Volver al primer Pokémon si estamos en el último
            this.loadPokemon(1);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un Pokémon en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonParam = urlParams.get('pokemon');
    
    // Crear instancia de la aplicación
    window.pokedexApp = new PokedexApp();
    
    // Si hay un Pokémon en la URL, cargarlo
    if (pokemonParam) {
        window.pokedexApp.loadPokemon(pokemonParam);
    }
});