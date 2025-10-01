'use client'

import { useRef } from 'react';
import AnimationEditor, { type AnimationEditorHandle, type SpriteData } from '@/components/AnimationEditor';
import CharacterPanel from '@/components/CharacterPanel';
import Timeline from '@/components/Timeline';
import { saveKeyframe } from './actions';

// These types can be moved to a shared types file later
type Project = {
  id: string;
  nome: string;
  user_id: string;
};

type Character = {
  id: string;
  nome: string;
  sprite_url: string | null;
};

type Keyframe = {
  id: string;
  elemento_id: string;
  tipo: 'personagem' | 'objeto';
  tempo_frame: number;
  dados_pose: { x: number; y: number; rotation: number };
};

type EditorClientProps = {
  project: Project;
  initialCharacters: Character[];
  initialKeyframes: Keyframe[]; // Added this
};

export default function EditorClient({ project, initialCharacters, initialKeyframes }: EditorClientProps) { // Added initialKeyframes
  const editorRef = useRef<AnimationEditorHandle>(null);

  const handleSaveKeyframe = async (frame: number) => {
    if (!editorRef.current) return;

    const spritesData = editorRef.current.getSpritesData();
    console.log(`Saving keyframe ${frame} for ${spritesData.length} sprites...`);

    // Call the server action for each sprite
    for (const sprite of spritesData) {
      const poseData = { x: sprite.x, y: sprite.y, rotation: sprite.rotation };
      // We are only handling characters for now
      await saveKeyframe(project.id, sprite.id, 'personagem', frame, poseData);
    }

    // TODO: Add user feedback (e.g., a toast notification)
    alert(`Keyframe ${frame} salvo!`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111' }}>
      <CharacterPanel projectId={project.id} characters={initialCharacters} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem', background: '#222', color: 'white' }}>
          <h1>Editor: {project.nome}</h1>
        </header>
        <main style={{ flex: 1, position: 'relative' }}>
          <AnimationEditor ref={editorRef} project={project} characters={initialCharacters} initialKeyframes={initialKeyframes} /> {/* Passed initialKeyframes */}
          <Timeline onSaveKeyframe={handleSaveKeyframe} initialKeyframes={initialKeyframes} /> {/* Passed initialKeyframes */}
        </main>
      </div>
    </div>
  );
}