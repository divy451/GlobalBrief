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
  useCategoryArticles 
} from '@/hooks/useNewsData';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { categories } from '@/data/mockData'; // Import categories to ensure consistency

const Index: React.FC = () => {
  const { data: breakingNewsData, isLoading: isLoadingBreaking, error: breakingError } = useBreakingNews();
  const { data: featuredArticlesData, isLoading: isLoadingFeatured, error: featuredError } = useFeaturedArticles();
  const { data: worldNewsData, isLoading: worldLoading, error: worldError, isError: worldIsError } = useCategoryArticles('World', 5);
  const { data: technologyNewsData, isLoading: techLoading, error: techError, isError: techIsError } = useCategoryArticles('Technology', 5);
  const { data: businessNewsData, isLoading: businessLoading, error: businessError, isError: businessIsError } = useCategoryArticles('Business', 5);
  const { data: sportsNewsData, isLoading: sportsLoading, error: sportsError, isError: sportsIsError } = useCategoryArticles('Sports', 5);

  useEffect(() => {
    console.log('Index: breakingNewsData:', breakingNewsData);
    console.log('Index: featuredArticlesData:', featuredArticlesData);
    console.log('Index: worldNewsData:', worldNewsData, 'worldError:', worldError, 'worldIsError:', worldIsError);
    console.log('Index: technologyNewsData:', technologyNewsData, 'techError:', techError, 'techIsError:', techIsError);
    console.log('Index: businessNewsData:', businessNewsData, 'businessError:', businessError, 'businessIsError:', businessIsError);
    console.log('Index: sportsNewsData:', sportsNewsData, 'sportsError:', sportsError, 'sportsIsError:', sportsIsError);

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
  }, [worldNewsData, technologyNewsData, businessNewsData, sportsNewsData, worldError, techError, businessError, sportsError]);

  return (
    <MainLayout>
      {isLoadingBreaking ? (
        <LoadingSpinner />
      ) : breakingError ? (
        <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">Breaking News</h2>
          <p className="text-red-600 text-lg">Error loading breaking news: {breakingError.message}</p>
        </section>
      ) : breakingNewsData && breakingNewsData.length > 0 ? (
        <BreakingNews news={breakingNewsData} />
      ) : (
        <section className="mb-12 p-4 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">Breaking News</h2>
          <p className="text-gray-600 text-lg">No breaking news available.</p>
        </section>
      )}
      
      <div className="container py-8">
        {isLoadingFeatured ? (
          <LoadingSpinner />
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
          <section className="mb-12 p-4 border border-gray-200 rounded-lg bg-white">
            <h2 className="text-2xl font-semibold mb-4">Featured Articles</h2>
            <p className="text-gray-600 text-lg">No featured articles available.</p>
          </section>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="mb-8 lazy-animate">
              <Advertisement type="banner" adSlot="5791313880" />
            </div>
            
            <div className="lazy-animate">
              {worldLoading ? (
                <LoadingSpinner />
              ) : worldIsError ? (
                <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
                  <h2 className="text-2xl font-semibold mb-4">World News</h2>
                  <p className="text-red-600 text-lg">Error loading world news: {worldError?.message || 'Unknown error'}</p>
                </section>
              ) : (
                <CategoryNews 
                  category={categories.find(cat => cat.name === 'World') || { name: 'World', path: '/category/World' }}
                  articles={worldNewsData || []}
                />
              )}
            </div>
            
            <div className="lazy-animate">
              {techLoading ? (
                <LoadingSpinner />
              ) : techIsError ? (
                <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
                  <h2 className="text-2xl font-semibold mb-4">Technology News</h2>
                  <p className="text-red-600 text-lg">Error loading technology news: {techError?.message || 'Unknown error'}</p>
                </section>
              ) : (
                <CategoryNews 
                  category={categories.find(cat => cat.name === 'Technology') || { name: 'Technology', path: '/category/Technology' }}
                  articles={technologyNewsData || []}
                />
              )}
            </div>
            
            <div className="py-8 lazy-animate">
              <Advertisement type="banner" adSlot="5036327926" />
            </div>
            
            <div className="lazy-animate">
              {businessLoading ? (
                <LoadingSpinner />
              ) : businessIsError ? (
                <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
                  <h2 className="text-2xl font-semibold mb-4">Business News</h2>
                  <p className="text-red-600 text-lg">Error loading business news: {businessError?.message || 'Unknown error'}</p>
                </section>
              ) : (
                <CategoryNews 
                  category={categories.find(cat => cat.name === 'Business') || { name: 'Business', path: '/category/Business' }}
                  articles={businessNewsData || []}
                />
              )}
            </div>
            
            <div className="lazy-animate">
              {sportsLoading ? (
                <LoadingSpinner />
              ) : sportsIsError ? (
                <section className="mb-12 p-4 border border-red-200 rounded-lg bg-white">
                  <h2 className="text-2xl font-semibold mb-4">Sports News</h2>
                  <p className="text-red-600 text-lg">Error loading sports news: {sportsError?.message || 'Unknown error'}</p>
                </section>
              ) : (
                <CategoryNews 
                  category={categories.find(cat => cat.name === 'Sports') || { name: 'Sports', path: '/category/Sports' }}
                  articles={sportsNewsData || []}
                />
              )}
            </div>
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