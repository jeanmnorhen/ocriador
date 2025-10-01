'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

// Define the type for the data we want to expose
export type SpriteData = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};

// Define the type for the functions exposed by the ref
export type AnimationEditorHandle = {
  getSpritesData: () => SpriteData[];
};

const AnimationEditor = forwardRef<AnimationEditorHandle, AnimationEditorProps>(
  ({ project, characters }, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application>();
    // Use a ref to store sprites, mapping character ID to the PIXI.Sprite
    const spritesRef = useRef<Map<string, PIXI.Sprite>>(new Map());

    // Expose the getSpritesData function to the parent component
    useImperativeHandle(ref, () => ({
      getSpritesData: () => {
        const data: SpriteData[] = [];
        spritesRef.current.forEach((sprite, id) => {
          data.push({
            id: id,
            x: sprite.x,
            y: sprite.y,
            rotation: sprite.rotation,
          });
        });
        return data;
      },
    }));

    useEffect(() => {
      const setup = async () => {
        if (canvasRef.current && !appRef.current) {
          const app = new PIXI.Application();
          appRef.current = app;

          await app.init({
            background: '#1a1b1c',
            resizeTo: canvasRef.current,
            antialias: true,
          });

          canvasRef.current.appendChild(app.view);
        }

        const app = appRef.current;
        if (!app) return;

        // Clear old sprites before adding new ones
        spritesRef.current.clear();
        app.stage.removeChildren();

        // Load character sprites
        for (const char of characters) {
          if (char.sprite_url) {
            try {
              const texture = await PIXI.Assets.load(char.sprite_url);
              const sprite = new PIXI.Sprite(texture);
              spritesRef.current.set(char.id, sprite); // Store sprite reference

              sprite.anchor.set(0.5);
              sprite.x = Math.random() * app.screen.width;
              sprite.y = Math.random() * app.screen.height;

              sprite.eventMode = 'static';
              sprite.cursor = 'pointer';

              let dragging = false;
              sprite.on('pointerdown', () => {
                dragging = true;
                app.stage.toFront(sprite);
              });
              sprite.on('pointerup', () => dragging = false);
              sprite.on('pointerupoutside', () => dragging = false);
              sprite.on('pointermove', (event) => {
                if (dragging) {
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
      };

      setup();

      return () => {
        if (appRef.current) {
          appRef.current.destroy(false, true); // Keep canvas, remove textures
          appRef.current = undefined;
        }
      };
    }, [characters]);

    return <div ref={canvasRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />;
  }
);

AnimationEditor.displayName = 'AnimationEditor';
export default AnimationEditor;