import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import { Title, Meta } from "react-head";
import { Map, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

function AddRoadmap() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    roadmap_name: "",
    roadmap_description: "",
    meta_title: "",
    meta_description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
       await axiosInstance.post("/api/roadmaps/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess("Roadmap added successfully!");
      setFormData({
        roadmap_name: "",
        roadmap_description: "",
        meta_title: "",
        meta_description: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add roadmap");
      console.error("Error adding roadmap:", err);
    }
  }

  return (
    <>
      <Title>Create New Roadmap | Learning Hub</Title>
      <Meta name="description" content="Create and design new learning roadmaps for your educational content" />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:px-8 space-y-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <Map size={32} />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 tracking-tight">
              Create New Roadmap
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Design comprehensive learning paths to guide students through their educational journey
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
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label htmlFor="roadmap_name" className="block text-lg font-semibold text-slate-900 mb-2">
                    Roadmap Name
                  </label>
                  <input
                    type="text"
                    id="roadmap_name"
                    name="roadmap_name"
                    value={formData.roadmap_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Complete Python Development Path"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="roadmap_description" className="block text-lg font-semibold text-slate-900 mb-2">
                    Roadmap Description
                  </label>
                  <textarea
                    id="roadmap_description"
                    name="roadmap_description"
                    value={formData.roadmap_description}
                    onChange={handleInputChange}
                    placeholder="Describe what learners will achieve through this roadmap..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    rows="4"
                    required
                  />
                </div>

                <div className="border-t-2 border-slate-100 pt-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">SEO Metadata</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="meta_title" className="block text-lg font-semibold text-slate-900 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="meta_title"
                        name="meta_title"
                        value={formData.meta_title}
                        onChange={handleInputChange}
                        placeholder="SEO-friendly title for better visibility"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="meta_description" className="block text-lg font-semibold text-slate-900 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        id="meta_description"
                        name="meta_description"
                        value={formData.meta_description}
                        onChange={handleInputChange}
                        placeholder="Brief description for search engine results..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                        rows="3"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium text-lg flex items-center justify-center gap-2 group"
              >
                <span>Create Roadmap</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddRoadmap;