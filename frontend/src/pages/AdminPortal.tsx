import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNewsData } from '@/hooks/useNewsData';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  content: string;
  excerpt: string;
  image: string;
  isBreaking: boolean;
}

const updateArticleBreaking = async ({ id, article }: { id: string; article: Article }) => {
  const token = localStorage.getItem('admin_token');
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: article.title,
      content: article.content,
      category: article.category,
      author: article.author,
      excerpt: article.excerpt,
      image: article.image,
      isBreaking: article.isBreaking,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update article');
  }
  return response.json();
};

const AdminPortal: React.FC = () => {
  const { data: articles, isLoading, error } = useNewsData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isTokenValidating, setIsTokenValidating] = useState(true);

  const mutation = useMutation({
    mutationFn: updateArticleBreaking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: "Article updated successfully" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update article';
      toast({ title: "Failed to update article", description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('No admin token found');
      console.log('Attempting to delete article:', id, 'with token:', token);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('Delete failed:', data.error || response.statusText, 'Status:', response.status);
        throw new Error(data.error || `Failed to delete article: ${response.status}`);
      }
      console.log('Delete successful for article:', id);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({
        title: "Article deleted",
        description: "The article was successfully deleted",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete article';
      console.error('Delete error:', message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('admin_token');
      console.log('AdminPortal: Token check:', token);
      if (!token) {
        console.log('AdminPortal: No token, redirecting to login');
        toast({
          title: "Unauthorized",
          description: "Please log in to access the admin portal",
          variant: "destructive",
        });
        navigate('/admin/login');
        return;
      }

      try {
        // Make a simple authenticated request to validate the token
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Invalid or expired token');
        }
      } catch (err) {
        console.log('AdminPortal: Token validation failed, redirecting to login');
        localStorage.removeItem('admin_token');
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/admin/login');
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [navigate, toast]);

  useEffect(() => {
    if (!isTokenValidating && articles) {
      console.log('AdminPortal: Articles received:', articles);
      const ids = articles.map((a: Article) => a.id);
      const uniqueIds = new Set(ids);
      console.log('AdminPortal: Unique IDs count:', uniqueIds.size, 'Total IDs:', ids.length);
      if (uniqueIds.size < ids.length) {
        console.warn('AdminPortal: Duplicate IDs detected in articles');
      }
      if (ids.some(id => !id)) {
        console.warn('AdminPortal: Missing or undefined IDs detected in articles');
      }
    }
  }, [articles, isTokenValidating]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    console.log('AdminPortal: Logged out, redirecting to login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/admin/login');
  };

  if (isTokenValidating || isLoading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container py-12">
          <p className="text-red-600">Failed to load articles: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Admin Portal</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Content Management</h1>
          <div className="flex space-x-4">
            <Link to="/admin/new">
              <Button className="bg-red-600 hover:bg-red-700">Add New Article</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden animate-fade-in">
          {articles?.length === 0 ? (
            <p className="p-4 text-gray-600">No articles found. Add a new article to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Breaking News</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles?.map((article: Article, index: number) => (
                  <TableRow 
                    key={article.id || `article-${index}`} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>{new Date(article.date).toLocaleDateString()}</TableCell>
                    <TableCell>{article.author || 'Unknown'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={article.isBreaking}
                        onCheckedChange={(checked) =>
                          mutation.mutate({ id: article.id, article: { ...article, isBreaking: checked } })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/admin/edit/${article.id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-gray-100 transition-colors">Edit</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteMutation.mutate(article.id)}
                        className="bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPortal;