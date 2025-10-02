'use client'

import { useRef, useState } from 'react';
import AnimationEditor, { type AnimationEditorHandle } from '@/components/AnimationEditor';
import CharacterPanel from '@/components/CharacterPanel';
import Timeline from '@/components/Timeline';
import { saveKeyframe, processScript, getTaskResult } from './actions';

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
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // For loading state
  const [processingStatus, setProcessingStatus] = useState(''); // For user feedback

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
    if (isProcessing) {
      alert('Aguarde o processamento atual terminar.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Enviando roteiro para o processador de IA...');
    
    const result = await processScript(project.id, scriptInput);

    if (result.success && result.taskId) {
      setProcessingStatus(`Processamento iniciado. Aguardando resultado...`);
      
      // Polling function
      const poll = async () => {
        const taskResult = await getTaskResult(project.id, result.taskId!);
        if (taskResult.status === 'SUCCESS') {
          setProcessingStatus('Roteiro processado e keyframes salvos!');
          setIsProcessing(false);
          alert('Roteiro processado com sucesso!'); // Simple feedback
          // The page will auto-refresh due to revalidatePath
        } else if (taskResult.status === 'FAILURE') {
          setProcessingStatus(`Erro: ${taskResult.error || 'Falha no processamento.'}`);
          setIsProcessing(false);
        } else {
          // If still pending, poll again after 2 seconds
          setTimeout(poll, 2000);
        }
      };
      
      // Start the first poll
      setTimeout(poll, 2000);

    } else {
      setProcessingStatus(`Erro ao iniciar: ${result.error}`);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '300px', borderRight: '1px solid #444' }}>
        <CharacterPanel projectId={project.id} characters={initialCharacters} />
        <div style={{ background: '#252526', color: 'white', padding: '1rem', marginTop: '1rem', flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
            Roteiro (LLM Local)
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
            disabled={isProcessing}
            style={{
              width: '100%',
              background: isProcessing ? '#555' : 'purple',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processando...' : 'Processar Roteiro'}
          </button>
          {processingStatus && <p style={{ marginTop: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>{processingStatus}</p>}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem', background: '#222', color: 'white' }}>
          <h1>Editor: {project.nome}</h1>
        </header>
        <main style={{ flex: 1, position: 'relative' }}>
          <AnimationEditor ref={editorRef} project={project} characters={initialCharacters} initialKeyframes={initialKeyframes} currentFrame={currentFrame} />
          <Timeline onSaveKeyframe={handleSaveKeyframe} initialKeyframes={initialKeyframes} onFrameChange={setCurrentFrame} />
        </main>
      </div>
    </div>
  );
}