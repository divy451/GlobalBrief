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
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

const NewArticle: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDraft = async () => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      console.log('NewArticle: Creating draft with token:', token ? token.slice(0, 10) + '...' : 'null');

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const draftData = {
        title: 'Draft Article',
        category: 'News',
        excerpt: 'Draft excerpt',
        content: 'Draft content',
        image: 'https://picsum.photos/400/300',
        author: 'Anonymous',
        date: new Date().toISOString(),
        isBreaking: false,
        published: false, // Set draft as unpublished
      };
      console.log('NewArticle: Submitting draftData:', draftData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      const responseData = await response.json();
      console.log('NewArticle: API response:', {
        status: response.status,
        body: responseData,
        image: responseData.image,
      });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create draft article');
      }

      const newArticleId = responseData._id;
      const newArticle = {
        ...draftData,
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
        title: "Draft created",
        description: "Redirecting to edit page.",
      });
      setTimeout(() => navigate(`/admin/edit/${newArticleId}`), 500);
    } catch (error) {
      console.error('NewArticle: Draft creation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create draft article';
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
          <div className="space-y-6">
            <p className="text-gray-600">Click below to create a draft article and edit it.</p>
            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateDraft}
                className="bg-red-600 hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Draft...' : 'Create Draft Article'}
              </Button>
              <Link to="/admin">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewArticle;