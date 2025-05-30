import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header() {
  return (
    <header className="bg-base-200 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="./favicon.svg" alt="PokéDex" className="w-8 h-8" />
            <h1 className="text-xl font-bold">PokéDex 2025</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <Link to="/pokemon" className="hover:text-primary">Pokémon</Link>
            <Link to="/types" className="hover:text-primary">Tipos</Link>
            <Link to="/abilities" className="hover:text-primary">Habilidades</Link>
            <Link to="/moves" className="hover:text-primary">Movimientos</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}