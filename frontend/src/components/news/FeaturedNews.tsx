import React from 'react';
import NewsCard from './NewsCard';
import { Article } from '@/types/news';

interface FeaturedNewsProps {
  mainArticle: Article;
  secondaryArticles: Article[];
}

const FeaturedNews: React.FC<FeaturedNewsProps> = ({ mainArticle, secondaryArticles }) => {
  // Ensure only published articles are displayed
  const publishedMainArticle = mainArticle.published ? mainArticle : null;
  const publishedSecondaryArticles = secondaryArticles.filter(article => article.published);

  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 flex items-center">
          <span className="relative">
            Featured Articles
            <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-news-accent"></span>
          </span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-slide-in-left">
            {publishedMainArticle && (
              <NewsCard 
                id={publishedMainArticle.id}
                title={publishedMainArticle.title}
                excerpt={publishedMainArticle.excerpt}
                image={publishedMainArticle.image || 'https://via.placeholder.com/600x400?text=Featured+Image'}
                category={publishedMainArticle.category}
                date={publishedMainArticle.date}
                path={publishedMainArticle.path}
                featured={true}
              />
            )}
          </div>
          
          <div className="space-y-6">
            {publishedSecondaryArticles.map((article, index) => (
              <div 
                key={article.id} 
                className="animate-slide-in-right" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <NewsCard 
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.image || 'https://via.placeholder.com/150x100?text=Secondary+Image'}
                  category={article.category}
                  date={article.date}
                  path={article.path}
                  horizontal={true}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;