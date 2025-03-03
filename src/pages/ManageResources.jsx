import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function ManageResources() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
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
        const response = await fetch("http://localhost:7000/resources/resources");
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchResources();
  }, [token, navigate]);

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
      const response = await fetch(
        `http://localhost:7000/resources/update/${currentResource.resource_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        console.log(response.message)
        throw new Error("Failed to update resource");
      }
      setResources((prev) =>
        prev.map((res) =>
          res.resource_id === currentResource.resource_id
            ? { ...res, ...formData }
            : res
        )
      );
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a resource
  const handleDelete = async (resourceId) => {
    try {
      const response = await fetch(
        `http://localhost:7000/resources/delete/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }
      setResources((prev) => prev.filter((res) => res.resource_id !== resourceId));
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
        Manage Resources
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.resource_id}
            className="flex justify-between items-center bg-white shadow p-4 rounded-md"
          >
            <div>
              <h3 className="text-lg font-medium">{resource.resource_name}</h3>
              <p className="text-sm text-gray-600">{resource.resource_type}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => openEditModal(resource)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(resource.resource_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center ">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold text-center text-indigo-600 mb-4 mt-10 overflow-y-auto">
              Edit Resource
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resource Name
                </label>
                <input
                  type="text"
                  name="resource_name"
                  value={formData.resource_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resource Type
                </label>
                <select
                  name="resource_type"
                  value={formData.resource_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
                >
                  <option value="article">Article</option>
                  <option value="youtube">YouTube</option>
                  <option value="website">Website</option>
                  <option value="course">Course</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resource Description
                </label>
                <textarea
                  name="resource_description"
                  value={formData.resource_description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  className="border rounded focus:ring focus:ring-indigo-300"
                />
              </div>
              <button
                type="button"
                onClick={handleUpdate}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              >
                Update
              </button>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageResources;
