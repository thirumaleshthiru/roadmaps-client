import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axiosInstance from "../utils/axiosInstance";

function ManageRoadmaps() {
  const { token } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        const response = await axiosInstance.get("/api/roadmaps/roadmapnames");
        setRoadmaps(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmaps();
  }, []);
  
  async function handleDelete(roadmapId) {
    setError("");
    setSuccess("");
    try {
      await axiosInstance.delete(`/api/roadmaps/delete/${roadmapId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Roadmap deleted successfully!");
      setRoadmaps((prev) =>
        prev.filter((roadmap) => roadmap.roadmap_id !== roadmapId)
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  }

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.roadmap_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Manage Roadmaps | Learning Hub</title>
        <meta
          name="description"
          content="Manage and organize learning roadmaps"
        />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between md:flex-row flex-col md:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Roadmap Management</h1>
          <button 
            onClick={() => navigate("/addroadmap")}
            className="bg-[#7b7dfc] hover:bg-[#6a6ce8] text-white font-medium py-2 px-6 rounded-full shadow-sm transition duration-200"
          >
            Add New Roadmap
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#7b7dfc] focus:border-[#7b7dfc] sm:text-sm"
                  placeholder="Search roadmaps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredRoadmaps.length > 0 ? (
                filteredRoadmaps.map((roadmap) => (
                  <div key={roadmap.roadmap_id} className="p-4 hover:bg-gray-50 transition duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-lg font-medium text-gray-900">{roadmap.roadmap_name}</h3>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDelete(roadmap.roadmap_id)}
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
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No roadmaps found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm 
                      ? `No roadmaps matching "${searchTerm}"`
                      : "No roadmaps available yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageRoadmaps;
