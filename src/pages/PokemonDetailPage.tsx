import { useParams } from 'react-router-dom'
import PokemonDetail from '../components/pokemon/PokemonDetail'

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>ID de Pokémon no válido</span>
        </div>
      </div>
    )
  }
  
  return <PokemonDetail pokemonId={id} />
}