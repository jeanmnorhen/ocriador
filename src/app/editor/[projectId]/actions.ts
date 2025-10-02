'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation' // Added redirect import
import { GoogleGenerativeAI } from '@google/generative-ai'; // Added Gemini import

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
  poseData: any
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

export async function processScript(projectId: string, script: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Initialize Gemini

  const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use gemini-pro model

  const prompt = `Analyze the following animation script and suggest initial positions (x, y, rotation) for characters at frame 0.
  
  Script: "${script}"
  
  Provide the output as a JSON array of objects, where each object has:
  - elemento_id: The ID of the character (string). This ID must match an existing character ID in the project.
  - tipo: "personagem" (string).
  - tempo_frame: 0 (number).
  - dados_pose: { x: number, y: number, rotation: number } (object).
  
  Example output:
  [
    { "elemento_id": "character-id-1", "tipo": "personagem", "tempo_frame": 0, "dados_pose": { "x": 100, "y": 200, "rotation": 0 } },
    { "elemento_id": "character-id-2", "tipo": "personagem", "tempo_frame": 0, "dados_pose": { "x": 300, "y": 150, "rotation": 15 } }
  ]
  If no characters are mentioned or positions can't be inferred, return an empty array.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the JSON output from Gemini
    let suggestedKeyframes: any[] = [];
    try {
      suggestedKeyframes = JSON.parse(text);
      // Basic validation
      if (!Array.isArray(suggestedKeyframes)) {
        throw new Error("Gemini response is not an array.");
      }
      suggestedKeyframes = suggestedKeyframes.filter(kf => 
        kf.elemento_id && kf.tipo === "personagem" && kf.tempo_frame === 0 && kf.dados_pose
      );
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Gemini raw response:", text);
      return { success: false, error: "Failed to parse Gemini's suggested keyframes." };
    }

    // Save these suggested keyframes to the database
    for (const kf of suggestedKeyframes) {
      // Ensure the element_id exists in the project's characters
      // This is a basic check, more robust validation might be needed
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
          kf.tipo, // 'personagem' or 'objeto'
          kf.tempo_frame,
          kf.dados_pose
        );
      } else {
        console.warn(`Suggested keyframe for unknown character ID: ${kf.elemento_id}`);
      }
    }

    revalidatePath(`/editor/${projectId}`); // Revalidate to show new keyframes

    return {
      success: true,
      message: "Roteiro processado com sucesso pelo Gemini e keyframes salvos.",
      suggestedKeyframes: suggestedKeyframes,
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { success: false, error: "Erro ao comunicar com a API do Gemini." };
  }
}