import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BreakingNewsItem } from '@/types/news';
import { useIsMobile } from '@/hooks/use-mobile';

interface BreakingNewsProps {
  news: BreakingNewsItem[];
}

const BreakingNews: React.FC<BreakingNewsProps> = ({ news }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
        setIsAnimating(false);
      }, 700);
    }, 6000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (!news || news.length === 0) {
    return (
      <div className="bg-red-600 dark:bg-red-800 text-white py-2 px-4">
        <div className="container">
          <p>No breaking news available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-600 dark:bg-red-800 text-white py-2 px-4">
      <div className="container">
        <div className="flex items-center">
          <div className="font-bold mr-3 whitespace-nowrap">BREAKING:</div>
          <div className="overflow-hidden flex-1">
            <div className={`transition-all duration-700 ${isAnimating ? 'opacity-0 -translate-y-3' : 'opacity-100 translate-y-0'}`}>
              <Link to={`/article/${news[currentIndex].id}`} className="hover:underline inline-block">
                {isMobile && news[currentIndex].title.length > 60 
                  ? `${news[currentIndex].title.substring(0, 60)}...` 
                  : news[currentIndex].title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;