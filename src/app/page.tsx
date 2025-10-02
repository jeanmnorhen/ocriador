import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from './logout/actions'
import { createProject } from './actions'

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: { error: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects } = await supabase
    .from('projetos')
    .select('id, nome')
    .eq('user_id', user.id)

  return (
    <div style={{ padding: '2rem', color: 'white', background: '#111', minHeight: '100vh' }}>
      <header style={{ padding: '1rem', background: '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p>Bem-vindo, {user.email}</p>
        <form>
          <button formAction={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Logout
          </button>
        </form>
      </header>

      <main>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Seus Projetos</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <form>
            <input 
              name="projectName" 
              type="text" 
              placeholder="Nome do novo projeto" 
              required 
              style={{ padding: '0.5rem', background: '#333', border: '1px solid #555', color: 'white' }}
            />
                        <button
                          formAction={createProject}
                          style={{ background: 'green', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', marginLeft: '0.5rem' }}
                        >
                          Criar Projeto
                        </button>
                      </form>
                      {searchParams?.error && (
                        <p style={{ color: 'red', marginTop: '0.5rem' }}>
                          {decodeURIComponent(searchParams.error)}
                        </p>
                      )}
                    </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <Link key={project.id} href={`/editor/${project.id}`} style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '5px', textDecoration: 'none', color: 'white' }}>
                <h3>{project.nome}</h3>
              </Link>
            ))
          ) : (
            <p>Você ainda não tem projetos.</p>
          )}
        </div>
      </main>
    </div>
  )
}
