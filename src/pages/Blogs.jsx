import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Helmet } from 'react-helmet-async';
const Blogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get("/blogs/blogs");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Posts</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blogs</title>
        <meta name="description" content="Read our latest blogs and know the latest trends in software and technology" />
      </Helmet>
      <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPosts.length > 0 && (
          <div className="border-b border-gray-200 pb-12 mb-12">
            <article 
              className="cursor-pointer group"
              onClick={() => handleViewPost(currentPosts[0].blog_name, currentPosts[0].blog_id)}
            >
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <span className="text-xs font-medium text-gray-500">
                    {new Date(currentPosts[0].created_at).toLocaleDateString()} • {currentPosts[0].views} views
                  </span>
                  <h2 className="font-serif text-5xl font-bold mt-2 mb-6 group-hover:text-blue-900 transition-colors">
                    {currentPosts[0].blog_name}
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {currentPosts[0].blog_description}
                  </p>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={`http://localhost:7000/${currentPosts[0].blog_image}`}
                    alt={currentPosts[0].blog_name}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x600";
                    }}
                  />
                </div>
              </div>
            </article>
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-8">
          {currentPosts.slice(1).map((post, index) => (
            <article 
              key={post.blog_id}
              className={`cursor-pointer group md:border-none border-b border-gray-200 pb-8 mb-8 last:border-b-0 last:pb-0 last:mb-0 ${
                index % 5 === 0 ? 'md:col-span-8' : 'md:col-span-4'
              }`}
              onClick={() => handleViewPost(post.blog_name, post.blog_id)}
            >
              <div className={`${index % 5 === 0 ? 'grid md:grid-cols-2 gap-6' : ''}`}>
                <div className="aspect-video overflow-hidden mb-4">
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
                  <h3 className={`font-serif font-bold mt-2 mb-3 group-hover:text-blue-900 transition-colors ${
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
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
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