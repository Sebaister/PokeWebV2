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
        let evolutionChain = null;
        try {
            species = await pokeApi.getPokemonSpecies(pokemon.id);
            if (species) {
                evolutionChain = await pokeApi.getEvolutionChainFromSpecies(pokemon.id);
            }
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
        let description = '';
        if (species && species.names) {
            const spanishName = species.names.find(name => name.language.name === 'es');
            if (spanishName) {
                pokemonName = spanishName.name;
            }
            
            // Obtener descripción en español
            if (species.flavor_text_entries) {
                const spanishDesc = species.flavor_text_entries.find(entry => entry.language.name === 'es');
                if (spanishDesc) {
                    description = spanishDesc.flavor_text.replace(/\f/g, ' ');
                }
            }
        }
        
        // Obtener habilidades
        const abilities = pokemon.abilities.map(ability => {
            let abilityName = ability.ability.name;
            // Aquí podrías traducir el nombre de la habilidad si tienes un mapeo
            return `
                <div class="ability-item">
                    <span class="ability-name">${abilityName}</span>
                    ${ability.is_hidden ? '<span class="ability-hidden">(Oculta)</span>' : ''}
                </div>
            `;
        }).join('');
        
        // Preparar información de evolución si está disponible
        let evolutionHTML = '';
        if (evolutionChain && evolutionChain.chain) {
            evolutionHTML = '<div class="evolution-chain"><h4>Cadena Evolutiva</h4>';
            
            // Función recursiva para procesar la cadena evolutiva
            const processEvolutionChain = (chain, level = 0) => {
                let html = '';
                const speciesName = chain.species.name;
                
                html += `<div class="evolution-item" style="margin-left: ${level * 20}px">
                    <span class="evolution-name">${speciesName}</span>
                </div>`;
                
                if (chain.evolves_to && chain.evolves_to.length > 0) {
                    chain.evolves_to.forEach(evolution => {
                        html += processEvolutionChain(evolution, level + 1);
                    });
                }
                
                return html;
            };
            
            evolutionHTML += processEvolutionChain(evolutionChain.chain);
            evolutionHTML += '</div>';
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
                
                <div class="pokemon-description">
                    <p>${description}</p>
                </div>
                
                <div class="pokemon-details">
                    <div class="detail-section">
                        <h4>Características</h4>
                        <div class="detail-item">
                            <span class="detail-label">Altura:</span>
                            <span class="detail-value">${(pokemon.height / 10).toFixed(1)} m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Peso:</span>
                            <span class="detail-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Habilidades</h4>
                        <div class="abilities-list">
                            ${abilities}
                        </div>
                    </div>
                </div>
                
                ${evolutionHTML}
                
                <div class="pokemon-stats">
                    <h4>Estadísticas Base</h4>
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

// ... existing code ...

    // Configurar búsqueda de movimientos
    const moveSearchBtn = document.getElementById('moveSearchBtn');
    const moveSearch = document.getElementById('moveSearch');
    
    if (moveSearchBtn && moveSearch) {
        moveSearchBtn.addEventListener('click', () => {
            searchMove(moveSearch.value);
        });
        
        moveSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchMove(moveSearch.value);
            }
        });
    }
    
    // Configurar paginación de habilidades
    const prevAbilities = document.getElementById('prevAbilities');
    const nextAbilities = document.getElementById('nextAbilities');
    
    if (prevAbilities && nextAbilities) {
        prevAbilities.addEventListener('click', () => {
            if (abilitiesOffset >= itemsPerPage) {
                abilitiesOffset -= itemsPerPage;
                loadAbilities();
            }
        });
        
        nextAbilities.addEventListener('click', () => {
            abilitiesOffset += itemsPerPage;
            loadAbilities();
        });
    }
    
    // Configurar paginación de movimientos
    const prevMoves = document.getElementById('prevMoves');
    const nextMoves = document.getElementById('nextMoves');
    
    if (prevMoves && nextMoves) {
        prevMoves.addEventListener('click', () => {
            if (movesOffset >= itemsPerPage) {
                movesOffset -= itemsPerPage;
                loadMoves();
            }
        });
        
        nextMoves.addEventListener('click', () => {
            movesOffset += itemsPerPage;
            loadMoves();
        });
    }
    
    // Función para cargar habilidades
    async function loadAbilities() {
        const abilitiesList = document.getElementById('abilitiesList');
        const loadingAbilities = document.getElementById('loading-abilities');
        const abilitiesPage = document.getElementById('abilitiesPage');
        
        if (!abilitiesList) return;
        
        loadingAbilities.style.display = 'flex';
        abilitiesList.innerHTML = '';
        
        try {
            const abilities = await pokeApi.getAbilities(itemsPerPage, abilitiesOffset);
            
            // Actualizar controles de paginación
            if (prevAbilities) {
                prevAbilities.disabled = abilitiesOffset === 0;
            }
            
            if (abilitiesPage) {
                const currentPage = Math.floor(abilitiesOffset / itemsPerPage) + 1;
                abilitiesPage.textContent = `Página ${currentPage}`;
            }
            
            // Crear lista de habilidades
            const abilitiesContainer = document.createElement('div');
            abilitiesContainer.className = 'abilities-grid';
            
            for (const ability of abilities.results) {
                const abilityItem = document.createElement('div');
                abilityItem.className = 'ability-card';
                abilityItem.innerHTML = `
                    <h3 class="ability-title">${ability.name}</h3>
                    <button class="view-details-btn" data-ability="${ability.name}">Ver detalles</button>
                `;
                abilitiesContainer.appendChild(abilityItem);
            }
            
            abilitiesList.innerHTML = '';
            abilitiesList.appendChild(abilitiesContainer);
            
            // Añadir event listeners a los botones de detalles
            document.querySelectorAll('.view-details-btn[data-ability]').forEach(button => {
                button.addEventListener('click', async () => {
                    const abilityName = button.getAttribute('data-ability');
                    await showAbilityDetails(abilityName);
                });
            });
            
        } catch (error) {
            console.error('Error al cargar habilidades:', error);
            abilitiesList.innerHTML = '<p class="error-message">Error al cargar habilidades. Por favor, intenta de nuevo.</p>';
        } finally {
            loadingAbilities.style.display = 'none';
        }
    }
    
    // Función para cargar movimientos
    async function loadMoves() {
        const movesList = document.getElementById('movesList');
        const loadingMoves = document.getElementById('loading-moves');
        const movesPage = document.getElementById('movesPage');
        
        if (!movesList) return;
        
        loadingMoves.style.display = 'flex';
        movesList.innerHTML = '';
        
        try {
            const moves = await pokeApi.getMoves(itemsPerPage, movesOffset);
            
            // Actualizar controles de paginación
            if (prevMoves) {
                prevMoves.disabled = movesOffset === 0;
            }
            
            if (movesPage) {
                const currentPage = Math.floor(movesOffset / itemsPerPage) + 1;
                movesPage.textContent = `Página ${currentPage}`;
            }
            
            // Crear lista de movimientos
            const movesContainer = document.createElement('div');
            movesContainer.className = 'moves-grid';
            
            for (const move of moves.results) {
                const moveItem = document.createElement('div');
                moveItem.className = 'move-card';
                moveItem.innerHTML = `
                    <h3 class="move-title">${move.name}</h3>
                    <button class="view-details-btn" data-move="${move.name}">Ver detalles</button>
                `;
                movesContainer.appendChild(moveItem);
            }
            
            movesList.innerHTML = '';
            movesList.appendChild(movesContainer);
            
            // Añadir event listeners a los botones de detalles
            document.querySelectorAll('.view-details-btn[data-move]').forEach(button => {
                button.addEventListener('click', async () => {
                    const moveName = button.getAttribute('data-move');
                    await showMoveDetails(moveName);
                });
            });
            
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            movesList.innerHTML = '<p class="error-message">Error al cargar movimientos. Por favor, intenta de nuevo.</p>';
        } finally {
            loadingMoves.style.display = 'none';
        }
    }
    
    // Función para buscar una habilidad específica
    async function searchAbility(query) {
        query = query.trim();
        if (!query) return;
        
        const abilitiesList = document.getElementById('abilitiesList');
        const loadingAbilities = document.getElementById('loading-abilities');
        
        if (!abilitiesList) return;
        
        loadingAbilities.style.display = 'flex';
        abilitiesList.innerHTML = '';
        
        try {
            const ability = await pokeApi.getAbility(query);
            if (ability) {
                await showAbilityDetails(ability.name);
            } else {
                abilitiesList.innerHTML = '<p class="error-message">No se encontró ninguna habilidad con ese nombre.</p>';
            }
        } catch (error) {
            console.error('Error al buscar habilidad:', error);
            abilitiesList.innerHTML = '<p class="error-message">Error al buscar habilidad. Por favor, intenta de nuevo.</p>';
        } finally {
            loadingAbilities.style.display = 'none';
        }
    }
    
    // Función para buscar un movimiento específico
    async function searchMove(query) {
        query = query.trim();
        if (!query) return;
        
        const movesList = document.getElementById('movesList');
        const loadingMoves = document.getElementById('loading-moves');
        
        if (!movesList) return;
        
        loadingMoves.style.display = 'flex';
        movesList.innerHTML = '';
        
        try {
            const move = await pokeApi.getMove(query);
            if (move) {
                await showMoveDetails(move.name);
            } else {
                movesList.innerHTML = '<p class="error-message">No se encontró ningún movimiento con ese nombre.</p>';
            }
        } catch (error) {
            console.error('Error al buscar movimiento:', error);
            movesList.innerHTML = '<p class="error-message">Error al buscar movimiento. Por favor, intenta de nuevo.</p>';
        } finally {
            loadingMoves.style.display = 'none';
        }
    }
    
    // Función para mostrar detalles de una habilidad
    async function showAbilityDetails(abilityName) {
        const abilitiesList = document.getElementById('abilitiesList');
        const loadingAbilities = document.getElementById('loading-abilities');
        
        if (!abilitiesList) return;
        
        loadingAbilities.style.display = 'flex';
        
        try {
            const ability = await pokeApi.getAbility(abilityName);
            
            // Obtener descripción en español
            let description = 'No hay descripción disponible en español.';
            if (ability.flavor_text_entries) {
                const spanishDesc = ability.flavor_text_entries.find(entry => entry.language.name === 'es');
                if (spanishDesc) {
                    description = spanishDesc.flavor_text;
                }
            }
            
            // Obtener nombre en español
            let abilityDisplayName = ability.name;
            if (ability.names) {
                const spanishName = ability.names.find(name => name.language.name === 'es');
                if (spanishName) {
                    abilityDisplayName = spanishName.name;
                }
            }
            
            // Crear tarjeta de detalles
            const detailsCard = document.createElement('div');
            detailsCard.className = 'ability-details-card';
            detailsCard.innerHTML = `
                <div class="ability-details-header">
                    <h3>${abilityDisplayName}</h3>
                    <button id="backToAbilities" class="back-button">Volver a la lista</button>
                </div>
                <div class="ability-details-content">
                    <p class="ability-description">${description}</p>
                    <div class="ability-pokemon">
                        <h4>Pokémon con esta habilidad:</h4>
                        <ul class="pokemon-list">
                            ${ability.pokemon.slice(0, 10).map(p => `
                                <li>${p.pokemon.name}</li>
                            `).join('')}
                            ${ability.pokemon.length > 10 ? `<li>Y ${ability.pokemon.length - 10} más...</li>` : ''}
                        </ul>
                    </div>
                </div>
            `;
            
            abilitiesList.innerHTML = '';
            abilitiesList.appendChild(detailsCard);
            
            // Añadir event listener al botón de volver
            document.getElementById('backToAbilities').addEventListener('click', () => {
                loadAbilities();
            });
            
        } catch (error) {
            console.error('Error al cargar detalles de habilidad:', error);
            abilitiesList.innerHTML = '<p class="error-message">Error al cargar detalles de habilidad. Por favor, intenta de nuevo.</p>';
        } finally {
            loadingAbilities.style.display = 'none';
        }
    }
    
    // Función para mostrar detalles de un movimiento
    async function showMoveDetails(moveName) {
        const movesList = document.getElementById('movesList');
        const loadingMoves = document.getElementById('loading-moves');
        
        if (!movesList) return;
        
        loadingMoves.style.display = 'flex';
        
        try {
            const move = await pokeApi.getMove(moveName);
            
            // Obtener descripción en español
            let description = 'No hay descripción disponible en español.';
            if (move.flavor_text_entries) {
                const spanishDesc = move.flavor_text_entries.find(entry => entry.language.name === 'es');
                if (spanishDesc) {
                    description = spanishDesc.flavor_text;
                }
            }
            
            // Obtener nombre en español
            let moveDisplayName = move.name;
            if (move.names) {
                const spanishName = move.names.find(name => name.language.name === 'es');
                if (spanishName) {
                    moveDisplayName = spanishName.name;
                }
            }
            
            // Crear tarjeta de detalles
            const detailsCard = document.createElement('div');
            detailsCard.className = 'move-details-card';
            
            // Determinar el color de fondo según el tipo
            const typeColor = move.type ? typeChart.typeColors[move.type.name] : '#777';
            
            detailsCard.innerHTML = `
                <div class="move-details-header" style="background-color: ${typeColor}">
                    <h3>${moveDisplayName}</h3>
                    <button id="backToMoves" class="back-button">Volver a la lista</button>
                </div>
                <div class="move-details-content">
                    <p class="move-description">${description}</p>
                    <div class="move-stats">
                        <div class="move-stat">
                            <span class="stat-name">Tipo:</span>
                            <span class="stat-value">${move.type ? translateType(move.type.name) : 'Desconocido'}</span>
                        </div>
                        <div class="move-stat">
                            <span class="stat-name">Categoría:</span>
                            <span class="stat-value">${move.damage_class ? move.damage_class.name : 'Desconocido'}</span>
                        </div>
                        <div class="move-stat">
                            <span class="stat-name">Potencia:</span>
                            <span class="stat-value">${move.power || '-'}</span>
                        </div>
                        <div class="move-stat">
                            <span class="stat-name">Precisión:</span>
                            <span class="stat-value">${move.accuracy || '-'}</span>
                        </div>
                        <div class="move-stat">
                            <span class="stat-name">PP:</span>
                            <span class="stat-value">${move.pp || '-'}</span>
                        </div>
                    </div>
                </div>
            `;
            
            movesList.innerHTML = '';
            movesList.appendChild(detailsCard);
            
            // Añadir event listener al botón de volver
            document.getElementById('backToMoves').addEventListener('click', () => {
                loadMoves();
            });
            
        } catch (error) {
            console.error('Error al cargar detalles de movimiento:', error);
            movesList.innerHTML = '<p class="error-message">Error al cargar detalles de movimiento. Por favor, intenta de nuevo.</p>';
        } finally {
            loadingMoves.style.display = 'none';
        }
    }