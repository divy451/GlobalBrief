import React, { useState } from 'react'; // Add useState import
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
  const fallbackImage = '/assets/fallback-image.jpg';
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image); // Track the current image source
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts
  const maxRetries = 2; // Maximum number of retries

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCardClick = () => {
    navigate(path);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount < maxRetries) {
      // Retry loading the original image after a delay
      setTimeout(() => {
        setRetryCount(retryCount + 1);
        setImgSrc(image); // Reset to original image URL to retry
      }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
    } else {
      // After max retries, fall back to the fallback image
      if (e.currentTarget.src !== fallbackImage) {
        e.currentTarget.src = fallbackImage;
        e.currentTarget.onerror = null;
      }
    }
  };

  return (
    <Card
      className={`news-card h-full cursor-pointer ${horizontal ? 'flex flex-col md:flex-row' : ''} ${featured ? 'border-l-4 border-news-accent' : ''}`}
      onClick={handleCardClick}
    >
      <div className={`relative overflow-hidden ${horizontal ? 'md:w-1/3' : 'w-full'}`}>
        <img
          src={imgSrc} // Use state-controlled imgSrc
          alt={title}
          className={`w-full h-48 md:h-auto object-cover ${horizontal ? 'md:h-full' : ''}`}
          onError={handleImageError} // Use the new error handler
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