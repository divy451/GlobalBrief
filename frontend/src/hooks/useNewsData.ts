import { useQuery } from "@tanstack/react-query";
import { Article, Category, BreakingNewsItem } from "../types/news";
import { categories } from "../data/mockData";

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
  if (!isPublic && !token) throw new Error('No admin token. Please log in.');

  const query = new URLSearchParams();
  if (filter?.category) query.append('category', filter.category);
  if (filter?.isBreaking !== undefined) query.append('isBreaking', filter.isBreaking.toString());
  if (limit) query.append('limit', limit.toString());

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const apiUrl = import.meta.env.VITE_API_URL || 'https://news-api.poddara766.workers.dev/api';
  const fullUrl = `${apiUrl}/news${query.toString() ? '?' + query : ''}`;
  console.log('fetchArticles: Request URL:', fullUrl);
  console.log('fetchArticles: Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

  try {
    const response = await fetch(fullUrl, { headers });
    console.log('fetchArticles: Response status:', response.status);
    console.log('fetchArticles: Response headers:', Object.fromEntries(response.headers.entries()));
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('fetchArticles: Error response:', errorData);
      throw new Error(errorData.error || `Failed to fetch articles: ${response.statusText} (${response.status})`);
    }
    const articles: ApiArticle[] = await response.json();
    console.log('fetchArticles: Articles fetched:', articles);
    if (!articles || articles.length === 0) {
      console.warn('fetchArticles: No articles returned, using fallback.');
      return fallbackArticles;
    }
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
  } catch (error) {
    console.error('fetchArticles: Fetch failed:', error.message);
    console.error('fetchArticles: Error stack:', error.stack);
    console.warn('fetchArticles: Using fallback articles due to fetch failure.');
    return fallbackArticles; // Return fallback articles instead of throwing
  }
};

const fetchArticleById = async (id: string): Promise<Article> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://news-api.poddara766.workers.dev/api';
  const fullUrl = `${apiUrl}/news/${id}`;
  console.log('fetchArticleById: Request URL:', fullUrl);

  try {
    const response = await fetch(fullUrl);
    console.log('fetchArticleById: Response status:', response.status);
    console.log('fetchArticleById: Response headers:', Object.fromEntries(response.headers.entries()));
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('fetchArticleById: Error response:', errorData);
      throw new Error(errorData.error || `Failed to fetch article: ${response.statusText} (${response.status})`);
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
  } catch (error) {
    console.error('fetchArticleById: Fetch failed:', error.message);
    console.error('fetchArticleById: Error stack:', error.stack);
    console.warn('fetchArticleById: Using fallback article due to fetch failure.');
    return fallbackArticles[0]; // Return a single fallback article
  }
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
    onError: (error) => {
      console.error('Error fetching breaking news:', error.message);
    },
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
    onError: (error) => {
      console.error('Error fetching featured articles:', error.message);
    },
    placeholderData: fallbackArticles,
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
    onError: (error) => {
      console.error(`Error fetching ${category} articles:`, error.message);
    },
    placeholderData: fallbackArticles,
  });
}

export function useTrendingArticles(limit?: number) {
  return useQuery<Article[], Error>({
    queryKey: ["trendingArticles", limit],
    queryFn: () => fetchTrendingArticles(limit),
    retry: 1,
    onError: (error) => {
      console.error('Error fetching trending articles:', error.message);
    },
    placeholderData: fallbackArticles,
  });
}

export function useArticleById(id: string) {
  return useQuery<Article, Error>({
    queryKey: ["article", id],
    queryFn: () => fetchArticleById(id),
    retry: 1,
    onError: (error) => {
      console.error('Error fetching article:', error.message);
    },
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
    onError: (error) => {
      console.error('Error fetching news data:', error.message);
    },
    placeholderData: fallbackArticles,
  });
}