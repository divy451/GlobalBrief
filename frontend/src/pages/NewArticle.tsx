import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

const NewArticle: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Draft Article',
    category: 'News',
    excerpt: 'Draft excerpt',
    content: 'Draft content',
    image: 'https://picsum.photos/400/300',
    author: 'Anonymous',
    isBreaking: false,
    imageCredit: 'GlobalBrief', // Add imageCredit field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      console.log('NewArticle: Creating article with token:', token ? token.slice(0, 10) + '...' : 'null');

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const articleData = {
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        author: formData.author,
        date: new Date().toISOString(),
        isBreaking: formData.isBreaking,
        imageCredit: formData.imageCredit, // Include imageCredit in API payload
      };
      console.log('NewArticle: Submitting articleData:', articleData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const responseData = await response.json();
      console.log('NewArticle: API response:', {
        status: response.status,
        body: responseData,
        image: responseData.image,
      });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create article');
      }

      const newArticleId = responseData._id;
      const newArticle = {
        ...articleData,
        _id: newArticleId,
        path: `/news/${newArticleId}`,
      };

      queryClient.setQueryData(['articles'], (old: any) => {
        const newData = old ? [...old, newArticle] : [newArticle];
        console.log('NewArticle: Updated articles cache (success):', newData);
        return newData;
      });
      queryClient.setQueryData(['article', newArticleId], newArticle);
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      await queryClient.invalidateQueries({ queryKey: ['article', newArticleId] });
      console.log('NewArticle: Invalidated caches (success)');
      console.log('NewArticle: Articles cache (success):', queryClient.getQueryData(['articles']));
      console.log('NewArticle: Article cache (success):', queryClient.getQueryData(['article', newArticleId]));

      toast({
        title: "Article created",
        description: "Your article has been successfully created.",
      });
      setTimeout(() => navigate('/admin'), 500);
    } catch (error) {
      console.error('NewArticle: Article creation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create article';
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
              <BreadcrumbPage>Add New Article</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Add New Article</h1>
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
            </div>
            
            <div className="space-y-2">
              <label htmlFor="imageCredit" className="text-sm font-medium">Image Credit</label>
              <Input 
                id="imageCredit" 
                name="imageCredit"
                value={formData.imageCredit} 
                onChange={handleChange}
                required 
                className="focus:ring-red-600 transition-all"
              />
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
                {isSubmitting ? 'Creating Article...' : 'Create Article'}
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

export default NewArticle;