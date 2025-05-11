// Clase para manejar la interfaz de usuario
class PokedexUI {
    constructor() {
        // Elementos de la pantalla principal
        this.pokemonImage = document.getElementById('pokemon-image');
        this.pokemonName = document.getElementById('pokemon-name');
        this.pokemonNumber = document.getElementById('pokemon-number');
        this.pokemonTypes = document.getElementById('pokemon-types');
        this.pokemonLoading = document.querySelector('.pokemon-loading');
        
        // Elementos de la pestaña Info
        this.pokemonHeight = document.getElementById('pokemon-height');
        this.pokemonWeight = document.getElementById('pokemon-weight');
        this.pokemonAbilities = document.getElementById('pokemon-abilities');
        this.pokemonDescription = document.getElementById('pokemon-description');
        
        // Elementos de la pestaña Stats
        this.statsContainer = document.getElementById('stats-container');
        
        // Elementos de la pestaña Moves
        this.movesContainer = document.getElementById('moves-container');
        
        // Elementos de la pestaña Evolution
        this.evolutionChain = document.getElementById('evolution-chain');
        
        // Elementos de navegación
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        // Elementos de pestañas
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // Elementos de temas
        this.themeBtns = document.querySelectorAll('.theme-btn');
        
        // Inicializar eventos
        this.initEvents();
    }
    
    // Inicializar eventos de la UI
    initEvents() {
        // Eventos de pestañas
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.showTab(tabId);
            });
        });
        
        // Eventos de temas
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.setTheme(theme);
            });
        });
    }
    
    // Mostrar pestaña seleccionada
    showTab(tabId) {
        // Desactivar todas las pestañas
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Activar pestaña seleccionada
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }
    
    // Establecer tema
    setTheme(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('pokedex-theme', theme);
    }
    
    // Mostrar carga
    showLoading() {
        this.pokemonLoading.style.display = 'flex';
        this.pokemonImage.style.opacity = '0';
    }
    
    // Ocultar carga
    hideLoading() {
        this.pokemonLoading.style.display = 'none';
        this.pokemonImage.style.opacity = '1';
    }
    
    // Mostrar error
    showError(message) {
        this.hideLoading();
        this.pokemonName.textContent = 'Error';
        this.pokemonNumber.textContent = '';
        this.pokemonImage.src = '';
        this.pokemonImage.alt = 'Error';
        this.pokemonTypes.innerHTML = '';
        this.pokemonDescription.textContent = message || 'No se pudo cargar el Pokémon.';
    }
    
    // Mostrar información del Pokémon
    displayPokemon(pokemon, species) {
        // Información básica
        this.pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        this.pokemonNumber.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        
        // Imagen
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                         pokemon.sprites.front_default;
        this.pokemonImage.src = imageUrl;
        this.pokemonImage.alt = pokemon.name;
        
        // Tipos
        this.displayTypes(pokemon.types);
        
        // Información detallada
        this.displayInfo(pokemon);
        
        // Estadísticas
        this.displayStats(pokemon.stats);
        
        // Movimientos
        this.displayMoves(pokemon.moves);
        
        // Descripción
        if (species) {
            this.displayDescription(species);
            
            // Cadena de evolución
            if (species.evolution_chain) {
                this.loadEvolutionChain(species.evolution_chain.url);
            }
        }
        
        this.hideLoading();
    }
    
    // Mostrar tipos
    displayTypes(types) {
        this.pokemonTypes.innerHTML = '';
        
        types.forEach(typeInfo => {
            const type = typeInfo.type.name;
            const typeElement = document.createElement('span');
            typeElement.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeElement.classList.add('type', `type-${type}`);
            this.pokemonTypes.appendChild(typeElement);
        });
    }
    
    // Mostrar información básica
    displayInfo(pokemon) {
        // Altura (convertir de decímetros a metros)
        const heightInM = pokemon.height / 10;
        this.pokemonHeight.textContent = `${heightInM.toFixed(1)} m`;
        
        // Peso (convertir de hectogramos a kilogramos)
        const weightInKg = pokemon.weight / 10;
        this.pokemonWeight.textContent = `${weightInKg.toFixed(1)} kg`;
        
        // Habilidades
        this.pokemonAbilities.innerHTML = '';
        pokemon.abilities.forEach(abilityInfo => {
            const ability = abilityInfo.ability.name.replace('-', ' ');
            const abilityElement = document.createElement('span');
            abilityElement.textContent = ability.charAt(0).toUpperCase() + ability.slice(1);
            abilityElement.classList.add('ability');
            if (abilityInfo.is_hidden) {
                abilityElement.classList.add('hidden-ability');
                abilityElement.textContent += ' (Oculta)';
            }
            this.pokemonAbilities.appendChild(abilityElement);
        });
    }
    
    // Mostrar estadísticas
    displayStats(stats) {
        this.statsContainer.innerHTML = '';
        
        const statNames = {
            'hp': 'HP',
            'attack': 'Ataque',
            'defense': 'Defensa',
            'special-attack': 'Atq. Esp.',
            'special-defense': 'Def. Esp.',
            'speed': 'Velocidad'
        };
        
        stats.forEach(stat => {
            const statName = stat.stat.name;
            const statValue = stat.base_stat;
            
            const statElement = document.createElement('div');
            statElement.classList.add('stat-item');
            
            const maxStat = 255; // Valor máximo posible para una estadística
            const percentage = (statValue / maxStat) * 100;
            
            statElement.innerHTML = `
                <span class="stat-name">${statNames[statName] || statName}</span>
                <span class="stat-value">${statValue}</span>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
            `;
            
            this.statsContainer.appendChild(statElement);
        });
    }
    
    // Mostrar movimientos
    displayMoves(moves) {
        this.movesContainer.innerHTML = '';
        
        // Ordenar movimientos por nivel
        const sortedMoves = [...moves].sort((a, b) => {
            const levelA = a.version_group_details[0].level_learned_at;
            const levelB = b.version_group_details[0].level_learned_at;
            return levelA - levelB;
        });
        
        // Mostrar solo los primeros 20 movimientos para no sobrecargar la UI
        const movsToShow = sortedMoves.slice(0, 20);
        
        movsToShow.forEach(moveInfo => {
            const move = moveInfo.move.name.replace('-', ' ');
            const level = moveInfo.version_group_details[0].level_learned_at;
            
            const moveElement = document.createElement('div');
            moveElement.classList.add('move-item');
            
            moveElement.innerHTML = `
                <span class="move-name">${move.charAt(0).toUpperCase() + move.slice(1)}</span>
                <span class="move-level">Nv. ${level}</span>
            `;
            
            this.movesContainer.appendChild(moveElement);
        });
    }
    
    // Mostrar descripción
    displayDescription(species) {
        // Buscar entrada en español, si no hay, usar inglés
        const flavorTexts = species.flavor_text_entries;
        let description = '';
        
        // Primero intentar encontrar en español
        const spanishEntry = flavorTexts.find(entry => entry.language.name === 'es');
        if (spanishEntry) {
            description = spanishEntry.flavor_text;
        } else {
            // Si no hay en español, usar inglés
            const englishEntry = flavorTexts.find(entry => entry.language.name === 'en');
            if (englishEntry) {
                description = englishEntry.flavor_text;
            }
        }
        
        // Limpiar formato de la descripción
        description = description.replace(/\f/g, ' ').replace(/\n/g, ' ');
        
        this.pokemonDescription.textContent = description || 'No hay descripción disponible.';
    }
    
    // Cargar cadena de evolución
    async loadEvolutionChain(url) {
        try {
            const evolutionData = await pokeApi.getEvolutionChain(url);
            this.displayEvolutionChain(evolutionData.chain);
        } catch (error) {
            console.error('Error al cargar evoluciones:', error);
            this.evolutionChain.innerHTML = '<p>No se pudieron cargar las evoluciones.</p>';
        }
    }
    
    // Mostrar cadena de evolución
    displayEvolutionChain(chain) {
        this.evolutionChain.innerHTML = '';
        
        // Función recursiva para procesar la cadena de evolución
        const processEvolutionChain = async (chain, container) => {
            if (!chain) return;
            
            try {
                // Obtener ID del Pokémon actual
                const pokemonId = this.extractPokemonId(chain.species.url);
                
                // Obtener datos del Pokémon
                const pokemon = await pokeApi.getPokemon(pokemonId);
                
                // Crear elemento para este Pokémon
                const pokemonElement = document.createElement('div');
                pokemonElement.classList.add('evolution-pokemon');
                
                // Imagen
                const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                                pokemon.sprites.front_default;
                
                pokemonElement.innerHTML = `
                    <img src="${imageUrl}" alt="${pokemon.name}">
                    <span class="evolution-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                    <span class="evolution-number">#${pokemon.id.toString().padStart(3, '0')}</span>
                `;
                
                container.appendChild(pokemonElement);
                
                // Si hay evoluciones, procesarlas
                if (chain.evolves_to && chain.evolves_to.length > 0) {
                    // Añadir flecha
                    const arrowElement = document.createElement('div');
                    arrowElement.classList.add('evolution-arrow');
                    arrowElement.innerHTML = '<i class="fas fa-arrow-right"></i>';
                    container.appendChild(arrowElement);
                    
                    // Procesar siguiente evolución
                    await processEvolutionChain(chain.evolves_to[0], container);
                }
            } catch (error) {
                console.error('Error al procesar evolución:', error);
            }
        };
        
        // Iniciar procesamiento
        processEvolutionChain(chain, this.evolutionChain);
    }
    
    // Extraer ID de Pokémon de la URL
    extractPokemonId(url) {
        const parts = url.split('/');
        return parts[parts.length - 2];
    }
}

// Exportar una instancia de la clase
const pokedexUI = new PokedexUI();