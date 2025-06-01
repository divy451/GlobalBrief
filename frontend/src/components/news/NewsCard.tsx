import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  path: string;
  featured?: boolean;
  horizontal?: boolean;
  compact?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ 
  title, 
  excerpt, 
  image, 
  category, 
  date, 
  path, 
  featured = false,
  horizontal = false,
  compact = false
}) => {
  const fallbackImage = '/assets/fallback-image.jpg';

  // Format date for consistency
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={path} className="block">
      <Card className={`news-card h-full ${horizontal ? 'flex flex-col sm:flex-row' : ''} ${featured ? 'border-l-4 border-news-accent' : ''}`}>
        <div className={`relative overflow-hidden ${horizontal ? 'sm:w-1/3 w-full' : 'w-full'} sm:min-w-[150px]`}>
          <img 
            src={image} 
            alt={title}
            className={`w-full ${horizontal ? 'h-32 sm:h-full' : 'h-48'} object-cover`}
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
                e.currentTarget.onerror = null;
              }
            }}
          />
          {category && (
            <span className="absolute top-0 left-0 bg-news-accent text-white px-2 py-1 text-xs font-medium">
              {category}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <CardContent className={`p-4 ${horizontal ? 'sm:w-2/3 w-full' : ''}`}>
          <h3 className={`font-bold mb-2 ${featured ? 'text-xl sm:text-2xl' : compact ? 'text-base' : 'text-lg'} hover:text-news-accent transition-colors`}>
            {title}
          </h3>
          {!compact && (
            <p className="text-gray-600 mb-3 line-clamp-2">{excerpt}</p>
          )}
          <div className="text-gray-500 text-sm">{formattedDate}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NewsCard;