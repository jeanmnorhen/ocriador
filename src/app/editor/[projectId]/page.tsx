import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AnimationEditor from '@/components/AnimationEditor'

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

  // Fetch the project from the database
  const { data: project, error } = await supabase
    .from('projetos')
    .select('id, nome, user_id')
    .eq('id', projectId)
    .single()

  // If project not found or user does not have access, redirect
  if (error || !project || project.user_id !== user.id) {
    console.error('Error fetching project or unauthorized access:', error)
    redirect('/') // Redirect to dashboard
  }

  // TODO: Fetch characters, objects, and keyframes for this project
  // const { data: characters } = await supabase.from('personagens')...
  
  return (
    <div>
      <header style={{ padding: '1rem', background: '#222', color: 'white' }}>
        <h1>Editor: {project.nome}</h1>
        {/* We can add a back button or other controls here */}
      </header>
      <main>
        {/* Pass project data to the editor */}
        <AnimationEditor project={project} />
      </main>
    </div>
  )
}
