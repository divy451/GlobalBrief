import { useQuery } from "@tanstack/react-query";
import { Article, Category, BreakingNewsItem } from "../types/news";
import { categories } from "../data/mockData";

// Interface for API article response
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

const fetchArticles = async (filter?: { category?: string; isBreaking?: boolean }, limit?: number, isPublic: boolean = false): Promise<Article[]> => {
  const token = isPublic ? null : localStorage.getItem('admin_token');
  console.log('fetchArticles: Fetching with token:', token);
  const query = new URLSearchParams();
  if (filter?.category) query.append('category', filter.category);
  if (filter?.isBreaking !== undefined) query.append('isBreaking', filter.isBreaking.toString());
  if (limit) query.append('limit', limit.toString());
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const apiUrl = 'https://news-api.poddara766.workers.dev';
  const response = await fetch(`${apiUrl}/api/news${query.toString() ? '?' + query : ''}`, {
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('fetchArticles: Fetch error:', errorData.error || response.statusText);
    throw new Error(errorData.error || 'Failed to fetch articles');
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
  const token = localStorage.getItem('admin_token');
  const apiUrl = 'https://news-api.poddara766.workers.dev';
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${apiUrl}/api/news/${id}`, {
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('fetchArticleById: Fetch error:', errorData.error || response.statusText);
    throw new Error(errorData.error || 'Failed to fetch article');
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
  });
}

export function useFeaturedArticles() {
  return useQuery<Article[], Error>({
    queryKey: ["featuredArticles"],
    queryFn: fetchFeaturedArticles,
    retry: 1,
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
  });
}

export function useTrendingArticles(limit?: number) {
  return useQuery<Article[], Error>({
    queryKey: ["trendingArticles", limit],
    queryFn: () => fetchTrendingArticles(limit),
    retry: 1,
  });
}

export function useArticleById(id: string) {
  return useQuery<Article, Error>({
    queryKey: ["article", id],
    queryFn: () => fetchArticleById(id),
    retry: 1,
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
  });
}