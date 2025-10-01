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

type Keyframe = {
  id: string;
  elemento_id: string;
  tipo: 'personagem' | 'objeto';
  tempo_frame: number;
  dados_pose: { x: number; y: number; rotation: number };
};

type AnimationEditorProps = {
  project: Project;
  characters: Character[];
  initialKeyframes: Keyframe[];
  currentFrame: number; // Added this
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
  ({ project, characters, initialKeyframes, currentFrame }, ref) => { // Added currentFrame
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application>();
    const spritesRef = useRef<Map<string, PIXI.Sprite>>(new Map());

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

        // Clear old sprites before adding new ones if characters change
        // But keep sprites if only currentFrame changes
        if (spritesRef.current.size === 0 || characters.length !== spritesRef.current.size) {
            spritesRef.current.clear();
            app.stage.removeChildren();

            // Load character sprites
            for (const char of characters) {
                if (char.sprite_url) {
                    try {
                        const texture = await PIXI.Assets.load(char.sprite_url);
                        const sprite = new PIXI.Sprite(texture);
                        spritesRef.current.set(char.id, sprite);

                        sprite.anchor.set(0.5);

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
        }

        // Apply pose based on currentFrame
        for (const char of characters) {
            const sprite = spritesRef.current.get(char.id);
            if (!sprite) continue;

            const characterKeyframes = initialKeyframes
                .filter(kf => kf.elemento_id === char.id)
                .sort((a, b) => a.tempo_frame - b.tempo_frame);

            if (characterKeyframes.length === 0) {
                // If no keyframes, set a default or random position (only once)
                if (sprite.x === 0 && sprite.y === 0) { // Check if it's still at default 0,0
                    sprite.x = Math.random() * app.screen.width;
                    sprite.y = Math.random() * app.screen.height;
                    sprite.rotation = 0;
                }
                continue;
            }

            // Find the two nearest keyframes
            let kfBefore: Keyframe | undefined;
            let kfAfter: Keyframe | undefined;

            for (let i = 0; i < characterKeyframes.length; i++) {
                if (characterKeyframes[i].tempo_frame <= currentFrame) {
                    kfBefore = characterKeyframes[i];
                }
                if (characterKeyframes[i].tempo_frame >= currentFrame) {
                    kfAfter = characterKeyframes[i];
                    break;
                }
            }

            if (!kfBefore && kfAfter) { // Before first keyframe, use first keyframe's pose
                sprite.x = kfAfter.dados_pose.x;
                sprite.y = kfAfter.dados_pose.y;
                sprite.rotation = kfAfter.dados_pose.rotation;
            } else if (kfBefore && !kfAfter) { // After last keyframe, use last keyframe's pose
                sprite.x = kfBefore.dados_pose.x;
                sprite.y = kfBefore.dados_pose.y;
                sprite.rotation = kfBefore.dados_pose.rotation;
            } else if (kfBefore && kfAfter && kfBefore.id !== kfAfter.id) { // Interpolate
                const t = (currentFrame - kfBefore.tempo_frame) / (kfAfter.tempo_frame - kfBefore.tempo_frame);
                sprite.x = kfBefore.dados_pose.x + (kfAfter.dados_pose.x - kfBefore.dados_pose.x) * t;
                sprite.y = kfBefore.dados_pose.y + (kfAfter.dados_pose.y - kfBefore.dados_pose.y) * t;
                sprite.rotation = kfBefore.dados_pose.rotation + (kfAfter.dados_pose.rotation - kfBefore.dados_pose.rotation) * t;
            } else if (kfBefore && kfAfter && kfBefore.id === kfAfter.id) { // Exactly on a keyframe
                sprite.x = kfBefore.dados_pose.x;
                sprite.y = kfBefore.dados_pose.y;
                sprite.rotation = kfBefore.dados_pose.rotation;
            }
        }
      };

      setup();

      return () => {
        if (appRef.current) {
          appRef.current.destroy(false, true);
          appRef.current = undefined;
        }
      };
    }, [characters, initialKeyframes, currentFrame]); // Rerun effect if characters, keyframes, or currentFrame change

    return <div ref={canvasRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />;
  }
);

AnimationEditor.displayName = 'AnimationEditor';
export default AnimationEditor;