import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { Helmet, HelmetProvider } from 'react-helmet-async';

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
import SearchPage from "./pages/SearchPage"; // Import SearchPage

const queryClient = new QueryClient();

// Scroll-to-top component for route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Define routes where scroll-to-top should NOT apply
    const excludeRoutes = [
      '/admin',        // Admin dashboard
      '/admin/new',    // New article page
      '/admin/edit',   // Edit article page (includes /admin/edit/:id)
      '/admin/login',  // Admin login page
    ];

    // Apply scroll-to-top only if the current route is not in excludeRoutes
    const shouldScrollToTop = !excludeRoutes.some(route => pathname.startsWith(route));

    if (shouldScrollToTop) {
      window.scrollTo(0, 0); // Instant scroll to top
    }
  }, [pathname]); // Trigger on pathname change

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <HelmetProvider>
          <Helmet>
            {/* Fallback AdSense code */}
            <script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8618999712463527"
              crossOrigin="anonymous"
            ></script>
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop /> {/* Add the ScrollToTop component */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/search" element={<SearchPage />} /> {/* Add SearchPage route */}
              
              <Route element={<AdminRouteGuard />}>
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/admin/new" element={<NewArticle />} />
                <Route path="/admin/edit/:id" element={<EditArticle />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;