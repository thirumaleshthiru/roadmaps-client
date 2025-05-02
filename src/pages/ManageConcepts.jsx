import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function ManageConcepts() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [concepts, setConcepts] = useState([]);
  const [groupedConcepts, setGroupedConcepts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editConcept, setEditConcept] = useState(null);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [editData, setEditData] = useState({
    concept_name: "",
    concept_description: "",
    concept_details: "",
  });

  useEffect(() => {
    async function fetchConcepts() {
      try {
        const response = await axiosInstance.get("/api/concept/allconcepts");
        const data = response.data;
        setConcepts(data);
  
        const grouped = data.reduce((acc, concept) => {
          acc[concept.roadmap_name] = acc[concept.roadmap_name] || [];
          acc[concept.roadmap_name].push(concept);
          return acc;
        }, {});
        setGroupedConcepts(grouped);
        
        // Set the first roadmap as active by default
        if (Object.keys(grouped).length > 0 && !activeRoadmap) {
          setActiveRoadmap(Object.keys(grouped)[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConcepts();
  }, [activeRoadmap]);
  
  async function handleDelete(conceptId) {
    setError("");
    setSuccess("");
    try {
      await axiosInstance.delete(`/api/concept/delete/${conceptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Concept deleted successfully!");
      
      // Update the local state after deletion
      const updatedConcepts = concepts.filter(
        (concept) => concept.concept_id !== conceptId
      );
      setConcepts(updatedConcepts);
      
      // Regroup concepts
      const grouped = updatedConcepts.reduce((acc, concept) => {
        acc[concept.roadmap_name] = acc[concept.roadmap_name] || [];
        acc[concept.roadmap_name].push(concept);
        return acc;
      }, {});
      setGroupedConcepts(grouped);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      // Clear error message after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  }
  
  async function handleEdit(conceptId) {
    try {
      const response = await axiosInstance.get(`/api/concept/concept/${conceptId}`);
      const data = response.data;
      setEditConcept(data.concept_id);
      setEditData({
        concept_name: data.concept_name,
        concept_description: data.concept_description,
        concept_details: data.concept_details,
      });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  }
  
  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `/api/concept/edit/${editConcept}`,
        editData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Concept updated successfully!");
      
      // Update the local state after edit
      const updatedConcepts = concepts.map((concept) =>
        concept.concept_id === editConcept 
          ? { ...concept, ...editData } 
          : concept
      );
      setConcepts(updatedConcepts);
      
      // Regroup concepts
      const grouped = updatedConcepts.reduce((acc, concept) => {
        acc[concept.roadmap_name] = acc[concept.roadmap_name] || [];
        acc[concept.roadmap_name].push(concept);
        return acc;
      }, {});
      setGroupedConcepts(grouped);
      
      setEditConcept(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  }
  
  function handleEditorChange(value) {
    setEditData((prev) => ({ ...prev, concept_details: value }));
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
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

  const filteredConcepts = activeRoadmap && groupedConcepts[activeRoadmap] 
    ? groupedConcepts[activeRoadmap].filter(concept => 
        concept.concept_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between md:flex-row flex-col md:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Concept Management</h1>
          <button 
            className="bg-[#7b7dfc] hover:bg-[#6a6ce8] text-white font-medium py-2 px-6 rounded-full shadow-sm transition duration-200"
          >
            Add New Concept
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7b7dfc]"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Roadmaps</h2>
                </div>
                <div className="p-2">
                  <ul className="space-y-1">
                    {Object.keys(groupedConcepts).map((roadmapName) => (
                      <li key={roadmapName}>
                        <button
                          onClick={() => setActiveRoadmap(roadmapName)}
                          className={`w-full text-left px-3 py-2 rounded-md transition duration-150 ${
                            activeRoadmap === roadmapName
                              ? "bg-[#7b7dfc] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {roadmapName}
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white bg-opacity-20">
                            {groupedConcepts[roadmapName].length}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Search and Filter */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    {activeRoadmap ? `${activeRoadmap} Concepts` : "Select a Roadmap"}
                  </h2>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#7b7dfc] focus:border-[#7b7dfc] sm:text-sm"
                      placeholder="Search concepts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Concepts List */}
                <div className="divide-y divide-gray-200">
                  {activeRoadmap ? (
                    filteredConcepts.length > 0 ? (
                      filteredConcepts.map((concept) => (
                        <div key={concept.concept_id} className="p-4 hover:bg-gray-50 transition duration-150">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                              <h3 className="text-lg font-medium text-gray-900">{concept.concept_name}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{concept.concept_description}</p>
                            </div>
                            <div className="flex space-x-3 mt-2 sm:mt-0">
                              <button
                                onClick={() => handleEdit(concept.concept_id)}
                                className="inline-flex items-center px-3 py-1.5 border border-[#7b7dfc] text-[#7b7dfc] rounded-md text-sm font-medium hover:bg-[#7b7dfc] hover:text-white transition-colors duration-200"
                              >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(concept.concept_id)}
                                className="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-500 hover:text-white transition-colors duration-200"
                              >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No concepts found</h3>
                        <p className="mt-1 text-gray-500">
                          {searchTerm 
                            ? `No concepts matching "${searchTerm}" in ${activeRoadmap}`
                            : `No concepts in ${activeRoadmap} yet`}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="p-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">Select a roadmap</h3>
                      <p className="mt-1 text-gray-500">Choose a roadmap from the sidebar to view its concepts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editConcept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Edit Concept</h3>
              <button
                onClick={() => setEditConcept(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label htmlFor="concept_name" className="block text-sm font-medium text-gray-700">
                    Concept Name
                  </label>
                  <input
                    type="text"
                    id="concept_name"
                    name="concept_name"
                    value={editData.concept_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b7dfc] focus:border-[#7b7dfc]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="concept_description" className="block text-sm font-medium text-gray-700">
                    Concept Description
                  </label>
                  <textarea
                    id="concept_description"
                    name="concept_description"
                    value={editData.concept_description}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b7dfc] focus:border-[#7b7dfc]"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="concept_details" className="block text-sm font-medium text-gray-700">
                    Concept Details
                  </label>
                  <div className="mt-1 rounded-md border border-gray-300">
                    <ReactQuill
                      value={editData.concept_details}
                      onChange={handleEditorChange}
                      modules={quillModules}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditConcept(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b7dfc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className="bg-[#7b7dfc] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#6a6ce8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b7dfc]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageConcepts;