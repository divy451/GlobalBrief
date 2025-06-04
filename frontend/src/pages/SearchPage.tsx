import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchArticles } from '../hooks/useNewsData';
import { Article } from '../types/news';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: articles, isLoading, error } = useSearchArticles(query);

  return (
    <div className="container py-8 bg-white dark:bg-gray-900">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Search Results for <span className="text-red-600">"{query}"</span>
      </h1>
      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: Article) => (
            <div
              key={article.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <a
                  href={article.path}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                >
                  {article.title}
                </a>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{article.excerpt}</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(article.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} • {article.category}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && <p className="text-gray-600 dark:text-gray-400">No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;