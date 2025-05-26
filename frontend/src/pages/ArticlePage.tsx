import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Advertisement from '@/components/common/Advertisement';
import Sidebar from '@/components/news/Sidebar';
import { formatDate } from '@/utils/formatDate';
import { useArticleById } from '@/hooks/useNewsData';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticleById(id!);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-8">{error?.message || 'Unable to load article'}</p>
          <Link to="/" className="text-news-accent hover:underline">Return to Homepage</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                <Link to={`/category/${article.category.toLowerCase()}`} className="text-news-accent hover:underline">
                  {article.category}
                </Link>
                {' · '}
                {formatDate(article.date)}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {article.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium">{article.author}</div>
                  <div className="text-sm text-gray-500">Writer</div>
                </div>
              </div>
            </header>
            <figure className="mb-8">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  if (e.currentTarget.src !== '/assets/fallback-image.jpg') {
                    e.currentTarget.src = '/assets/fallback-image.jpg';
                    e.currentTarget.onerror = null;
                  }
                }}
              />
              <figcaption className="text-sm text-gray-500 mt-2">
                Photo: GlobalBrief
              </figcaption>
            </figure>
            <div className="prose max-w-none mb-8">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <Advertisement type="banner" adSlot="4133475647" />
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold mb-4">Share this article</h3>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-[#1877f2] text-white rounded">Facebook</button>
                <button className="px-4 py-2 bg-[#1da1f2] text-white rounded">Twitter</button>
                <button className="px-4 py-2 bg-[#0a66c2] text-white rounded">LinkedIn</button>
                <button className="px-4 py-2 bg-[#25D366] text-white rounded">WhatsApp</button>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold mb-4">Comments</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-center text-gray-600">
                  Comments are disabled for this article.
                </p>
              </div>
            </div>
          </div>
          <div>
            <Sidebar />
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

export default ArticlePage;