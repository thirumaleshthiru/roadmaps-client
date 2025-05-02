import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FileText, Image,  Type } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

function AddBlog() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    blog_name: "",
    blog_description: "",
    blog_image: null,
    content: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditorChange(value) {
    setFormData((prev) => ({ ...prev, content: value }));
  }

  function handleFileChange(e) {
    setFormData((prev) => ({ ...prev, blog_image: e.target.files[0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('blog_name', formData.blog_name);
    formDataToSubmit.append('blog_description', formData.blog_description);
    formDataToSubmit.append('content', formData.content);

    if (formData.blog_image) {
      formDataToSubmit.append('blog_image', formData.blog_image);
    }

    try {
      await axiosInstance.post("/api/blogs/add", formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Blog added successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add blog";
      setError(errorMsg);
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
    <>
      <Helmet>
        <title>Add Blog | Learning Hub</title>
        <meta
          name="description"
          content="Create and publish new blog articles"
        />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:px-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Create New Blog
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Share your knowledge and insights with the community
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Type className="text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-900">Blog Details</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="blog_name" className="block text-sm font-medium text-slate-700 mb-2">
                    Blog Title
                  </label>
                  <input
                    type="text"
                    id="blog_name"
                    name="blog_name"
                    value={formData.blog_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="blog_description" className="block text-sm font-medium text-slate-700 mb-2">
                    Blog Description
                  </label>
                  <textarea
                    id="blog_description"
                    name="blog_description"
                    value={formData.blog_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Image className="text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-900">Featured Image</h2>
              </div>

              <div>
                <label htmlFor="blog_image" className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  id="blog_image"
                  name="blog_image"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  accept="image/*"
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-900">Blog Content</h2>
              </div>

              <div>
                <ReactQuill
                  value={formData.content}
                  onChange={handleEditorChange}
                  modules={quillModules}
                  className="h-64 mb-12"
                  theme="snow"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium text-lg flex items-center justify-center gap-2"
            >
              Publish Blog
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddBlog;
