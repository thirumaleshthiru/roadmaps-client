import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Title, Meta } from 'react-head';
import axiosInstance from "../utils/axiosInstance";
import { useCurrentLocation } from "../utils/useFulFunctions";
const Post = () => {
  const { blog_id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [,currentUrl] = useCurrentLocation();
  const hasIncrementedView = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const decodeId = (encodedId) => {
    try {
      return atob(encodedId);
    } catch (e) {
      console.error("Error decoding ID:", e);
      return null;
    }
  };

  useEffect(() => {
    const decodedId = decodeId(blog_id);
    if (!decodedId) {
      setError("Invalid blog ID");
      return;
    }

    let isMounted = true;

    const fetchPostAndIncrementView = async () => {
      try {
        // Fetch the blog post using Axios instance
        const response = await axiosInstance.get(`/api/blogs/blog/${decodedId}`);
        if (isMounted) {
          setPost(response.data);

          // Increment view count (only once)
          if (!hasIncrementedView.current) {
            hasIncrementedView.current = true;
            await axiosInstance.patch(`/api/blogs/incrementviews/${decodedId}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      }
    };

    fetchPostAndIncrementView();

    return () => {
      isMounted = false;
    };
  }, [blog_id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Post</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Helper function to truncate description for meta tag (recommended 150-160 characters)
  const truncateDescription = (text, maxLength = 155) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <>
      <Title>{post.blog_name}</Title>
      <Meta name="description" content={truncateDescription(post.blog_description)} />
      <Meta property="og:title" content={post.blog_name} />
      <Meta property="og:description" content={truncateDescription(post.blog_description)} />
      <Meta property="og:image" content={`http://localhost:7000/${post.blog_image}`} />
      <Meta property="og:type" content="article" />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={post.blog_name} />
      <Meta name="twitter:description" content={truncateDescription(post.blog_description)} />
      <Meta name="twitter:image" content={`http://localhost:7000/${post.blog_image}`} />
      <link rel="canonical" href= {currentUrl} />

      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden rounded-t-lg">
            <img
              src={`http://localhost:7000/${post.blog_image}`}
              alt={post.blog_name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300";
              }}
            />
          </div>
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.blog_name}
            </h1>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;