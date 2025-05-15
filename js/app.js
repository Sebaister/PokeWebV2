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
    
    // Configurar navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Configurar búsqueda de Pokémon (barra principal)
    const searchBtn = document.getElementById('searchBtn');
    const pokemonSearch = document.getElementById('pokemonSearch');
    const pokemonResult = document.getElementById('pokemonResult');
    
    if (searchBtn && pokemonSearch) {
        searchBtn.addEventListener('click', () => {
            searchPokemon(pokemonSearch.value);
        });
        
        pokemonSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPokemon(pokemonSearch.value);
            }
        });
    }
    
    // Configurar búsqueda de Pokémon (barra secundaria)
    const searchBtnInline = document.getElementById('searchBtnInline');
    const pokemonSearchInline = document.getElementById('pokemonSearchInline');
    
    if (searchBtnInline && pokemonSearchInline) {
        searchBtnInline.addEventListener('click', () => {
            searchPokemon(pokemonSearchInline.value);
        });
        
        pokemonSearchInline.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPokemon(pokemonSearchInline.value);
            }
        });
    }
    
    async function searchPokemon(query) {
        query = query.trim();
        if (!query) return;
        
        // Sincronizar ambos campos de búsqueda
        if (pokemonSearch) pokemonSearch.value = query;
        if (pokemonSearchInline) pokemonSearchInline.value = query;
        
        // Desplazarse a la sección de resultados
        const resultsSection = document.getElementById('pokemon-search');
        if (resultsSection) {
            window.scrollTo({
                top: resultsSection.offsetTop - 20,
                behavior: 'smooth'
            });
        }
        
        pokemonResult.innerHTML = '<div id="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Buscando Pokémon...</p></div>';
        
        try {
            const pokemon = await pokeApi.getPokemon(query);
            if (pokemon) {
                renderPokemonCard(pokemon);
            } else {
                pokemonResult.innerHTML = '<p class="error-message">No se encontró ningún Pokémon con ese nombre o número.</p>';
            }
        } catch (error) {
            console.error('Error al buscar Pokémon:', error);
            pokemonResult.innerHTML = '<p class="error-message">Error al buscar Pokémon. Por favor, intenta de nuevo.</p>';
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
        
        // Traducir tipos
        const translatedTypes = pokemon.types.map(type => {
            const typeName = translateType(type.type.name);
            return `
                <span class="type-badge" style="background-color: ${typeChart.typeColors[type.type.name]}">
                    ${typeName}
                </span>
            `;
        }).join('');
        
        // Traducir estadísticas
        const translatedStats = pokemon.stats.map(stat => {
            return `
                <div class="stat">
                    <span class="stat-name">${translateStatName(stat.stat.name)}</span>
                    <span class="stat-value">${stat.base_stat}</span>
                </div>
            `;
        }).join('');
        
        // Obtener nombre en español si está disponible
        let pokemonName = pokemon.name;
        if (species && species.names) {
            const spanishName = species.names.find(name => name.language.name === 'es');
            if (spanishName) {
                pokemonName = spanishName.name;
            }
        }
        
        card.innerHTML = `
            <div class="pokemon-image">
                <img src="${imageUrl}" alt="${pokemonName}">
            </div>
            <div class="pokemon-info">
                <h3 class="pokemon-name">${pokemonName}</h3>
                <p class="pokemon-number">N.º ${pokemon.id.toString().padStart(3, '0')}</p>
                
                <div class="pokemon-types">
                    ${translatedTypes}
                </div>
                
                <div class="pokemon-stats">
                    ${translatedStats}
                </div>
            </div>
        `;
        
        pokemonResult.innerHTML = '';
        pokemonResult.appendChild(card);
    }
    
    function translateStatName(statName) {
        const statMap = {
            'hp': 'PS',
            'attack': 'Ataque',
            'defense': 'Defensa',
            'special-attack': 'At. Esp.',
            'special-defense': 'Def. Esp.',
            'speed': 'Velocidad'
        };
        
        return statMap[statName] || statName;
    }
    
    function translateType(typeName) {
        const typeMap = {
            'normal': 'Normal',
            'fire': 'Fuego',
            'water': 'Agua',
            'electric': 'Eléctrico',
            'grass': 'Planta',
            'ice': 'Hielo',
            'fighting': 'Lucha',
            'poison': 'Veneno',
            'ground': 'Tierra',
            'flying': 'Volador',
            'psychic': 'Psíquico',
            'bug': 'Bicho',
            'rock': 'Roca',
            'ghost': 'Fantasma',
            'dragon': 'Dragón',
            'dark': 'Siniestro',
            'steel': 'Acero',
            'fairy': 'Hada'
        };
        
        return typeMap[typeName] || typeName;
    }
});