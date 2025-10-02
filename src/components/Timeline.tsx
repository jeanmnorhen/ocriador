'use client'

import { useState, useEffect } from 'react'; // Added useEffect1

type Keyframe = {
  id: string;
  elemento_id: string;
  tipo: 'personagem' | 'objeto';
  tempo_frame: number;
  dados_pose: { x: number; y: number; rotation: number };
};

type TimelineProps = {
  onSaveKeyframe: (frame: number) => void;
  initialKeyframes: Keyframe[];
  onFrameChange: (frame: number) => void; // New prop to notify parent of frame changes
};

export default function Timeline({ onSaveKeyframe, initialKeyframes, onFrameChange }: TimelineProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxFrame = Math.max(...initialKeyframes.map(kf => kf.tempo_frame), 0, 100); // Max frame in keyframes or a default

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (isPlaying) {
        setCurrentFrame((prevFrame) => {
          const nextFrame = prevFrame + 1;
          if (nextFrame > maxFrame) {
            setIsPlaying(false); // Stop if end of timeline
            return 0; // Reset to start
          }
          onFrameChange(nextFrame); // Notify parent
          return nextFrame;
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, maxFrame, onFrameChange]);

  const handleSave = () => {
    onSaveKeyframe(currentFrame);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
    onFrameChange(0); // Notify parent
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
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Timeline</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <label>Frame Atual: </label>
          <input
            type="number"
            value={currentFrame}
            onChange={(e) => {
              const newFrame = Number(e.target.value);
              setCurrentFrame(newFrame);
              onFrameChange(newFrame); // Notify parent
            }}
            style={{ width: '80px', background: '#333', color: 'white', border: '1px solid #555' }}
          />
        </div>
        <button
          onClick={handleSave}
          style={{ background: 'blue', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Salvar Keyframe
        </button>
        <button
          onClick={handlePlayPause}
          style={{ background: isPlaying ? 'orange' : 'green', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleStop}
          style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Stop
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
