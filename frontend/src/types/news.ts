export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string; // Path to uploaded image, e.g., /uploads/image.jpg
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
  id: string;
  title: string;
  category: string;
  date: string;
  image: string; // Path to uploaded image, e.g., /uploads/image.jpg
  path?: string;
  isBreaking: boolean;
}