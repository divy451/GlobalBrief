import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Sidebar from '@/components/news/Sidebar';
import Advertisement from '@/components/common/Advertisement';
import { formatDate } from '@/utils/formatDate';
import { useSearchArticles } from '@/hooks/useNewsData';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: articles, isLoading, error } = useSearchArticles(query);

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">
          Search Results for "{query}"
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="text-center">
                <p>Loading...</p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-500">
                <p>Error: {error.message}</p>
                <Link to="/" className="text-news-accent hover:underline">Return to Homepage</Link>
              </div>
            )}
            {!isLoading && !error && articles?.length === 0 && (
              <div className="text-center">
                <p>No articles found for "{query}".</p>
                <Link to="/" className="text-news-accent hover:underline">Return to Homepage</Link>
              </div>
            )}
            {!isLoading && !error && articles && articles.length > 0 && (
              <div className="space-y-8">
                {articles.map((article) => (
                  <article key={article.id} className="border-b border-gray-200 pb-6">
                    <div className="text-sm text-gray-500 mb-2">
                      <Link to={`/category/${article.category.toLowerCase()}`} className="text-news-accent hover:underline">
                        {article.category}
                      </Link>
                      {' · '}
                      {formatDate(article.date)}
                    </div>
                    <Link to={article.path}>
                      <h2 className="text-2xl font-bold leading-tight mb-2 hover:text-news-accent">
                        {article.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    {article.image && (
                      <img
                        src={article.image}
                        alt={`Image for article: ${article.title}`}
                        className="w-full h-auto rounded-lg mb-2"
                        onError={(e) => {
                          if (e.currentTarget.src !== 'https://via.placeholder.com/400x300?text=Image+Not+Found') {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            e.currentTarget.onerror = null;
                          }
                        }}
                      />
                    )}
                    <div className="text-sm text-gray-500">
                      By {article.author}
                    </div>
                  </article>
                ))}
              </div>
            )}
            <Advertisement type="banner" adSlot="4133475647" />
          </div>
          <div>
            <Sidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;