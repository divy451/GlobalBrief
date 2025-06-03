import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import Advertisement from '../common/Advertisement';
import { useTrendingArticles } from '@/hooks/useNewsData';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatRelativeTime } from '@/utils/formatDate';

interface SidebarProps {
  adSlot?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ adSlot }) => {
  const { data: trendingArticles, isLoading } = useTrendingArticles();

  return (
    <aside className="space-y-8">
      {/* Advertisement above Trending Now */}
      {adSlot && <Advertisement type="square" adSlot={adSlot} />}
      
      <section>
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
          Trending Now
        </h3>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {trendingArticles?.map((article, index) => (
              <Link to={article.path} key={article.id} className="block">
                <Card className="news-card hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="text-2xl font-bold text-red-600 mr-4 animate-bounce-subtle">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium hover:text-red-600 transition-colors">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatRelativeTime(article.date)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      <section>
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
          Follow Us
        </h3>
        <div className="flex space-x-4">
          <a href="#" className="w-10 h-10 rounded-full bg-news-primary hover:bg-red-600 flex items-center justify-center text-white transition-colors duration-300">
            F
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-news-primary hover:bg-red-600 flex items-center justify-center text-white transition-colors duration-300">
            T
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-news-primary hover:bg-red-600 flex items-center justify-center text-white transition-colors duration-300">
            I
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-news-primary hover:bg-red-600 flex items-center justify-center text-white transition-colors duration-300">
            Y
          </a>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;