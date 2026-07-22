export type PostStatus = 'imported' | 'pending_review' | 'approved' | 'published' | 'rejected';
export type LinkStatus = 'active' | 'broken' | 'pending';

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  developer: string;
  category_id?: string;
  category?: Category;
  status: PostStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  download_links?: DownloadLink[];
}

export interface DownloadLink {
  id: string;
  post_id: string;
  version: string;
  original_url: string;
  public_url: string; // Link encurtado via Softurl
  shortener_provider: string;
  status: LinkStatus;
  created_at: string;
}

export interface TelegramPublication {
  id: string;
  post_id: string;
  chat_id: string;
  message_id?: string;
  status: string;
  published_at: string;
}
