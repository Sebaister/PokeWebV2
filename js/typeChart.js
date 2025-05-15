/**
 * Clase para manejar la tabla de tipos Pokémon
 */
class TypeChart {
    constructor() {
        this.typeEffectiveness = {};
        this.currentGen = 8; // Por defecto, generación actual
        this.typeColors = {
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
    }

    /**
     * Inicializa la tabla de tipos
     */
    async initialize() {
        try {
            document.getElementById('loading-spinner').style.display = 'flex';
            
            // Obtener todos los tipos
            const typesData = await pokeApi.getTypes();
            const types = typesData.filter(type => type.name !== 'unknown' && type.name !== 'shadow')
                                  .map(type => type.name);
            
            // Obtener detalles de cada tipo
            for (const type of types) {
                const typeDetails = await pokeApi.getTypeDetails(type);
                this.processTypeRelations(type, typeDetails);
            }
            
            // Renderizar la tabla
            this.renderTypeChart(types);
            
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('typeChart').style.display = 'table';
        } catch (error) {
            console.error('Error al inicializar la tabla de tipos:', error);
            document.getElementById('loading-spinner').innerHTML = 
                '<p>Error al cargar los datos. Por favor, intenta de nuevo.</p>';
        }
    }

    /**
     * Procesa las relaciones de tipos
     */
    processTypeRelations(typeName, typeDetails) {
        if (!this.typeEffectiveness[typeName]) {
            this.typeEffectiveness[typeName] = {};
        }
        
        // Inicializar todas las efectividades a 1 (normal)
        const allTypes = Object.keys(this.typeColors);
        for (const targetType of allTypes) {
            this.typeEffectiveness[typeName][targetType] = 1;
        }
        
        // Procesar daño doble
        for (const relation of typeDetails.damage_relations.double_damage_to) {
            this.typeEffectiveness[typeName][relation.name] = 2;
        }
        
        // Procesar daño mitad
        for (const relation of typeDetails.damage_relations.half_damage_to) {
            this.typeEffectiveness[typeName][relation.name] = 0.5;
        }
        
        // Procesar sin daño
        for (const relation of typeDetails.damage_relations.no_damage_to) {
            this.typeEffectiveness[typeName][relation.name] = 0;
        }
    }

    /**
     * Renderiza la tabla de tipos
     */
    renderTypeChart(types) {
        const chartElement = document.getElementById('typeChart');
        chartElement.innerHTML = '';
        
        // Crear encabezado
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Celda vacía en la esquina
        
        for (const type of types) {
            const th = document.createElement('th');
            th.className = 'type-cell type-header';
            th.style.backgroundColor = this.typeColors[type];
            th.style.color = this.getContrastColor(this.typeColors[type]);
            
            const typeSpan = document.createElement('span');
            typeSpan.textContent = this.capitalizeFirstLetter(type);
            typeSpan.style.writingMode = 'vertical-rl';
            typeSpan.style.transform = 'rotate(180deg)';
            typeSpan.style.padding = '5px';
            
            th.appendChild(typeSpan);
            headerRow.appendChild(th);
        }
        
        chartElement.appendChild(headerRow);
        
        // Crear filas para cada tipo
        for (const attackType of types) {
            const row = document.createElement('tr');
            
            // Celda de encabezado de fila
            const rowHeader = document.createElement('th');
            rowHeader.className = 'type-cell type-header';
            rowHeader.textContent = this.capitalizeFirstLetter(attackType);
            rowHeader.style.backgroundColor = this.typeColors[attackType];
            rowHeader.style.color = this.getContrastColor(this.typeColors[attackType]);
            row.appendChild(rowHeader);
            
            // Celdas de efectividad
            for (const defenseType of types) {
                const effectiveness = this.typeEffectiveness[attackType][defenseType];
                const td = document.createElement('td');
                td.className = `type-cell effectiveness-${this.getEffectivenessClass(effectiveness)}`;
                
                // Mostrar el multiplicador
                if (effectiveness === 0) {
                    td.textContent = '0';
                } else if (effectiveness === 0.25) {
                    td.textContent = '¼';
                } else if (effectiveness === 0.5) {
                    td.textContent = '½';
                } else if (effectiveness === 1) {
                    td.textContent = '1';
                } else if (effectiveness === 2) {
                    td.textContent = '2';
                } else if (effectiveness === 4) {
                    td.textContent = '4';
                }
                
                row.appendChild(td);
            }
            
            chartElement.appendChild(row);
        }
    }

    /**
     * Obtiene la clase CSS para un valor de efectividad
     */
    getEffectivenessClass(value) {
        if (value === 0) return '0';
        if (value === 0.25) return '0-25';
        if (value === 0.5) return '0-5';
        if (value === 1) return '1';
        if (value === 2) return '2';
        if (value === 4) return '4';
        return '1';
    }

    /**
     * Cambia la generación actual
     */
    changeGeneration(gen) {
        this.currentGen = gen;
        // Aquí implementarías los cambios específicos de cada generación
        // Por ejemplo, en Gen 1 no existían los tipos Acero y Siniestro
        // En Gen 6 se añadió el tipo Hada
        
        // Por ahora, simplemente reinicializamos la tabla
        this.initialize();
    }

    /**
     * Capitaliza la primera letra de un string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Determina si se debe usar texto claro u oscuro según el color de fondo
     */
    getContrastColor(hexColor) {
        // Convertir hex a RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calcular luminosidad
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Usar texto blanco para fondos oscuros y negro para fondos claros
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
}

// Crear instancia global
const typeChart = new TypeChart();