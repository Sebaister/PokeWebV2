document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la tabla de tipos
    typeChart.initialize();
    
    // Configurar los botones de generación
    const genButtons = document.querySelectorAll('.gen-btn');
    genButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar clase activa de todos los botones
            genButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase activa al botón seleccionado
            button.classList.add('active');
            
            // Cambiar generación
            const gen = parseInt(button.dataset.gen);
            typeChart.changeGeneration(gen);
        });
    });
    
    // Configurar búsqueda de Pokémon
    const searchBtn = document.getElementById('searchBtn');
    const pokemonSearch = document.getElementById('pokemonSearch');
    const pokemonResult = document.getElementById('pokemonResult');
    
    searchBtn.addEventListener('click', () => {
        searchPokemon();
    });
    
    pokemonSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPokemon();
        }
    });
    
    async function searchPokemon() {
        const query = pokemonSearch.value.trim();
        if (!query) return;
        
        pokemonResult.innerHTML = '<div id="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Buscando Pokémon...</p></div>';
        
        try {
            const pokemon = await pokeApi.getPokemon(query);
            if (pokemon) {
                renderPokemonCard(pokemon);
            } else {
                pokemonResult.innerHTML = '<p>No se encontró ningún Pokémon con ese nombre o número.</p>';
            }
        } catch (error) {
            console.error('Error al buscar Pokémon:', error);
            pokemonResult.innerHTML = '<p>Error al buscar Pokémon. Por favor, intenta de nuevo.</p>';
        }
    }
    
    async function renderPokemonCard(pokemon) {
        // Obtener información adicional de la especie
        let species = null;
        try {
            species = await pokeApi.getPokemonSpecies(pokemon.id);
        } catch (error) {
            console.warn('No se pudo obtener información de la especie:', error);
        }
        
        // Crear tarjeta de Pokémon
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        
        // Imagen
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                         pokemon.sprites.front_default;
        
        card.innerHTML = `
            <div class="pokemon-image">
                <img src="${imageUrl}" alt="${pokemon.name}">
            </div>
            <div class="pokemon-info">
                <h3 class="pokemon-name">${pokemon.name}</h3>
                <p class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</p>
                
                <div class="pokemon-types">
                    ${pokemon.types.map(type => `
                        <span class="type-badge" style="background-color: ${typeChart.typeColors[type.type.name]}">
                            ${type.type.name}
                        </span>
                    `).join('')}
                </div>
                
                <div class="pokemon-stats">
                    ${pokemon.stats.map(stat => `
                        <div class="stat">
                            <span class="stat-name">${formatStatName(stat.stat.name)}</span>
                            <span class="stat-value">${stat.base_stat}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        pokemonResult.innerHTML = '';
        pokemonResult.appendChild(card);
    }
    
    function formatStatName(statName) {
        const statMap = {
            'hp': 'HP',
            'attack': 'Ataque',
            'defense': 'Defensa',
            'special-attack': 'Atq. Esp.',
            'special-defense': 'Def. Esp.',
            'speed': 'Velocidad'
        };
        
        return statMap[statName] || statName;
    }
});