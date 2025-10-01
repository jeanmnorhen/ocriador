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
};

type AnimationEditorProps = {
  project: Project;
  characters: Character[];
};

const AnimationEditor = ({ project, characters }: AnimationEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Evita a recriação do canvas em HMR (Hot Module Replacement)
    if (canvasRef.current && canvasRef.current.children.length === 0) {
      const app = new PIXI.Application();

      // Inicializa a aplicação PixiJS com fundo transparente e ajusta ao container
      app.init({
        background: '#1a1b1c',
        resizeTo: canvasRef.current,
        antialias: true,
      }).then(() => {
        // Adiciona o canvas ao DOM
        canvasRef.current?.appendChild(app.view);

        // Exemplo: Adiciona um texto para confirmar que o PixiJS está funcionando
        const text = new PIXI.Text({
            text: project.nome,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xeeeeee,
                align: 'center',
            }
        });
        text.anchor.set(0.5);
        text.x = app.screen.width / 2;
        text.y = app.screen.height / 2;
        app.stage.addChild(text);
      });

      // Limpeza ao desmontar o componente
      return () => {
        app.destroy(true, true);
      };
    }
  }, []);

  return <div ref={canvasRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />;
};

export default AnimationEditor;
