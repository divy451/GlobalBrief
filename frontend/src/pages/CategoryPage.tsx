import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NewsCard from '@/components/news/NewsCard';
import Advertisement from '@/components/common/Advertisement';
import Sidebar from '@/components/news/Sidebar';
import { useCategoryArticles, useCategories } from '@/hooks/useNewsData';

interface CategoryPageProps {
  setIsLoading: (loading: boolean) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ setIsLoading }) => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const category = categories?.find(cat => cat.path.toLowerCase() === `/category/${slug?.toLowerCase()}`);
  const categoryName = category ? category.name : (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : '');

  const { data: articles, isLoading, error } = useCategoryArticles(categoryName, 12);

  useEffect(() => {
    setIsLoading(categoriesLoading || isLoading);
  }, [categoriesLoading, isLoading, setIsLoading]);

  const sortedArticles = articles ? [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  if (categoriesLoading || isLoading) {
    return null;
  }

  if (categoriesError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load categories: {categoriesError.message}</p>
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 pb-2 border-b border-gray-200">
        {categoryName} News
      </h1>
      
      <p className="text-gray-600 mb-8">
        Stay updated with the latest {categoryName.toLowerCase()} news and developments from around the globe.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load articles: {error.message}</p>
            </div>
          ) : sortedArticles && sortedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {sortedArticles.slice(0, 8).map((article) => (
                  <NewsCard
                    key={article.id}
                    {...article}
                  />
                ))}
              </div>
              
              <Advertisement type="banner" adSlot="3686800815" adClient="ca-pub-9084229712463529" />
              
              {sortedArticles.length > 8 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {sortedArticles.slice(8).map((article) => (
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
  );
};

export default CategoryPage;