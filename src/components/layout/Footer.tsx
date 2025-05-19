export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2023 PokéDex 2025 - Desarrollado por Seba</p>
        <p className="mt-2">
          Datos obtenidos de{' '}
          <a 
            href="https://pokeapi.co/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pokeyellow hover:underline"
          >
            PokeAPI
          </a>
        </p>
      </div>
    </footer>
  )
}