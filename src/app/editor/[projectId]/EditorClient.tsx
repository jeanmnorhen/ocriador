'use client'

import { useRef, useState } from 'react';
import AnimationEditor, { type AnimationEditorHandle, type SpriteData } from '@/components/AnimationEditor';
import CharacterPanel from '@/components/CharacterPanel';
import Timeline from '@/components/Timeline';
import { saveKeyframe, processScript } from './actions';

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
  initialKeyframes: Keyframe[];
};

export default function EditorClient({ project, initialCharacters, initialKeyframes }: EditorClientProps) {
  const editorRef = useRef<AnimationEditorHandle>(null);
  const [scriptInput, setScriptInput] = useState('');
  const [currentFrame, setCurrentFrame] = useState(0); // New state for current frame

  const handleSaveKeyframe = async (frame: number) => {
    if (!editorRef.current) return;

    const spritesData = editorRef.current.getSpritesData();
    console.log(`Saving keyframe ${frame} for ${spritesData.length} sprites...`);

    for (const sprite of spritesData) {
      const poseData = { x: sprite.x, y: sprite.y, rotation: sprite.rotation };
      await saveKeyframe(project.id, sprite.id, 'personagem', frame, poseData);
    }

    alert(`Keyframe ${frame} salvo!`);
  };

  const handleProcessScript = async () => {
    if (!scriptInput.trim()) {
      alert('Por favor, insira um roteiro para processar.');
      return;
    }
    console.log('Processing script:', scriptInput);
    const result = await processScript(project.id, scriptInput);
    if (result.success) {
      alert(result.message);
      console.log('Suggested Keyframes from Gemini:', result.suggestedKeyframes);
    } else {
      alert(`Erro ao processar roteiro: ${result.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '300px', borderRight: '1px solid #444' }}>
        <CharacterPanel projectId={project.id} characters={initialCharacters} />
        <div style={{ background: '#252526', color: 'white', padding: '1rem', marginTop: '1rem', flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
            Roteiro Gemini
          </h2>
          <textarea
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            placeholder="Insira seu roteiro aqui..."
            rows={10}
            style={{ width: '100%', background: '#333', color: 'white', border: '1px solid #555', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <button
            onClick={handleProcessScript}
            style={{ width: '100%', background: 'purple', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Processar Roteiro
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem', background: '#222', color: 'white' }}>
          <h1>Editor: {project.nome}</h1>
        </header>
        <main style={{ flex: 1, position: 'relative' }}>
          <AnimationEditor ref={editorRef} project={project} characters={initialCharacters} initialKeyframes={initialKeyframes} currentFrame={currentFrame} /> {/* Passed currentFrame */}
          <Timeline onSaveKeyframe={handleSaveKeyframe} initialKeyframes={initialKeyframes} onFrameChange={setCurrentFrame} /> {/* Passed onFrameChange */}
        </main>
      </div>
    </div>
  );
}