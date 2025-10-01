'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

// Define types for props
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

type AnimationEditorProps = {
  project: Project;
  characters: Character[];
};

const AnimationEditor = ({ project, characters }: AnimationEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let app: PIXI.Application;

    const setup = async () => {
      if (canvasRef.current && canvasRef.current.children.length === 0) {
        app = new PIXI.Application();

        await app.init({
          background: '#1a1b1c',
          resizeTo: canvasRef.current,
          antialias: true,
        });

        canvasRef.current.appendChild(app.view);

        // Load character sprites
        for (const char of characters) {
          if (char.sprite_url) {
            try {
              const texture = await PIXI.Assets.load(char.sprite_url);
              const sprite = new PIXI.Sprite(texture);

              sprite.anchor.set(0.5);
              sprite.x = Math.random() * app.screen.width;
              sprite.y = Math.random() * app.screen.height;

              // Make the sprite interactive
              sprite.eventMode = 'static';
              sprite.cursor = 'pointer';

              // Drag and drop logic
              let dragging = false;

              sprite.on('pointerdown', () => {
                dragging = true;
                // Bring sprite to top
                app.stage.toFront(sprite);
              });

              sprite.on('pointerup', () => {
                dragging = false;
              });

              sprite.on('pointerupoutside', () => {
                dragging = false;
              });

              sprite.on('pointermove', (event) => {
                if (dragging) {
                  // Get the new position from the event
                  const newPosition = event.data.getLocalPosition(sprite.parent);
                  sprite.x = newPosition.x;
                  sprite.y = newPosition.y;
                }
              });

              app.stage.addChild(sprite);
            } catch (e) {
              console.error(`Error loading sprite for ${char.nome}:`, e);
            }
          }
        }
      }
    };

    setup();

    return () => {
      // Cleanup logic
      if (app) {
        app.destroy(true, true);
      }
    };
  }, [characters]); // Rerun effect if characters array changes

  return <div ref={canvasRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />;
};

export default AnimationEditor;
