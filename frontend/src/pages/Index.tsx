import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import BreakingNews from '@/components/news/BreakingNews';
import FeaturedNews from '@/components/news/FeaturedNews';
import CategoryNews from '@/components/news/CategoryNews';
import Advertisement from '@/components/common/Advertisement';
import Sidebar from '@/components/news/Sidebar';
import { 
  useBreakingNews, 
  useFeaturedArticles, 
  useCategories,
  useAllCategoryArticles 
} from '@/hooks/useNewsData';

const Index: React.FC = () => {
  const { data: breakingNewsData, isLoading: isLoadingBreaking, error: breakingError } = useBreakingNews();
  const { data: featuredArticlesData, isLoading: isLoadingFeatured, error: featuredError } = useFeaturedArticles();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Fetch all category articles in a single query
  const { data: categoryArticlesData, isLoading: categoryArticlesLoading, error: categoryArticlesError } = useAllCategoryArticles(categories || [], 5);

  useEffect(() => {
    console.log('Index: breakingNewsData:', breakingNewsData);
    console.log('Index: featuredArticlesData:', featuredArticlesData);
    console.log('Index: categories:', categories);
    console.log('Index: categoryArticlesData:', categoryArticlesData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in-bottom');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.lazy-animate').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [breakingNewsData, featuredArticlesData, categories, categoryArticlesData]);

  return (
    <MainLayout>
      {isLoadingBreaking ? (
        <div className="flex justify-center items-center h-32">
          <span className="loader"></span>
        </div>
      ) : breakingError ? (
        <section className="mb-8 p-4 border border-red-200 rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">Breaking News</h2>
          <p className="text-red-600 text-lg">Error loading breaking news: {breakingError.message}</p>
        </section>
      ) : breakingNewsData && breakingNewsData.length > 0 ? (
        <BreakingNews news={breakingNewsData} />
      ) : (
        <section className="mb-8 p-4 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">Breaking News</h2>
          <p className="text-gray-600 text-lg">No breaking news available.</p>
        </section>
      )}
      
      <div className="container px-0 sm:px-4 py-8">
        {isLoadingFeatured ? (
          <div className="flex justify-center items-center h-32">
            <span className="loader"></span>
          </div>
        ) : featuredError ? (
          <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
            <h2 className="text-2xl font-semibold mb-4">Featured Articles</h2>
            <p className="text-red-600 text-lg">Error loading featured articles: {featuredError.message}</p>
          </section>
        ) : featuredArticlesData && featuredArticlesData.length > 0 ? (
          <FeaturedNews 
            mainArticle={featuredArticlesData[0]} 
            secondaryArticles={featuredArticlesData.slice(1)}
          />
        ) : (
          <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
            <h2 className="text-2xl font-semibold mb-4">Featured Articles</h2>
            <p className="text-gray-600 text-lg">No featured articles available.</p>
          </section>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="mb-8 lazy-animate">
              <Advertisement type="banner" adSlot="5791313880" />
            </div>
            
            {categoriesLoading ? (
              <div className="flex justify-center items-center h-32">
                <span className="loader"></span>
              </div>
            ) : categoriesError ? (
              <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
                <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                <p className="text-red-600 text-lg">Error loading categories: {categoriesError.message}</p>
              </section>
            ) : categoryArticlesLoading ? (
              <div className="flex justify-center items-center h-32">
                <span className="loader"></span>
              </div>
            ) : categoryArticlesError ? (
              <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
                <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                <p className="text-red-600 text-lg">Error loading category articles: {categoryArticlesError.message}</p>
              </section>
            ) : categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <div key={category.name} className="lazy-animate">
                  <CategoryNews 
                    category={{ name: category.name, path: category.path }}
                    articles={categoryArticlesData?.[category.name] || []}
                  />
                  {index % 2 === 1 && index !== categories.length - 1 && (
                    <div className="py-8 lazy-animate">
                      <Advertisement type="banner" adSlot="5036327926" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <section className="mb-12 p-4 border border-gray-200 rounded-lg bg-white">
                <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                <p className="text-gray-600 text-lg">No categories available.</p>
              </section>
            )}
          </div>
          
          <div className="lazy-animate">
            <Sidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;