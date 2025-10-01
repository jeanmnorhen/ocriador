'use client'

import { useState } from 'react';

type TimelineProps = {
  onSaveKeyframe: (frame: number) => void;
};

export default function Timeline({ onSaveKeyframe }: TimelineProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  const handleSave = () => {
    onSaveKeyframe(currentFrame);
  };

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
      alignItems: 'center',
      gap: '1rem'
    }}>
      <h3>Timeline</h3>
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
  );
}
