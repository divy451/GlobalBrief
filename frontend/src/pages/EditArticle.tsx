import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useQueryClient } from '@tanstack/react-query';

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    isBreaking: false,
  });

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('Invalid article ID');
        }
        const token = localStorage.getItem('admin_token');
        console.log('EditArticle: Fetching article with token:', token);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = response.status === 404 ? 'Article not found' : errorData.error || 'Failed to fetch article';
          throw new Error(message);
        }
        const article = await response.json();
        console.log('EditArticle: Fetched article:', article);
        setFormData({
          title: article.title || '',
          category: article.category || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          image: article.image || '',
          author: article.author || '',
          isBreaking: article.isBreaking || false,
        });
      } catch (error) {
        console.error('EditArticle: Fetch error:', error);
        const message = error instanceof Error ? error.message : 'Failed to load article';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        navigate('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      console.log('EditArticle: Updating article with token:', token);
      console.log('EditArticle: Submitting formData:', formData);

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const data = {
        _id: id,
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        author: formData.author,
        date: new Date().toISOString(),
        isBreaking: formData.isBreaking,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('EditArticle: API response:', {
        status: response.status,
        body: responseData,
      });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update article');
      }

      toast({
        title: "Article updated",
        description: "Your article has been successfully updated.",
      });
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      navigate('/admin');
    } catch (error) {
      console.error('EditArticle: Update error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update article';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      if (message.includes('token')) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <LoadingSpinner />
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
              <BreadcrumbLink asChild>
                <Link to="/admin">Admin Portal</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Article</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Article</h1>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input 
                id="title" 
                name="title"
                value={formData.title} 
                onChange={handleChange}
                required 
                className="focus:ring-red-600 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Input 
                id="category" 
                name="category"
                value={formData.category} 
                onChange={handleChange}
                required 
                className="focus:ring-red-600 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="excerpt" className="text-sm font-medium">Excerpt</label>
              <Textarea 
                id="excerpt" 
                name="excerpt"
                value={formData.excerpt} 
                onChange={handleChange}
                required 
                className="focus:ring-red-600 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea 
                id="content" 
                name="content"
                value={formData.content} 
                onChange={handleChange}
                className="min-h-[200px] focus:ring-red-600 transition-all"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">Image URL</label>
              <Input 
                id="image" 
                name="image"
                type="url"
                value={formData.image} 
                onChange={handleChange}
                placeholder="https://picsum.photos/400/300"
                required 
                className="focus:ring-red-600 transition-all"
              />
              {formData.image && (
                <p className="text-sm text-gray-500 mt-1">Preview URL: <a href={formData.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.image}</a></p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium">Author</label>
              <Input 
                id="author" 
                name="author"
                value={formData.author} 
                onChange={handleChange}
                required 
                className="focus:ring-red-600 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isBreaking">Breaking News</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isBreaking"
                  checked={formData.isBreaking}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBreaking: checked })}
                />
                <span className="text-sm text-gray-600">Mark as Breaking News</span>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Article'}
              </Button>
              <Link to="/admin">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditArticle;