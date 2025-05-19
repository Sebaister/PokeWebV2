import { motion } from 'framer-motion';

interface Stat {
  name: string;
  value: number;
}

interface PokemonStatsProps {
  stats: Stat[];
}

// Función para traducir nombres de estadísticas
function translateStatName(name: string): string {
  const translations: Record<string, string> = {
    'hp': 'PS',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'Ataque Esp.',
    'special-defense': 'Defensa Esp.',
    'speed': 'Velocidad'
  };
  
  return translations[name] || name;
}

// Función para determinar el color de la barra según el valor
function getStatColor(value: number): string {
  if (value < 50) return 'bg-red-500';
  if (value < 80) return 'bg-yellow-500';
  if (value < 100) return 'bg-green-500';
  return 'bg-blue-500';
}

export default function PokemonStats({ stats }: PokemonStatsProps) {
  // Ordenar las estadísticas en un orden específico
  const orderedStats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  const sortedStats = [...stats].sort((a, b) => 
    orderedStats.indexOf(a.name) - orderedStats.indexOf(b.name)
  );
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Estadísticas</h2>
        <div className="space-y-3">
          {sortedStats.map((stat, index) => (
            <div key={stat.name} className="stat-row">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{translateStatName(stat.name)}</span>
                <span className="text-sm font-medium">{stat.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stat.value / 255) * 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-2.5 rounded-full ${getStatColor(stat.value)}`}
                ></motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}