'use client'

import { createCharacter } from '@/app/editor/[projectId]/actions'
import { useFormState } from 'react-dom'

// Define types for props
type Character = {
  id: string;
  nome: string;
  // Add other character properties here later
};

type CharacterPanelProps = {
  projectId: string;
  characters: Character[];
};

export default function CharacterPanel({ projectId, characters }: CharacterPanelProps) {
  // Bind projectId to the server action
  const createCharacterWithId = createCharacter.bind(null, projectId);

  // For handling form state, e.g., showing errors
  const [state, formAction] = useFormState(createCharacterWithId, null);

  return (
    <div style={{ background: '#252526', color: 'white', padding: '1rem', width: '300px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
        Personagens
      </h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <form action={formAction}>
          <input
            name="characterName"
            type="text"
            placeholder="Nome do personagem"
            required
            style={{ width: '100%', padding: '0.5rem', background: '#333', border: '1px solid #555', color: 'white', marginBottom: '0.5rem' }}
          />
          <input
            name="spriteUrl"
            type="text"
            placeholder="URL do sprite"
            defaultValue="https://placehold.co/100x200.png"
            style={{ width: '100%', padding: '0.5rem', background: '#333', border: '1px solid #555', color: 'white', marginBottom: '0.5rem' }}
          />
          <button 
            type="submit"
            style={{ width: '100%', background: 'green', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Adicionar Personagem
          </button>
          {state?.error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{state.error}</p>}
        </form>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {characters && characters.length > 0 ? (
          characters.map((char) => (
            <li key={char.id} style={{ background: '#3a3a3a', padding: '0.75rem', borderRadius: '3px', marginBottom: '0.5rem' }}>
              {char.nome}
            </li>
          ))
        ) : (
          <p>Nenhum personagem neste projeto ainda.</p>
        )}
      </ul>
    </div>
  );
}
