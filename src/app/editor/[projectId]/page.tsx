import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AnimationEditor from '@/components/AnimationEditor'
import CharacterPanel from '@/components/CharacterPanel' // Import the new panel

type EditorPageProps = {
  params: {
    projectId: string
  }
}

export default async function EditorPage({ params }: EditorPageProps) {
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
    .select('id, nome')
    .eq('projeto_id', projectId)

  // The page can still render even if characters fail to load
  if (charactersError) {
    console.error("Error fetching characters:", charactersError);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111' }}>
      <CharacterPanel projectId={project.id} characters={characters || []} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem', background: '#222', color: 'white' }}>
          <h1>Editor: {project.nome}</h1>
        </header>
        <main style={{ flex: 1, position: 'relative' }}>
          {/* The editor will now need to handle its own size */}
          <AnimationEditor project={project} characters={characters || []} />
        </main>
      </div>
    </div>
  )
}