import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import NewsCard from '@/components/news/NewsCard';
import Advertisement from '@/components/common/Advertisement';
import Sidebar from '@/components/news/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCategoryArticles } from '@/hooks/useNewsData';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';
  
  const { data: articles, isLoading, error } = useCategoryArticles(categoryName, 12);

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8 pb-2 border-b border-gray-200">
          {categoryName} News
        </h1>
        
        {/* Category description */}
        <p className="text-gray-600 mb-8">
          Stay updated with the latest {categoryName.toLowerCase()} news and developments from around the globe.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Failed to load articles.</p>
              </div>
            ) : articles && articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {articles.slice(0, 8).map((article) => (
                    <NewsCard
                      key={article.id}
                      {...article}
                    />
                  ))}
                </div>
                
                <Advertisement type="banner" adSlot="3686800815" adClient="ca-pub-9084229487967369" />
                
                {articles.length > 8 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {articles.slice(8).map((article) => (
                      <NewsCard
                        key={article.id}
                        {...article}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No articles found for this category.</p>
              </div>
            )}
          </div>
          
          <div>
            <Sidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryPage;