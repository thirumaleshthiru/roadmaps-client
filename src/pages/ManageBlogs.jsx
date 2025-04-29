import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function ManageBlogs() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    
    async function fetchBlogs() {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/blogs/blogs");
        setBlogs(response.data);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(""), 3000);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBlogs();
  }, [token, navigate]);
  
  // Delete a blog
  const handleDelete = async (blogId) => {
    try {
      await axiosInstance.delete(`/api/blogs/delete/${blogId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBlogs((prev) => prev.filter((blog) => blog.blog_id !== blogId));
      setShowDeleteConfirm(null);
      setSuccess("Blog deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.blog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.blog_description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between  flex-col md:flex-row md:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <button 
            onClick={() => navigate("/createblog")}
            className="bg-[#7b7dfc] hover:bg-[#6a6ce8] text-white font-medium py-2 px-6 rounded-full shadow-sm transition duration-200"
          >
            Create New Blog
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">
              All Blogs <span className="text-sm text-gray-500 ml-2">({blogs.length})</span>
            </h2>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#7b7dfc] focus:border-[#7b7dfc] sm:text-sm"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Blog List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7b7dfc]"></div>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <div key={blog.blog_id} className="p-6 hover:bg-gray-50 transition duration-150">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.blog_name}</h3>
                      <p className="text-gray-600 line-clamp-2">{blog.blog_description}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {blog.tags && blog.tags.split(',').map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7b7dfc] bg-opacity-10 text-[#7b7dfc]">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>
                          Published: {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-3">
                      <button
                        onClick={() => navigate(`/editblog/${blog.blog_id}`)}
                        className="inline-flex items-center justify-center w-full md:w-24 px-4 py-2 border border-[#7b7dfc] text-[#7b7dfc] rounded-md text-sm font-medium hover:bg-[#7b7dfc] hover:text-white transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(blog.blog_id)}
                        className="inline-flex items-center justify-center w-full md:w-24 px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-500 hover:text-white transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No blogs found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm 
                  ? `No blogs matching "${searchTerm}"`
                  : "No blogs have been created yet"}
              </p>
              <button 
                onClick={() => navigate("/createblog")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b7dfc] hover:bg-[#6a6ce8]"
              >
                Create your first blog
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete this blog? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b7dfc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBlogs;