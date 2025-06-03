import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRouteGuard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    console.log('AdminRouteGuard: Token check:', token); // Debug token
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      console.log('AdminRouteGuard: No token, redirecting to login');
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin area",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminRouteGuard;