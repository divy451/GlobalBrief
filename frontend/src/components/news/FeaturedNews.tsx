import React from 'react';
import NewsCard from './NewsCard';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  path?: string;
}

interface FeaturedNewsProps {
  mainArticle: Article;
  secondaryArticles: Article[];
}

const FeaturedNews: React.FC<FeaturedNewsProps> = ({ mainArticle, secondaryArticles }) => {
  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 flex items-center">
          <span className="relative">
            Featured News
            <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-news-accent"></span>
          </span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-slide-in-left">
            <NewsCard 
              id={mainArticle.id}
              title={mainArticle.title}
              excerpt={mainArticle.excerpt}
              image={mainArticle.image}
              category={mainArticle.category}
              date={mainArticle.date}
              path={mainArticle.path || `/article/${mainArticle.id}`}
              featured={true}
            />
          </div>
          
          <div className="space-y-6">
            {secondaryArticles.map((article, index) => (
              <div 
                key={article.id} 
                className="animate-slide-in-right" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <NewsCard 
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.image}
                  category={article.category}
                  date={article.date}
                  path={article.path || `/article/${article.id}`}
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