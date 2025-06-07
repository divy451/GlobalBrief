import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  // Temporary known good fallback image URL for testing
  const fallbackImage = 'https://via.placeholder.com/150x150.png?text=Fallback+Image';
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCardClick = () => {
    navigate(path);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`Image load failed for ${imgSrc}, retry count: ${retryCount}`);
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(retryCount + 1);
        setImgSrc(image);
        console.log(`Retrying image load (${retryCount + 1}/${maxRetries}) for ${image}`);
      }, 1000 * (retryCount + 1));
    } else {
      console.log(`Max retries reached, falling back to ${fallbackImage}`);
      setImgSrc(fallbackImage);
      e.currentTarget.onerror = null;
    }
  };

  return (
    <Card
      className={`news-card h-full cursor-pointer ${horizontal ? 'flex flex-col md:flex-row' : ''} ${featured ? 'border-l-4 border-news-accent' : ''}`}
      onClick={handleCardClick}
    >
      <div className={`relative overflow-hidden ${horizontal ? 'md:w-1/3' : 'w-full'}`}>
        <img
          src={imgSrc || fallbackImage}
          alt={title}
          className={`w-full h-48 md:h-auto object-cover ${horizontal ? 'md:h-full' : ''}`}
          onError={handleImageError}
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        {category && (
          <span className="absolute top-0 left-0 bg-news-accent text-white px-2 py-1 text-xs font-medium">
            {category}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <CardContent className={`p-4 ${horizontal ? 'md:w-2/3' : ''}`}>
        <Link to={path} onClick={(e) => e.stopPropagation()}>
          <h3 className={`font-bold mb-2 ${featured ? 'text-xl md:text-2xl' : compact ? 'text-base' : 'text-lg'} hover:text-news-accent transition-colors`}>
            {title}
          </h3>
        </Link>
        {!compact && (
          <p className="text-gray-600 mb-3 line-clamp-2">{excerpt}</p>
        )}
        <div className="text-gray-500 text-sm">{formattedDate}</div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;