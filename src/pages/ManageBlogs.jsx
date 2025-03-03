import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";

function ManageBlogs() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");

  // Fetch all blogs on mount
  useEffect(() => {
    if (!token) {
      navigate("/");
    }

    async function fetchBlogs() {
      try {
        const response = await fetch("http://localhost:7000/blogs/blogs");
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchBlogs();
  }, [token, navigate]);

  // Delete a blog
  const handleDelete = async (blogId) => {
    try {
      const response = await fetch(
        `http://localhost:7000/blogs/delete/${blogId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }
      setBlogs((prev) => prev.filter((blog) => blog.blog_id !== blogId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
        Manage Blogs
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog.blog_id}
            className="flex justify-between items-center bg-white shadow p-4 rounded-md"
          >
            <div>
              <h3 className="text-lg font-medium">{blog.blog_name}</h3>
              <p className="text-sm text-gray-600 w-sm">{blog.blog_description}</p>
            </div>
            <div className="space-x-2 flex flex-col gap-6">
              <button
                onClick={() => navigate(`/editblog/${blog.blog_id}`)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(blog.blog_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageBlogs;
