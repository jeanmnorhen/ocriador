'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// This type should match the Pydantic model in the Python backend
type Keyframe = {
  elemento_id: string;
  tipo: 'personagem' | 'objeto';
  tempo_frame: number;
  dados_pose: { x: number; y: number; rotation: number };
};

export async function createCharacter(projectId: string, formData: FormData) {
  const supabase = createClient()
  const characterName = formData.get('characterName') as string
  const spriteUrl = formData.get('spriteUrl') as string

  if (!characterName) {
    return { error: 'Character name is required' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // This should not happen if the page is protected, but as a safeguard
    return { error: 'User not authenticated' }
  }

  // The RLS policy will enforce that the user owns the project.
  const { error } = await supabase.from('personagens').insert([
    {
      projeto_id: projectId,
      user_id: user.id, // user_id is still useful for quick checks
      nome: characterName,
      sprite_url: spriteUrl,
    },
  ])

  if (error) {
    console.error('Error creating character:', error)
    return { error: error.message }
  }

  revalidatePath(`/editor/${projectId}`)
  return { success: true }
}

export async function saveKeyframe(
  projectId: string,
  elementId: string,
  elementType: 'personagem' | 'objeto',
  frame: number,
  poseData: { x: number; y: number; rotation: number }
) {
  const supabase = createClient()

  // RLS policy on keyframes table will ensure user owns the project.
  const { error } = await supabase.from('keyframes').insert([
    {
      projeto_id: projectId,
      elemento_id: elementId,
      tipo: elementType,
      tempo_frame: frame,
      dados_pose: poseData,
    },
  ])

  if (error) {
    console.error('Error saving keyframe:', error)
    return { error: error.message }
  }

  // Revalidate the page to show new keyframe data if we were displaying it
  revalidatePath(`/editor/${projectId}`)
  return { success: true }
}


// --- NEW/MODIFIED ACTIONS FOR LOCAL LLM ---

/**
 * Initiates script processing by calling the local LLM backend.
 * Returns a task ID for polling.
 */
export async function processScript(projectId: string, script: string) {
  const llmApiUrl = process.env.LOCAL_LLM_API_URL;
  const llmApiKey = process.env.LOCAL_LLM_API_KEY;

  if (!llmApiUrl || !llmApiKey) {
    console.error("Local LLM environment variables are not set.");
    return { success: false, error: "A configuração do backend de IA local está incompleta." };
  }

  try {
    const response = await fetch(`${llmApiUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': llmApiKey,
      },
      body: JSON.stringify({ script, project_id: projectId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error initiating script processing: ${response.status} ${errorBody}`);
      return { success: false, error: `Falha ao iniciar o processamento do roteiro. Status: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, taskId: data.task_id };

  } catch (error) {
    console.error("Error calling local LLM API:", error);
    return { success: false, error: "Erro ao comunicar com o serviço de IA local." };
  }
}

/**
 * Polls the local LLM backend for the result of a task.
 * If successful, it saves the keyframes to Supabase.
 */
export async function getTaskResult(projectId: string, taskId: string) {
  const llmApiUrl = process.env.LOCAL_LLM_API_URL;
  const llmApiKey = process.env.LOCAL_LLM_API_KEY;

  if (!llmApiUrl || !llmApiKey) {
    // This check is redundant if called after processScript, but good for safety
    return { status: 'FAILURE', error: "A configuração do backend de IA local está incompleta." };
  }

  try {
    const response = await fetch(`${llmApiUrl}/status/${taskId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': llmApiKey,
      },
      cache: 'no-store', // Ensure we get the latest status
    });

    if (!response.ok) {
      return { status: 'FAILURE', error: `Falha ao buscar o status da tarefa. Status: ${response.status}` };
    }

    const data = await response.json();

    if (data.status === 'SUCCESS') {
      const supabase = createClient();
      const result = data.result;
      const suggestedKeyframes: Keyframe[] = result.keyframes || [];

      // Save these suggested keyframes to the database
      for (const kf of suggestedKeyframes) {
        const { data: character } = await supabase
          .from('personagens')
          .select('id')
          .eq('id', kf.elemento_id)
          .eq('projeto_id', projectId)
          .single();

        if (character) {
          await saveKeyframe(
            projectId,
            kf.elemento_id,
            kf.tipo,
            kf.tempo_frame,
            kf.dados_pose
          );
        } else {
          console.warn(`Suggested keyframe for unknown character ID: ${kf.elemento_id}`);
        }
      }
      
      revalidatePath(`/editor/${projectId}`);
      return { status: 'SUCCESS', keyframes: suggestedKeyframes };
    }

    // Return other statuses like PENDING, RETRY, etc.
    return { status: data.status };

  } catch (error) {
    console.error("Error polling task status:", error);
    return { status: 'FAILURE', error: "Erro ao comunicar com o serviço de IA local durante a consulta." };
  }
}