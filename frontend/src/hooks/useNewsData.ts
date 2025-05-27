import { useQuery } from "@tanstack/react-query";
import { Article, Category, BreakingNewsItem } from "../types/news";
import { categories } from "../data/mockData";

// Interface for MongoDB article response
interface ApiArticle {
  _id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  author?: string;
  image?: string;
  excerpt?: string;
  isBreaking?: boolean;
}

// Fallback articles to display when API fails
const fallbackArticles: Article[] = [
  {
    id: "fallback-1",
    title: "Fallback News Article",
    content: "This is a fallback article displayed because the API failed to load articles.",
    category: "General",
    date: new Date().toISOString(),
    author: "System",
    image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400",
    excerpt: "Fallback article due to API failure.",
    isBreaking: false,
    path: "/article/fallback-1",
  },
];

const fetchArticles = async (filter?: { category?: string; isBreaking?: boolean }, limit?: number, isPublic: boolean = false): Promise<Article[]> => {
  const token = isPublic ? null : localStorage.getItem('admin_token');
  console.log('fetchArticles: Fetching with token:', token);
  const query = new URLSearchParams();
  if (filter?.category) query.append('category', filter.category);
  if (filter?.isBreaking !== undefined) query.append('isBreaking', filter.isBreaking.toString());
  if (limit) query.append('limit', limit.toString());
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const apiUrl = 'https://news-api.poddara766.workers.dev'; // Hardcoded VITE_API_URL
  const response = await fetch(`${apiUrl}/api/news${query.toString() ? '?' + query : ''}`, {
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('fetchArticles: Fetch error:', errorData.error || response.statusText);
    return fallbackArticles; // Return fallback articles instead of throwing
  }
  const articles: ApiArticle[] = await response.json();
  console.log('fetchArticles: Articles fetched:', articles);
  return articles.map((article: ApiArticle) => ({
    id: article._id,
    title: article.title || 'Untitled',
    category: article.category || 'Uncategorized',
    date: article.date ? new Date(article.date).toISOString() : new Date().toISOString(),
    author: article.author || 'Unknown',
    content: article.content || '',
    image: article.image || '',
    excerpt: article.excerpt || '',
    isBreaking: article.isBreaking || false,
    path: `/article/${article._id}`,
  }));
};

const fetchArticleById = async (id: string): Promise<Article> => {
  const apiUrl = 'https://news-api.poddara766.workers.dev'; // Hardcoded VITE_API_URL
  const response = await fetch(`${apiUrl}/api/news/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('fetchArticleById: Fetch error:', errorData.error || response.statusText);
    return fallbackArticles[0]; // Return a single fallback article
  }
  const article: ApiArticle = await response.json();
  console.log('fetchArticleById: Article fetched:', article);
  return {
    id: article._id,
    title: article.title || 'Untitled',
    category: article.category || 'Uncategorized',
    date: article.date ? new Date(article.date).toISOString() : new Date().toISOString(),
    author: article.author || 'Unknown',
    content: article.content || '',
    image: article.image || '',
    excerpt: article.excerpt || '',
    isBreaking: article.isBreaking || false,
    path: `/article/${article._id}`,
  };
};

const fetchBreakingNews = async (): Promise<BreakingNewsItem[]> => {
  const articles = await fetchArticles({ isBreaking: true }, undefined, true);
  return articles.map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    date: article.date,
    image: article.image,
    path: `/article/${article.id}`,
    isBreaking: article.isBreaking,
  }));
};

const fetchFeaturedArticles = async (): Promise<Article[]> => {
  return fetchArticles({}, 5, true);
};

const fetchCategories = async (): Promise<Category[]> => {
  return categories;
};

const fetchCategoryArticles = async (category: string, limit: number = 4): Promise<Article[]> => {
  return fetchArticles({ category }, limit, true);
};

const fetchTrendingArticles = async (limit: number = 5): Promise<Article[]> => {
  return fetchArticles({}, limit, true);
};

export function useBreakingNews() {
  return useQuery<BreakingNewsItem[], Error>({
    queryKey: ["breakingNews"],
    queryFn: fetchBreakingNews,
    retry: 1,
    placeholderData: fallbackArticles.map(article => ({
      id: article.id,
      title: article.title,
      category: article.category,
      date: article.date,
      image: article.image,
      path: article.path,
      isBreaking: article.isBreaking,
    })),
  });
}

export function useFeaturedArticles() {
  return useQuery<Article[], Error>({
    queryKey: ["featuredArticles"],
    queryFn: fetchFeaturedArticles,
    retry: 1,
    placeholderData: fallbackArticles,
  });
}

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useCategoryArticles(category: string, limit?: number) {
  return useQuery<Article[], Error>({
    queryKey: ["categoryArticles", category],
    queryFn: () => fetchCategoryArticles(category, limit),
    enabled: !!category,
    retry: 1,
    placeholderData: fallbackArticles,
  });
}

export function useTrendingArticles(limit?: number) {
  return useQuery<Article[], Error>({
    queryKey: ["trendingArticles", limit],
    queryFn: () => fetchTrendingArticles(limit),
    retry: 1,
    placeholderData: fallbackArticles,
  });
}

export function useArticleById(id: string) {
  return useQuery<Article, Error>({
    queryKey: ["article", id],
    queryFn: () => fetchArticleById(id),
    retry: 1,
    placeholderData: fallbackArticles[0],
  });
}

export const apiClient = {
  fetchBreakingNews,
  fetchFeaturedArticles,
  fetchCategories,
  fetchCategoryArticles,
  fetchTrendingArticles,
  fetchArticleById,
};

export function useNewsData() {
  return useQuery<Article[], Error>({
    queryKey: ["articles"],
    queryFn: () => fetchArticles(),
    retry: 1,
    placeholderData: fallbackArticles,
  });
}