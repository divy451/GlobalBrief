import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Article } from "../types/news";
import { Link } from "react-router-dom";

const fetchNews = async (token: string): Promise<Article[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/news`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch news");
  return response.json();
};

const AdminPortal = () => {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: articles, error, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: () => fetchNews(token!),
    enabled: !!token,
  });

  const updateArticleBreaking = async ({
    id,
    isBreaking,
  }: {
    id: string;
    isBreaking: boolean;
  }) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/news/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isBreaking }),
    });
    if (!response.ok) throw new Error("Failed to update article");
    return response.json();
  };

  const deleteArticle = async (id: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete article");
    return response.json();
  };

  const updateMutation = useMutation({
    mutationFn: updateArticleBreaking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const handleBreakingToggle = (id: string, isBreaking: boolean) => {
    updateMutation.mutate({ id, isBreaking: !isBreaking });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <div className="space-x-4">
          <Link
            to="/admin/create"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Create Article
          </Link>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {articles?.map((article) => (
          <div
            key={article._id}
            className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <p className="text-gray-600">{article.category}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleBreakingToggle(article._id, article.isBreaking)}
                className={`px-4 py-2 rounded-lg ${
                  article.isBreaking
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-gray-300 hover:bg-gray-400"
                } text-white`}
              >
                {article.isBreaking ? "Remove Breaking" : "Mark Breaking"}
              </button>
              <Link
                to={`/admin/edit/${article._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(article._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortal;