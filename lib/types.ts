export type ProjectStatus = 'in_progress' | 'upcoming' | 'completed' | 'archived'
export type ProjectCategory = 'art' | 'fashion' | 'brand' | 'writing' | 'worldbuilding'

export interface Project {
  id: string
  title: string
  status: ProjectStatus
  category: ProjectCategory
  description: string
  concept: string
  image_url?: string
  tags?: string[]
  year: string
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface BackgroundImage {
  id: string
  url: string
  alt?: string
  active: boolean
  display_order: number
  created_at: string
}
