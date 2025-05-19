import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

interface NavbarProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev)
  }

  return (
    <header className="bg-gradient-to-r from-pokeblue to-pokepurple text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              <i className="fas fa-pokeball"></i>
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pokeyellow to-pokered bg-clip-text text-transparent">
              PokéDex 2025
            </h1>
          </Link>

          {/* Navegación para escritorio */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({isActive}) => 
              isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
            }>
              Pokédex
            </NavLink>
            <NavLink to="/types" className={({isActive}) => 
              isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
            }>
              Tipos
            </NavLink>
            <NavLink to="/abilities" className={({isActive}) => 
              isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
            }>
              Habilidades
            </NavLink>
            <NavLink to="/moves" className={({isActive}) => 
              isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
            }>
              Movimientos
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {darkMode ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>

            {/* Botón de menú móvil */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={toggleMenu}
              aria-label="Menú"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <ul className="flex flex-col gap-4">
              <li>
                <NavLink 
                  to="/" 
                  className={({isActive}) => 
                    isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pokédex
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/types" 
                  className={({isActive}) => 
                    isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tipos
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/abilities" 
                  className={({isActive}) => 
                    isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Habilidades
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/moves" 
                  className={({isActive}) => 
                    isActive ? "font-bold text-pokeyellow" : "hover:text-pokeyellow transition-colors"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Movimientos
                </NavLink>
              </li>
            </ul>
          </motion.nav>
        )}
      </div>
    </header>
  )
}