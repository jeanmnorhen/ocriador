'use client'

import { useState } from 'react';

type Keyframe = {
  id: string;
  elemento_id: string;
  tipo: 'personagem' | 'objeto';
  tempo_frame: number;
  dados_pose: { x: number; y: number; rotation: number };
};

type TimelineProps = {
  onSaveKeyframe: (frame: number) => void;
  initialKeyframes: Keyframe[]; // Added this
};

export default function Timeline({ onSaveKeyframe, initialKeyframes }: TimelineProps) { // Added initialKeyframes
  const [currentFrame, setCurrentFrame] = useState(0);

  const handleSave = () => {
    onSaveKeyframe(currentFrame);
  };

  // Get unique frame numbers that have keyframes
  const framesWithKeyframes = Array.from(new Set(initialKeyframes.map(kf => kf.tempo_frame))).sort((a, b) => a - b);

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '150px',
      background: '#252526',
      color: 'white',
      borderTop: '1px solid #444',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column', // Changed to column for better layout
      gap: '0.5rem'
    }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Timeline</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <label>Frame Atual: </label>
          <input
            type="number"
            value={currentFrame}
            onChange={(e) => setCurrentFrame(Number(e.target.value))}
            style={{ width: '80px', background: '#333', color: 'white', border: '1px solid #555' }}
          />
        </div>
        <button
          onClick={handleSave}
          style={{ background: 'blue', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Salvar Keyframe
        </button>
      </div>
      
      <div style={{ marginTop: '0.5rem' }}>
        <h4>Keyframes Salvos:</h4>
        {framesWithKeyframes.length > 0 ? (
          <p>{framesWithKeyframes.join(', ')}</p>
        ) : (
          <p>Nenhum keyframe salvo ainda.</p>
        )}
      </div>
    </div>
  );
}