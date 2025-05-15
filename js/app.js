document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const pokedexSearch = document.getElementById('pokedexSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const pokedexResults = document.getElementById('pokedexResults');
    const backToTopBtn = document.getElementById('backToTop');
    const themeToggle = document.getElementById('themeToggle');
    
    // Cargar Pokémon iniciales
    loadInitialPokemon();
    
    // Event listeners
    pokedexSearch.addEventListener('input', handleSearch);
    backToTopBtn.addEventListener('scroll', toggleBackToTopButton);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Función para cargar los primeros Pokémon
    async function loadInitialPokemon() {
        try {
            pokedexResults.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Cargando Pokémon...</p></div>';
            
            // Cargar los primeros 20 Pokémon
            const pokemonList = [];
            for (let i = 1; i <= 20; i++) {
                const pokemon = await window.pokeAPI.getPokemon(i);
                pokemonList.push(pokemon);
            }
            
            displayPokemonList(pokemonList);
        } catch (error) {
            console.error('Error cargando Pokémon iniciales:', error);
            pokedexResults.innerHTML = '<div class="error"><p>Error al cargar Pokémon. Intenta recargar la página.</p></div>';
        }
    }
    
    // Función para mostrar la lista de Pokémon
    function displayPokemonList(pokemonList) {
        pokedexResults.innerHTML = '';
        
        pokemonList.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            pokedexResults.appendChild(card);
        });
    }
    
    // Función para crear una tarjeta de Pokémon
    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card fade-in';
        
        const typeClasses = pokemon.types.map(type => `type-${type}`).join(' ');
        
        card.innerHTML = `
            <div class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</div>
            <div class="pokemon-img-container">
                <img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy" class="pokemon-img" />
            </div>
            <h3 class="pokemon-name">${capitalizeFirstLetter(pokemon.name)}</h3>
            <div class="pokemon-types">
                ${pokemon.types.map(type => `
                    <span class="pokemon-type" style="background-color: ${window.pokeAPI.getTypeColor(type)}">
                        ${capitalizeFirstLetter(type)}
                    </span>
                `).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => showPokemonDetails(pokemon));
        
        return card;
    }
    
    // Función para manejar la búsqueda
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length < 2) {
            searchSuggestions.innerHTML = '';
            searchSuggestions.style.display = 'none';
            return;
        }
        
        // Aquí deberías implementar la lógica de búsqueda
        // Por ahora, simplemente mostraremos un mensaje
        searchSuggestions.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';
        searchSuggestions.style.display = 'block';
        
        // Simulación de búsqueda (reemplazar con búsqueda real)
        setTimeout(() => {
            searchSuggestions.innerHTML = '<div class="suggestion">Implementar búsqueda real</div>';
        }, 500);
    }
    
    // Función para mostrar detalles de un Pokémon
    function showPokemonDetails(pokemon) {
        console.log('Mostrar detalles de:', pokemon);
        // Implementar modal o navegación a página de detalles
    }
    
    // Función para alternar el botón de volver arriba
    function toggleBackToTopButton() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Función para alternar el tema
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    // Función auxiliar para capitalizar la primera letra
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Inicializar el botón de volver arriba
    window.addEventListener('scroll', toggleBackToTopButton);
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});