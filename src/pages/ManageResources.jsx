import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axiosInstance from "../utils/axiosInstance";

function ManageResources() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [groupedResources, setGroupedResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    resource_name: "",
    resource_type: "",
    resource_description: "",
    content: "",
  });

  // Fetch all resources on mount
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  
    async function fetchResources() {
      try {
        const response = await axiosInstance.get("/api/resources/resources");
        const data = response.data;
        setResources(data);
  
        // Group resources by type
        const grouped = data.reduce((acc, resource) => {
          acc[resource.resource_type] = acc[resource.resource_type] || [];
          acc[resource.resource_type].push(resource);
          return acc;
        }, {});
        setGroupedResources(grouped);
        
        // Set the first type as active by default
        if (Object.keys(grouped).length > 0 && !activeType) {
          setActiveType(Object.keys(grouped)[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  
    fetchResources();
  }, [token, navigate, activeType]);
  
  // Open the modal for editing
  const openEditModal = (resource) => {
    setCurrentResource(resource);
    setFormData({
      resource_name: resource.resource_name,
      resource_type: resource.resource_type,
      resource_description: resource.resource_description,
      content: resource.content,
    });
    setModalOpen(true);
  };

  // Handle input change for fields other than content
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle content change in Quill editor
  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  // Update a resource
  const handleUpdate = async () => {
    try {
      await axiosInstance.put(
        `/api/resources/update/${currentResource.resource_id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the local state after edit
      const updatedResources = resources.map((res) =>
        res.resource_id === currentResource.resource_id ? { ...res, ...formData } : res
      );
      setResources(updatedResources);
      
      // Regroup resources
      const grouped = updatedResources.reduce((acc, resource) => {
        acc[resource.resource_type] = acc[resource.resource_type] || [];
        acc[resource.resource_type].push(resource);
        return acc;
      }, {});
      setGroupedResources(grouped);
      
      setModalOpen(false);
      setSuccess("Resource updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Delete a resource
  const handleDelete = async (resourceId) => {
    try {
      await axiosInstance.delete(`/api/resources/delete/${resourceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update the local state after deletion
      const updatedResources = resources.filter((res) => res.resource_id !== resourceId);
      setResources(updatedResources);
      
      // Regroup resources
      const grouped = updatedResources.reduce((acc, resource) => {
        acc[resource.resource_type] = acc[resource.resource_type] || [];
        acc[resource.resource_type].push(resource);
        return acc;
      }, {});
      setGroupedResources(grouped);
      
      setSuccess("Resource deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

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

  const filteredResources = activeType && groupedResources[activeType] 
    ? groupedResources[activeType].filter(resource => 
        resource.resource_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between md:flex-row flex-col md:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <button 
            onClick={() => navigate("/addresource")}
            className="bg-[#7b7dfc] hover:bg-[#6a6ce8] text-white font-medium py-2 px-6 rounded-full shadow-sm transition duration-200"
          >
            Add New Resource
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
                  <h2 className="text-lg font-medium text-gray-900">Resource Types</h2>
                </div>
                <div className="p-2">
                  <ul className="space-y-1">
                    {Object.keys(groupedResources).map((type) => (
                      <li key={type}>
                        <button
                          onClick={() => setActiveType(type)}
                          className={`w-full text-left px-3 py-2 rounded-md transition duration-150 ${
                            activeType === type
                              ? "bg-[#7b7dfc] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {type}
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white bg-opacity-20">
                            {groupedResources[type].length}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b7dfc] focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.resource_id}
                    className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{resource.resource_name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{resource.resource_type}</p>
                          <p className="mt-2 text-sm text-gray-600">{resource.resource_description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(resource)}
                            className="px-4 py-2 bg-[#7b7dfc] text-white rounded-md hover:bg-[#6a6ce8] transition duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(resource.resource_id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Resource</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      name="resource_name"
                      value={formData.resource_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b7dfc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Type
                    </label>
                    <select
                      name="resource_type"
                      value={formData.resource_type}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b7dfc] focus:border-transparent"
                    >
                      <option value="article">Article</option>
                      <option value="youtube">YouTube</option>
                      <option value="website">Website</option>
                      <option value="course">Course</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Description
                    </label>
                    <textarea
                      name="resource_description"
                      value={formData.resource_description}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b7dfc] focus:border-transparent"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      className="border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7b7dfc] focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-[#7b7dfc] text-white rounded-md hover:bg-[#6a6ce8] transition duration-200"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageResources;
