import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'

// Cache les posts populaires
export const getCachedPosts = unstable_cache(
  async (limit: number = 10) => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return data
  },
  ['posts-list'],
  {
    revalidate: 3600, // 1h
    tags: ['posts']
  }
)

// Cache les projets
export const getCachedProjects = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
    
    return data
  },
  ['projects-list'],
  {
    revalidate: 7200, // 2h
    tags: ['projects']
  }
)