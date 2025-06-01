import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';

interface FeaturedNewsProps {
  mainArticle: Article;
  secondaryArticles: Article[];
}

const FeaturedNews: React.FC<FeaturedNewsProps> = ({ mainArticle, secondaryArticles }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">Featured Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Link to={mainArticle.path} className="block">
            <img 
              src={mainArticle.image || 'https://via.placeholder.com/600x400?text=Featured+Image'} 
              alt={mainArticle.title} 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold">{mainArticle.title}</h3>
            <p className="text-gray-600 mt-2">{mainArticle.excerpt}</p>
          </Link>
        </div>
        <div className="space-y-4">
          {secondaryArticles.map(article => (
            <Link key={article.id} to={article.path} className="block">
              <div className="flex space-x-4">
                <img 
                  src={article.image || 'https://via.placeholder.com/150x100?text=Secondary+Image'} 
                  alt={article.title} 
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold">{article.title}</h4>
                  <p className="text-sm text-gray-600">{article.excerpt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;