'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
