import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance from "../utils/axiosInstance";

function EditBlog() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    blog_name: "",
    blog_description: "",
    blog_image: null,
    content: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await axiosInstance.get(`/api/blogs/blog/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const blog = response.data;
        
        try {
          const imageResponse = await fetch(blog.blog_image);
          const imageBlob = await imageResponse.blob();
          const imageFile = new File([imageBlob], "original_image.jpg", { type: imageBlob.type });
          
          setFormData({
            blog_name: blog.blog_name,
            blog_description: blog.blog_description,
            blog_image: imageFile,
            content: blog.content,
          });
        } catch (imageErr) {
          console.error("Error loading image:", imageErr);
          setError(`Error loading image: ${imageErr.message}`);
          // Still set the form data even if image loading fails
          setFormData({
            blog_name: blog.blog_name,
            blog_description: blog.blog_description,
            blog_image: null,
            content: blog.content,
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch blog data';
        console.error('Error:', errorMessage);
        setError(`Error: ${errorMessage}`);
      }
    }
    fetchBlog();
  }, [id, token]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditorChange(value) {
    setFormData((prev) => ({ ...prev, content: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, blog_image: file })); // Replace the image with the uploaded one
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("blog_name", formData.blog_name);
    formDataToSubmit.append("blog_description", formData.blog_description);
    formDataToSubmit.append("content", formData.content);
  
    if (formData.blog_image instanceof File) {
      formDataToSubmit.append("blog_image", formData.blog_image);
    }
  
    try {
      await axiosInstance.put(`/api/blogs/update/${id}`, formDataToSubmit, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
  
      setSuccess("Blog updated successfully!");
      setTimeout(() => {
        navigate("/manageblogs");
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update blog';
      console.error('Error:', errorMessage);
      setError(`Error: ${errorMessage}`);
    }
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "video"],
      ["code-block"],
      ["clean"],
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg md:max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600 text-center">Edit Blog</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="blog_name" className="block text-sm font-medium text-gray-700">
              Blog Name
            </label>
            <input
              type="text"
              id="blog_name"
              name="blog_name"
              value={formData.blog_name}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="blog_description" className="block text-sm font-medium text-gray-700">
              Blog Description
            </label>
            <textarea
              id="blog_description"
              name="blog_description"
              value={formData.blog_description}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="blog_image" className="block text-sm font-medium text-gray-700">
              Blog Image
            </label>
            <input
              type="file"
              id="blog_image"
              name="blog_image"
              onChange={handleFileChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              accept="image/*"
            />
            {formData.blog_image && typeof formData.blog_image === "object" && (
              <p className="text-sm text-gray-500 mt-2">Current Image: {formData.blog_image.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <ReactQuill
              id="content"
              value={formData.content}
              onChange={handleEditorChange}
              modules={quillModules}
              className="mt-1 min-h-[200px] overflow-hidden rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              theme="snow"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Update Blog
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;
