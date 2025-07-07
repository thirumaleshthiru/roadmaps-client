import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import { Title, Meta } from "react-head";
import { Library, AlertCircle, CheckCircle2, ArrowRight, Youtube, Globe, FileText, Book, FileIcon } from "lucide-react";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axiosInstance from "../utils/axiosInstance";

function AddResource() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    resource_name: "",
    resource_type: "article",
    content: "",
    resource_description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resourceTypes = [
    { value: "article", label: "Article", icon: <FileText size={20} /> },
    { value: "youtube", label: "YouTube", icon: <Youtube size={20} /> },
    { value: "website", label: "Website", icon: <Globe size={20} /> },
    { value: "course", label: "Course", icon: <Book size={20} /> },
    { value: "pdf", label: "PDF", icon: <FileIcon size={20} /> }
  ];

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditorChange(value) {
    setFormData((prev) => ({ ...prev, content: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
        await axiosInstance.post("/api/resources/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Resource added successfully!");
      setFormData({
        resource_name: "",
        resource_type: "article",
        content: "",
        resource_description: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add resource");
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
      <Title>Add New Resource | Learning Hub</Title>
      <Meta name="description" content="Add new learning resources including articles, videos, and courses" />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:px-8 space-y-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <Library size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Add New Resource
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Create and share valuable learning resources with your students
            </p>
          </div>

          {(error || success) && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {error ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
              <p className="text-lg font-medium">{error || success}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-8">
                <div>
                  <label htmlFor="resource_name" className="block text-lg font-semibold text-slate-900 mb-2">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    id="resource_name"
                    name="resource_name"
                    value={formData.resource_name}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive name for your resource"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="resource_type" className="block text-lg font-semibold text-slate-900 mb-2">
                    Resource Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {resourceTypes.map(({ value, label, icon }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.resource_type === value
                            ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                            : "border-slate-200 hover:border-indigo-600/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="resource_type"
                          value={value}
                          checked={formData.resource_type === value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        {icon}
                        <span className="font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="resource_description" className="block text-lg font-semibold text-slate-900 mb-2">
                    Resource Description
                  </label>
                  <textarea
                    id="resource_description"
                    name="resource_description"
                    value={formData.resource_description}
                    onChange={handleInputChange}
                    placeholder="Provide a brief description of this resource..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-lg font-semibold text-slate-900 mb-2">
                    Content
                  </label>
                  <div className="rounded-xl border-2 border-slate-200 overflow-hidden focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all duration-200">
                    <ReactQuill
                      id="content"
                      value={formData.content}
                      onChange={handleEditorChange}
                      modules={quillModules}
                      className="min-h-[300px]"
                      theme="snow"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium text-lg flex items-center justify-center gap-2 group"
              >
                <span>Add Resource</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddResource;
