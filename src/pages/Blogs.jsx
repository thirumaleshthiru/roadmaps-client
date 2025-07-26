import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Title, Meta, Link } from 'react-head';
import { useCurrentLocation } from '../utils/useFulFunctions';
const Blogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [, currentUrl] = useCurrentLocation();
  const postsPerPage = 6;

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get("/api/blogs/blogs");
        setPosts(response.data);  
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const encodeId = (id) => {
    return btoa(id.toString());
  };

  const handleViewPost = (postName, blogId) => {
    const urlFriendlyName = postName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const encodedId = encodeId(blogId);
    navigate(`/post/${urlFriendlyName}/${encodedId}`);
  };
 
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7b7dfc]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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
      </div>
    );
  }

  return (
    <>
      <Title>EasyRoadmaps - Blog</Title>
      <Meta name="description" content="our latest articles on technology, motivation, and career development. Stay updated with the newest trends in software and the tech industry." />
       <Link rel='canonical' href={currentUrl} />

      <div className="min-h-screen">
        <header className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center">Blog Posts</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {currentPosts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <article 
                className="cursor-pointer group"
                onClick={() => handleViewPost(currentPosts[0].blog_name, currentPosts[0].blog_id)}
              >
                <div className="grid md:grid-cols-2 gap-8 p-6">
                  <div>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(currentPosts[0].created_at).toLocaleDateString()} • {currentPosts[0].views} views
                    </span>
                    <h2 className="font-serif text-4xl font-bold mt-2 mb-6 group-hover:text-[#7b7dfc] transition-colors">
                      {currentPosts[0].blog_name}
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                      {currentPosts[0].blog_description}
                    </p>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <img
                      src={`http://localhost:7000/${currentPosts[0].blog_image}`}
                      alt={currentPosts[0].blog_name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x600";
                      }}
                    />
                  </div>
                </div>
              </article>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-6">
            {currentPosts.slice(1).map((post, index) => (
              <article 
                key={post.blog_id}
                className={`cursor-pointer group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
                  index % 5 === 0 ? 'md:col-span-8' : 'md:col-span-4'
                }`}
                onClick={() => handleViewPost(post.blog_name, post.blog_id)}
              >
                <div className={`${index % 5 === 0 ? 'grid md:grid-cols-2 gap-6' : ''} p-6`}>
                  <div className="aspect-video overflow-hidden rounded-lg mb-4">
                    <img
                      src={`http://localhost:7000/${post.blog_image}`}
                      alt={post.blog_name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300";
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()} • {post.views} views
                    </span>
                    <h3 className={`font-serif font-bold mt-2 mb-3 group-hover:text-[#7b7dfc] transition-colors ${
                      index % 5 === 0 ? 'text-3xl' : 'text-xl'
                    }`}>
                      {post.blog_name}
                    </h3>
                    <p className={`text-gray-600 ${
                      index % 5 === 0 ? 'text-lg' : 'text-base line-clamp-3'
                    }`}>
                      {post.blog_description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#7b7dfc] text-white hover:bg-[#6a6ce8]'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  currentPage === index + 1
                    ? 'bg-[#7b7dfc] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#7b7dfc] text-white hover:bg-[#6a6ce8]'
              }`}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default Blogs;