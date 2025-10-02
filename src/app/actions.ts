'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const projectName = formData.get('projectName') as string

  if (!projectName) {
    // Handle error: project name is required
    return
  }

  const { data, error } = await supabase
    .from('projetos')
    .insert([{ nome: projectName, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    redirect(`/?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  redirect(`/editor/${data.id}`)
}
