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
        
        searchSuggestions.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';
        searchSuggestions.style.display = 'block';
        
        // Implementación real de búsqueda
        window.pokeAPI.searchPokemon(searchTerm)
            .then(results => {
                if (results.length === 0) {
                    searchSuggestions.innerHTML = '<div class="suggestion">No se encontraron resultados</div>';
                    return;
                }
                
                const suggestionsHTML = results.map(pokemon => 
                    `<div class="suggestion" data-id="${pokemon.id}">${capitalizeFirstLetter(pokemon.name)}</div>`
                ).join('');
                
                searchSuggestions.innerHTML = suggestionsHTML;
                
                // Agregar event listeners a las sugerencias
                document.querySelectorAll('.suggestion').forEach(suggestion => {
                    suggestion.addEventListener('click', async () => {
                        const pokemonId = suggestion.dataset.id;
                        const pokemon = await window.pokeAPI.getPokemon(pokemonId);
                        showPokemonDetails(pokemon);
                        searchSuggestions.style.display = 'none';
                    });
                });
            })
            .catch(error => {
                console.error('Error en la búsqueda:', error);
                searchSuggestions.innerHTML = '<div class="suggestion">Error al buscar. Intenta de nuevo.</div>';
            });
    }
    
    // Función para mostrar detalles de un Pokémon
    function showPokemonDetails(pokemon) {
        console.log('Mostrar detalles de:', pokemon);
        
        // Crear un modal para mostrar los detalles
        const modal = document.createElement('div');
        modal.className = 'pokemon-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'pokemon-modal-content';
        
        // Crear el contenido del modal
        modalContent.innerHTML = `
            <span class="close-modal">&times;</span>
            <div class="pokemon-detail-header">
                <h2>${capitalizeFirstLetter(pokemon.name)} #${pokemon.id.toString().padStart(3, '0')}</h2>
                <div class="pokemon-types">
                    ${pokemon.types.map(type => `
                        <span class="pokemon-type" style="background-color: ${window.pokeAPI.getTypeColor(type)}">
                            ${capitalizeFirstLetter(type)}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="pokemon-detail-body">
                <div class="pokemon-detail-image">
                    <img src="${pokemon.sprite}" alt="${pokemon.name}" />
                </div>
                <div class="pokemon-detail-info">
                    <div class="pokemon-stats">
                        <h3>Estadísticas</h3>
                        ${pokemon.stats.map(stat => `
                            <div class="stat-row">
                                <span class="stat-name">${capitalizeFirstLetter(stat.name.replace('-', ' '))}</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar" style="width: ${(stat.value / 255) * 100}%"></div>
                                </div>
                                <span class="stat-value">${stat.value}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="pokemon-abilities">
                        <h3>Habilidades</h3>
                        <ul>
                            ${pokemon.abilities.map(ability => `
                                <li>${capitalizeFirstLetter(ability.name.replace('-', ' '))}
                                    ${ability.isHidden ? ' <span class="hidden-ability">(Oculta)</span>' : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="pokemon-physical">
                        <p><strong>Altura:</strong> ${pokemon.height} m</p>
                        <p><strong>Peso:</strong> ${pokemon.weight} kg</p>
                    </div>
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Agregar evento para cerrar el modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Cerrar el modal al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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