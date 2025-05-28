export interface Article {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  author: string;
  path?: string;
  isBreaking: boolean;
}

export interface Category {
  id: string;
  name: string;
  path: string;
}

export interface BreakingNewsItem {
  _id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  path?: string;
  isBreaking: boolean;
}