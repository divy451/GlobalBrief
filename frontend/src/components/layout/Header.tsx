
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: "World", path: "/category/world" },
    { name: "Politics", path: "/category/politics" },
    { name: "Business", path: "/category/business" },
    { name: "Technology", path: "/category/technology" },
    { name: "Science", path: "/category/science" },
    { name: "Health", path: "/category/health" },
    { name: "Sports", path: "/category/sports" },
    { name: "Entertainment", path: "/category/entertainment" },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className={`bg-black text-white py-1.5 px-4 md:px-8 transition-all duration-300 ${isScrolled ? 'py-1' : ''}`}>
        <div className="container flex justify-between items-center">
          <div className="text-xs md:text-sm animate-slide-in-left">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex space-x-4 animate-slide-in-right">
            <button 
              onClick={toggleTheme}
              className="text-xs md:text-sm hover:text-red-300 transition-colors flex items-center gap-1"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group animate-slide-in-left">
            <h1 className="text-2xl md:text-4xl font-bold text-news-primary dark:text-white relative z-10 group-hover:text-red-600 transition-colors duration-300">
              <span>Briefly</span>
              <span className="text-red-600 group-hover:text-news-primary dark:group-hover:text-white transition-colors duration-300">Global</span>
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-4 animate-slide-in-right">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-1.5 w-full border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-300 bg-white dark:bg-gray-800 dark:text-white"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <button
            aria-label="Toggle menu"
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <nav className="border-t border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container overflow-auto scrollbar-hide">
          <ul className="hidden md:flex space-x-6 py-3 whitespace-nowrap animate-slide-in-bottom">
            {categories.map((category) => (
              <li key={category.name}>
                <Link 
                  to={category.path}
                  className="category-tab text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 font-medium transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="container py-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white dark:bg-gray-800 dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            <ul className="space-y-3 mb-4">
              {categories.map((category, index) => (
                <li key={category.name} className={`animate-fade-in`} style={{animationDelay: `${index * 50}ms`}}>
                  <Link 
                    to={category.path}
                    className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors block py-2"
                    onClick={toggleMenu}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
