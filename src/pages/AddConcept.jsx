import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function AddConcept() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    concept_name: "",
    concept_description: "",
    concept_details: "",
    roadmap_id: "",
  });
  const [roadmaps, setRoadmaps] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        const response = await fetch("http://localhost:7000/roadmaps/roadmapnames", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch roadmaps");
        }
        const data = await response.json();
        setRoadmaps(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchRoadmaps();
  }, [token]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditorChange(value) {
    setFormData((prev) => ({ ...prev, concept_details: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:7000/concept/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add concept");
      }

      setSuccess("Concept added successfully!");
      setError("");
    } catch (err) {
      setError(err.message);
      setSuccess("");
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
        <title>Add New Concept | Learning Hub</title>
        <meta
          name="description"
          content="Create and add new learning concepts to your roadmaps"
        />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:px-8 space-y-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <FileText size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Add New Concept
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Create comprehensive learning materials for your roadmaps
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
              <div className="space-y-6">
                <div>
                  <label htmlFor="concept_name" className="block text-lg font-semibold text-slate-900 mb-2">
                    Concept Name
                  </label>
                  <input
                    type="text"
                    id="concept_name"
                    name="concept_name"
                    value={formData.concept_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="roadmap_id" className="block text-lg font-semibold text-slate-900 mb-2">
                    Select Roadmap
                  </label>
                  <select
                    id="roadmap_id"
                    name="roadmap_id"
                    value={formData.roadmap_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    required
                  >
                    <option value="" disabled>Select a roadmap</option>
                    {roadmaps.map((roadmap) => (
                      <option key={roadmap.roadmap_id} value={roadmap.roadmap_id}>
                        {roadmap.roadmap_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="concept_description" className="block text-lg font-semibold text-slate-900 mb-2">
                    Concept Description
                  </label>
                  <textarea
                    id="concept_description"
                    name="concept_description"
                    value={formData.concept_description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 text-slate-800 text-lg transition-all duration-200"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="concept_details" className="block text-lg font-semibold text-slate-900 mb-2">
                    Concept Details
                  </label>
                  <div className="rounded-xl border-2 border-slate-200 overflow-hidden focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all duration-200">
                    <ReactQuill
                      id="concept_details"
                      value={formData.concept_details}
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
                className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium text-lg flex items-center justify-center gap-2"
              >
                Add Concept
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddConcept;