import { useQuery } from "@tanstack/react-query";
import { useDebounce } from 'use-debounce';
import { Article, Category, BreakingNewsItem } from "../types/news";

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
  imageCredit?: string;
}

const fetchArticles = async (filter?: { category?: string; isBreaking?: boolean; search?: string }, limit?: number, isPublic: boolean = false): Promise<Article[]> => {
  const token = isPublic ? null : localStorage.getItem('admin_token');
  console.log('fetchArticles: Fetching with token:', token);
  const query = new URLSearchParams();
  if (filter?.category) query.append('category', filter.category);
  if (filter?.isBreaking !== undefined) query.append('isBreaking', filter.isBreaking.toString());
  if (filter?.search) query.append('search', filter.search);
  if (limit) query.append('limit', limit.toString());
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const apiUrl = 'https://news-api.poddara766.workers.dev';
  const url = `${apiUrl}/api/news${query.toString() ? '?' + query : ''}`;
  console.log(`fetchArticles: Requesting URL: ${url}`);
  const response = await fetch(url, {
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`fetchArticles: Fetch error for URL ${url}: Status ${response.status}, Response: ${errorText}`);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`Failed to fetch articles: ${errorText}`);
    }
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
    imageCredit: article.imageCredit,
  }));
};

const fetchArticleById = async (id: string): Promise<Article> => {
  const token = localStorage.getItem('admin_token');
  const apiUrl = 'https://news-api.poddara766.workers.dev';
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${apiUrl}/api/news/${id}`;
  console.log(`fetchArticleById: Requesting URL: ${url}`);
  const response = await fetch(url, {
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`fetchArticleById: Fetch error for URL ${url}: Status ${response.status}, Response: ${errorText}`);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`Failed to fetch article: ${errorText}`);
    }
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
    imageCredit: article.imageCredit,
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
  const apiUrl = 'https://news-api.poddara766.workers.dev';
  const url = `${apiUrl}/api/categories`;
  console.log(`fetchCategories: Requesting URL: ${url}`);
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`fetchCategories: Fetch error for URL ${url}: Status ${response.status}, Response: ${errorText}`);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`Failed to fetch categories: ${errorText}`);
    }
    throw new Error(errorData.error || 'Failed to fetch categories');
  }
  const categories: Category[] = await response.json();
  console.log('fetchCategories: Categories fetched:', categories);
  return categories;
};

const fetchCategoryArticles = async (category: string, limit: number = 4): Promise<Article[]> => {
  return fetchArticles({ category }, limit, true);
};

const fetchAllCategoryArticles = async (categories: Category[], limit: number = 4): Promise<{ [key: string]: Article[] }> => {
  const result: { [key: string]: Article[] } = {};
  await Promise.all(
    categories.map(async (category) => {
      const articles = await fetchArticles({ category: category.name }, limit, true);
      result[category.name] = articles;
    })
  );
  return result;
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
    retry: 1,
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

export function useAllCategoryArticles(categories: Category[], limit: number = 5) {
  return useQuery<{ [key: string]: Article[] }, Error>({
    queryKey: ["allCategoryArticles", categories.map(cat => cat.name).join(","), limit],
    queryFn: () => fetchAllCategoryArticles(categories, limit),
    enabled: !!categories && categories.length > 0,
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

export function useSearchArticles(searchQuery: string) {
  return useQuery<Article[], Error>({
    queryKey: ["searchArticles", searchQuery],
    queryFn: () => fetchArticles({ search: searchQuery.trim() }, undefined, true),
    enabled: !!searchQuery.trim(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchSuggestions(searchQuery: string) {
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  return useQuery<Article[], Error>({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await fetch(`https://news-api.poddara766.workers.dev/api/news?search=${encodeURIComponent(debouncedQuery)}&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch search suggestions');
      const data = await response.json();
      return data || [];
    },
    enabled: !!debouncedQuery.trim(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}