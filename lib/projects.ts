import { getSupabase } from './supabase'
import type { Project, ProjectCategory } from './types'

// Mock data fallback for when Supabase is not configured
export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'The Weight of Objects',
    status: 'completed',
    category: 'art',
    description: 'What isolated objects reveal about absence and memory.',
    concept: 'When an object is placed in empty space, it stops being functional and starts being symbolic.',
    year: '2024',
    tags: ['visual', 'object', 'memory'],
    featured: true,
    display_order: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    title: 'Cold Sun',
    status: 'completed',
    category: 'art',
    description: 'Pale light, empty landscape, the geometry of loneliness.',
    concept: 'A study in the emotional temperature of natural light.',
    year: '2024',
    tags: ['editorial', 'landscape'],
    featured: false,
    display_order: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '3',
    title: 'Telephone',
    status: 'in_progress',
    category: 'art',
    description: 'A single telephone in an empty room. Nobody calls.',
    concept: 'Absence made physical. The object that was supposed to connect.',
    year: '2025',
    tags: ['installation', 'silence'],
    featured: true,
    display_order: 3,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: '4',
    title: 'Suit',
    status: 'upcoming',
    category: 'fashion',
    description: 'What does a suit mean when there is no body inside it?',
    concept: 'The empty garment as portrait. Presence implied by absence.',
    year: '2025',
    tags: ['fashion', 'body'],
    featured: false,
    display_order: 1,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: '5',
    title: 'Red Is Cover',
    status: 'in_progress',
    category: 'brand',
    description: 'A brand identity exploring what it means to mark something as significant.',
    concept: 'Red as a decision. Red as a claim.',
    year: '2025',
    tags: ['brand', 'color'],
    featured: true,
    display_order: 1,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: '6',
    title: 'Notes on Warmth',
    status: 'in_progress',
    category: 'writing',
    description: 'Observations about tenderness in a cold age.',
    concept: 'Writing as resistance against speed.',
    year: '2025',
    tags: ['writing', 'philosophy'],
    featured: false,
    display_order: 1,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
]

const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function getProjects(category?: ProjectCategory): Promise<Project[]> {
  const sb = getSupabase()
  if (!sb) return category ? MOCK_PROJECTS.filter((p) => p.category === category) : MOCK_PROJECTS
  let query = sb.from('projects').select('*').order('display_order')
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) return MOCK_PROJECTS
  return data ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  const sb = getSupabase()
  if (!sb) return MOCK_PROJECTS.find((p) => p.id === id) ?? null
  const { data } = await sb.from('projects').select('*').eq('id', id).single()
  return data
}

export async function createProject(
  project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project | null> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const { data, error } = await sb.from('projects').insert(project).select().single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const { data, error } = await sb
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const { error } = await sb.from('projects').delete().eq('id', id)
  if (error) throw error
}
