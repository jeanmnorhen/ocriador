import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AnimationEditor from '@/components/AnimationEditor'
import { logout } from './logout/actions'

export default async function Home() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div>
      <header style={{ padding: '1rem', background: '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'white' }}>Bem-vindo, {data.user.email}</p>
        <form>
          <button formAction={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Logout
          </button>
        </form>
      </header>
      <main>
        <AnimationEditor />
      </main>
    </div>
  )
}