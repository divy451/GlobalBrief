export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  isBreaking: boolean;
  path: string;
  published: boolean;
}

export interface Category {
  name: string;
  path: string;
}

export interface BreakingNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image?: string;
  path: string;
  isBreaking: boolean;
}