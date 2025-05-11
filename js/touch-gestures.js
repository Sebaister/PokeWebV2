// Implementación de gestos táctiles para navegación en dispositivos móviles
document.addEventListener('DOMContentLoaded', () => {
    const pokedexContainer = document.querySelector('.pokedex-container');
    const ui = window.pokedexUI; // Acceder a la instancia de UI
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Configuración de sensibilidad del swipe
    const minSwipeDistance = 50;
    
    // Eventos táctiles
    pokedexContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    pokedexContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // Manejar el gesto de swipe
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) < minSwipeDistance) return;
        
        if (swipeDistance > 0) {
            // Swipe derecha (Pokémon anterior)
            document.getElementById('prev-btn').click();
        } else {
            // Swipe izquierda (Pokémon siguiente)
            document.getElementById('next-btn').click();
        }
    }
    
    // Implementar doble tap para búsqueda
    let lastTap = 0;
    pokedexContainer.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Doble tap detectado
            document.getElementById('search-input').focus();
            e.preventDefault();
        }
        
        lastTap = currentTime;
    });
    
    // Implementar pinch zoom para la imagen del Pokémon
    const pokemonImage = document.getElementById('pokemon-image');
    let initialDistance = 0;
    let currentScale = 1;
    
    pokemonImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches[0], e.touches[1]);
        }
    });
    
    pokemonImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const newScale = currentScale * (currentDistance / initialDistance);
            
            // Limitar el zoom
            if (newScale > 0.5 && newScale < 3) {
                pokemonImage.style.transform = `scale(${newScale})`;
            }
        }
    });
    
    pokemonImage.addEventListener('touchend', () => {
        if (pokemonImage.style.transform) {
            currentScale = parseFloat(pokemonImage.style.transform.replace('scale(', '').replace(')', ''));
        }
    });
    
    // Calcular distancia entre dos puntos táctiles
    function getDistance(touch1, touch2) {
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }
});