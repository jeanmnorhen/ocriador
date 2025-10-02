import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditorClient from './EditorClient' // Import the new client component
import type { PageProps } from 'next' // Import PageProps

export default async function EditorPage({
  params,
  searchParams,
}: PageProps<{ projectId: string }>) {
  const supabase = createClient()
  const { projectId } = params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch the project
  const { data: project, error: projectError } = await supabase
    .from('projetos')
    .select('id, nome, user_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project || project.user_id !== user.id) {
    redirect('/')
  }

  // Fetch characters for the project
  const { data: characters, error: charactersError } = await supabase
    .from('personagens')
    .select('id, nome, sprite_url')
    .eq('projeto_id', projectId)

  if (charactersError) {
    console.error("Error fetching characters:", charactersError);
  }

  // Fetch keyframes for the project
  const { data: keyframes, error: keyframesError } = await supabase
    .from('keyframes')
    .select('id, elemento_id, tipo, tempo_frame, dados_pose')
    .eq('projeto_id', projectId)
    .order('tempo_frame', { ascending: true }); // Order by frame for easier processing

  if (keyframesError) {
    console.error("Error fetching keyframes:", keyframesError);
  }

  return <EditorClient project={project} initialCharacters={characters || []} initialKeyframes={keyframes || []} />;
}