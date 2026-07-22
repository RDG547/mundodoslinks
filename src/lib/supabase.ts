import { createClient } from '@supabase/supabase-js';
import { Post, Category, DownloadLink } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sscnlbtsxoidwzeaxtri.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gdVFB86fqeqxyBETzueTaQ_TVr-grPq';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Data Mocking Utilities for Seamless Offline / Demo Execution
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Softwares Livres', slug: 'softwares-livres', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Jogos Indie', slug: 'jogos-indie', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Utilitários', slug: 'utilitarios', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Mídias Autorizadas', slug: 'midias-autorizadas', created_at: new Date().toISOString() }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Blender 4.2 LTS',
    slug: 'blender-4-2-lts',
    excerpt: 'Completa suite para criação 3D, animação, renderização, composição e rastreamento de movimento.',
    content: 'O Blender é o programa de criação 3D gratuito e de código aberto. Ele oferece suporte a todas as etapas do pipeline 3D: modelagem, rig, animação, simulação, renderização, composição e rastreamento de movimento, até mesmo edição de vídeo.',
    cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    developer: 'Blender Foundation',
    category_id: 'cat-1',
    category: MOCK_CATEGORIES[0],
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    download_links: [
      {
        id: 'link-1',
        post_id: 'post-1',
        version: 'v4.2.3 LTS',
        original_url: 'https://download.blender.org/release/Blender4.2/blender-4.2.3-windows-x64.msi',
        public_url: 'https://download.blender.org/release/Blender4.2/blender-4.2.3-windows-x64.msi',
        shortener_provider: 'direct',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'post-2',
    title: 'OBS Studio 30.2',
    slug: 'obs-studio-30-2',
    excerpt: 'Software gratuito e de código aberto para gravação de vídeo e transmissão ao vivo.',
    content: 'Baixe e comece a transmitir de forma rápida e fácil no Windows, Mac ou Linux. O OBS Studio é equipado com uma poderosa API, permitindo plugins e integrações personalizadas.',
    cover_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    developer: 'OBS Project',
    category_id: 'cat-1',
    category: MOCK_CATEGORIES[0],
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    download_links: [
      {
        id: 'link-2',
        post_id: 'post-2',
        version: 'v30.2.2',
        original_url: 'https://github.com/obsproject/obs-studio/releases/download/30.2.2/OBS-Studio-30.2.2-Full-Installer-x64.exe',
        public_url: 'https://github.com/obsproject/obs-studio/releases/download/30.2.2/OBS-Studio-30.2.2-Full-Installer-x64.exe',
        shortener_provider: 'direct',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ]
  }
];

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIES;
    }
    return data as Category[];
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function fetchPublishedPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*), download_links(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_POSTS.filter(p => p.status === 'published');
    }
    return data as Post[];
  } catch {
    return MOCK_POSTS.filter(p => p.status === 'published');
  }
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*), download_links(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return MOCK_POSTS.find(p => p.slug === slug) || null;
    }
    return data as Post;
  } catch {
    return MOCK_POSTS.find(p => p.slug === slug) || null;
  }
}

export async function fetchPostById(id: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*), download_links(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return MOCK_POSTS.find(p => p.id === id) || null;
    }
    return data as Post;
  } catch {
    return MOCK_POSTS.find(p => p.id === id) || null;
  }
}

export async function fetchPendingPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*), download_links(*)')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_POSTS.filter(p => p.status === 'pending_review');
    }
    return data as Post[];
  } catch {
    return MOCK_POSTS.filter(p => p.status === 'pending_review');
  }
}
