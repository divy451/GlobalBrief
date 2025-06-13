import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import MainLayout from '@/components/layout/MainLayout';

import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import AdminPortal from "./pages/AdminPortal";
import AdminLogin from "./pages/AdminLogin"; 
import NewArticle from "./pages/NewArticle";
import EditArticle from "./pages/EditArticle";
import NotFound from "./pages/NotFound";
import AdminRouteGuard from "./components/auth/AdminRouteGuard";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SearchPage from "./pages/SearchPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const excludeRoutes = [
      '/admin',
      '/admin/new',
      '/admin/edit',
      '/admin/login',
    ];

    const shouldScrollToTop = !excludeRoutes.some(route => pathname.startsWith(route));

    if (shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return null;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { pathname } = useLocation();

  // Prefetch article data to trigger early image loading
  useEffect(() => {
    const prefetchArticles = async () => {
      setIsLoading(true);
      try {
        await queryClient.prefetchQuery({
          queryKey: ['articles'],
          queryFn: async () => {
            const response = await fetch('https://news-api.poddara766.workers.dev/');
            if (!response.ok) throw new Error('Failed to fetch articles');
            return response.json();
          },
        });
      } catch (error) {
        console.error('Failed to prefetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    prefetchArticles();
  }, []);

  // Reset loading state on route change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <HelmetProvider>
            <Helmet>
              <script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8618999712463527"
                crossOrigin="anonymous"
              ></script>
            </Helmet>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <MainLayout showFooter={!isLoading}>
                <Routes>
                  <Route path="/" element={<Index setIsLoading={setIsLoading} />} />
                  <Route path="/category/:slug" element={<CategoryPage setIsLoading={setIsLoading} />} />
                  <Route path="/article/:id" element={<ArticlePage setIsLoading={setIsLoading} />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route element={<AdminRouteGuard />}>
                    <Route path="/admin" element={<AdminPortal />} />
                    <Route path="/admin/new" element={<NewArticle />} />
                    <Route path="/admin/edit/:id" element={<EditArticle />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </BrowserRouter>
          </HelmetProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;