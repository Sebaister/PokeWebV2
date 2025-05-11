class PokedexUI {
    constructor(pokeAPI) {
        this.pokeAPI = pokeAPI;
        this.currentPokemonId = 1;
        this.maxPokemonId = 898; // Número total de Pokémon en la API
        
        // Elementos DOM
        this.pokemonImage = document.getElementById('pokemon-image');
        this.pokemonName = document.getElementById('pokemon-name');
        this.pokemonNumber = document.getElementById('pokemon-number');
        this.pokemonTypes = document.getElementById('pokemon-types');
        this.pokemonStats = document.getElementById('pokemon-stats');
        this.pokemonDescription = document.getElementById('pokemon-description');
        this.pokemonAbilities = document.getElementById('pokemon-abilities');
        this.pokemonMoves = document.getElementById('pokemon-moves');
        this.pokemonEvolution = document.getElementById('pokemon-evolution');
        
        // Botones
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Navegación
        this.prevBtn.addEventListener('click', () => this.navigatePokemon('prev'));
        this.nextBtn.addEventListener('click', () => this.navigatePokemon('next'));
        
        // Búsqueda
        this.searchButton.addEventListener('click', () => this.searchPokemon());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPokemon();
        });
        
        // Tabs
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.changeTab(button));
        });
    }
    
    async loadPokemon(idOrName) {
        try {
            // Mostrar estado de carga
            this.showLoadingState();
            
            // Obtener datos del Pokémon
            const pokemonData = await this.pokeAPI.getPokemonDetails(idOrName);
            
            // Actualizar la UI con los datos
            this.updatePokemonUI(pokemonData);
            
            // Guardar el ID actual
            this.currentPokemonId = pokemonData.id;
            
            // Habilitar/deshabilitar botones de navegación
            this.updateNavigationButtons();
        } catch (error) {
            this.showError('No se pudo encontrar el Pokémon. Intenta con otro nombre o número.');
            console.error(error);
        }
    }
    
    showLoadingState() {
        this.pokemonImage.src = '';
        this.pokemonName.textContent = 'Cargando...';
        this.pokemonNumber.textContent = '';
        this.pokemonTypes.innerHTML = '';
        this.pokemonStats.innerHTML = '';
        this.pokemonDescription.innerHTML = '';
        this.pokemonAbilities.innerHTML = '';
        this.pokemonMoves.innerHTML = '';
        this.pokemonEvolution.innerHTML = '';
    }
    
    showError(message) {
        this.pokemonName.textContent = 'Error';
        this.pokemonDescription.textContent = message;
    }
    
    updatePokemonUI(pokemon) {
        // Información básica
        this.pokemonImage.src = pokemon.image;
        this.pokemonImage.alt = pokemon.name;
        this.pokemonName.textContent = pokemon.name;
        this.pokemonNumber.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        
        // Tipos
        this.pokemonTypes.innerHTML = '';
        pokemon.types.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = `type-badge ${type}`;
            typeElement.textContent = type;
            typeElement.style.backgroundColor = this.getTypeColor(type);
            this.pokemonTypes.appendChild(typeElement);
        });
        
        // Estadísticas
        this.pokemonStats.innerHTML = '';
        pokemon.stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'stat-bar';
            
            const statName = document.createElement('span');
            statName.className = 'stat-name';
            statName.textContent = this.formatStatName(stat.name);
            
            const statValue = document.createElement('span');
            statValue.className = 'stat-value';
            statValue.textContent = stat.value;
            
            const statProgress = document.createElement('div');
            statProgress.className = 'stat-progress';
            
            const statFill = document.createElement('div');
            statFill.className = 'stat-fill';
            statFill.style.width = `${Math.min(stat.value, 100)}%`;
            
            statProgress.appendChild(statFill);
            statElement.appendChild(statName);
            statElement.appendChild(statValue);
            statElement.appendChild(statProgress);
            
            this.pokemonStats.appendChild(statElement);
        });
        
        // Descripción
        this.pokemonDescription.innerHTML = `
            <p>${pokemon.description}</p>
            <p>Altura: ${pokemon.height} m | Peso: ${pokemon.weight} kg</p>
        `;
        
        // Habilidades
        this.pokemonAbilities.innerHTML = '<h4>Habilidades</h4>';
        pokemon.abilities.forEach(ability => {
            const abilityElement = document.createElement('div');
            abilityElement.className = 'ability';
            
            const abilityName = document.createElement('span');
            abilityName.className = 'ability-name';
            abilityName.textContent = ability.name;
            
            if (ability.isHidden) {
                const hiddenBadge = document.createElement('span');
                hiddenBadge.className = 'hidden-badge';
                hiddenBadge.textContent = ' (Oculta)';
                abilityName.appendChild(hiddenBadge);
            }
            
            abilityElement.appendChild(abilityName);
            this.pokemonAbilities.appendChild(abilityElement);
        });
        
        // Movimientos
        this.pokemonMoves.innerHTML = '';
        pokemon.moves.forEach(move => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move';
            moveElement.textContent = move;
            this.pokemonMoves.appendChild(moveElement);
        });
        
        // Cadena de evolución
        this.updateEvolutionChain(pokemon.evolutionChain);
    }
    
    updateEvolutionChain(evolutionData) {
        this.pokemonEvolution.innerHTML = '';
        
        if (!evolutionData) {
            this.pokemonEvolution.textContent = 'Información de evolución no disponible';
            return;
        }
        
        const chain = [];
        let currentEvolution = evolutionData.chain;
        
        // Recorrer la cadena de evolución
        while (currentEvolution) {
            const speciesName = currentEvolution.species.name;
            const pokemonId = this.getPokemonIdFromUrl(currentEvolution.species.url);
            
            chain.push({
                name: speciesName,
                id: pokemonId
            });
            
            // Pasar a la siguiente evolución (si existe)
            if (currentEvolution.evolves_to.length > 0) {
                currentEvolution = currentEvolution.evolves_to[0];
            } else {
                break;
            }
        }
        
        // Crear elementos de UI para cada etapa de evolución
        chain.forEach((pokemon, index) => {
            const evolutionStage = document.createElement('div');
            evolutionStage.className = 'evolution-stage';
            
            const image = document.createElement('img');
            image.className = 'evolution-image';
            image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
            image.alt = pokemon.name;
            
            const name = document.createElement('span');
            name.className = 'evolution-name';
            name.textContent = pokemon.name;
            
            evolutionStage.appendChild(image);
            evolutionStage.appendChild(name);
            
            this.pokemonEvolution.appendChild(evolutionStage);
            
            // Añadir flecha entre evoluciones
            if (index < chain.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'evolution-arrow';
                arrow.innerHTML = '→';
                this.pokemonEvolution.appendChild(arrow);
            }
        });
    }
    
    getPokemonIdFromUrl(url) {
        const matches = url.match(/\/pokemon-species\/(\d+)\//);
        return matches ? matches[1] : null;
    }
    
    formatStatName(statName) {
        const statNames = {
            'hp': 'HP',
            'attack': 'Ataque',
            'defense': 'Defensa',
            'special-attack': 'Atq. Esp.',
            'special-defense': 'Def. Esp.',
            'speed': 'Velocidad'
        };
        
        return statNames[statName] || statName;
    }
    
    getTypeColor(type) {
        const typeColors = {
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
        
        return typeColors[type] || '#777777';
    }
    
    navigatePokemon(direction) {
        if (direction === 'prev' && this.currentPokemonId > 1) {
            this.loadPokemon(this.currentPokemonId - 1);
        } else if (direction === 'next' && this.currentPokemonId < this.maxPokemonId) {
            this.loadPokemon(this.currentPokemonId + 1);
        }
    }
    
    searchPokemon() {
        const searchTerm = this.searchInput.value.trim();
        if (searchTerm) {
            this.loadPokemon(searchTerm);
        }
    }
    
    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentPokemonId <= 1;
        this.nextBtn.disabled = this.currentPokemonId >= this.maxPokemonId;
    }
    
    changeTab(selectedTab) {
        // Desactivar todos los tabs
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Activar el tab seleccionado
        selectedTab.classList.add('active');
        
        // Ocultar todos los paneles
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Mostrar el panel correspondiente
        const tabId = selectedTab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    }
}