import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";

function ManageConcepts() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [, setConcepts] = useState([]);
  const [groupedConcepts, setGroupedConcepts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editConcept, setEditConcept] = useState(null);
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
        const response = await fetch("http://localhost:7000/concept/allconcepts");
        if (!response.ok) {
          throw new Error("Failed to fetch concepts");
        }
        const data = await response.json();
        setConcepts(data);

         const grouped = data.reduce((acc, concept) => {
          acc[concept.roadmap_name] = acc[concept.roadmap_name] || [];
          acc[concept.roadmap_name].push(concept);
          return acc;
        }, {});
        setGroupedConcepts(grouped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConcepts();
  }, []);

  async function handleDelete(conceptId) {
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `http://localhost:7000/concept/delete/${conceptId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete concept");
      }
      setSuccess("Concept deleted successfully!");
      setConcepts((prev) =>
        prev.filter((concept) => concept.concept_id !== conceptId)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEdit(conceptId) {
    try {
      const response = await fetch(
        `http://localhost:7000/concept/concept/${conceptId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch concept details");
      }
      const data = await response.json();
      setEditConcept(data.concept_id);
      setEditData({
        concept_name: data.concept_name,
        concept_description: data.concept_description,
        concept_details: data.concept_details,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:7000/concept/edit/${editConcept}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update concept");
      }
      setSuccess("Concept updated successfully!");
      setEditConcept(null);
      setConcepts((prev) =>
        prev.map((concept) =>
          concept.concept_id === editConcept ? { ...concept, ...editData } : concept
        )
      );
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
 
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {loading ? (
          <p>Loading concepts...</p>
        ) : (
          Object.entries(groupedConcepts).map(([roadmapName, roadmapConcepts]) => (
            <div key={roadmapName} className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-indigo-600">{roadmapName}</h3>
              <ul className="divide-y divide-gray-200">
                {roadmapConcepts.map((concept) => (
                  <li
                    key={concept.concept_id}
                    className="flex justify-between items-center py-4"
                  >
                    <div>
                      <p className="text-lg font-medium">{concept.concept_name}</p>
                     </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(concept.concept_id)}
                        className="bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(concept.concept_id)}
                        className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {editConcept && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Edit Concept</h3>
      <form onSubmit={handleEditSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="concept_name"
            className="block text-sm font-medium text-gray-700"
          >
            Concept Name
          </label>
          <input
            type="text"
            id="concept_name"
            name="concept_name"
            value={editData.concept_name}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="concept_description"
            className="block text-sm font-medium text-gray-700"
          >
            Concept Description
          </label>
          <textarea
            id="concept_description"
            name="concept_description"
            value={editData.concept_description}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="concept_details"
            className="block text-sm font-medium text-gray-700"
          >
            Concept Details
          </label>
          <ReactQuill
            value={editData.concept_details}
            onChange={handleEditorChange}
            modules={quillModules}
            className="mt-1 rounded-md border border-gray-300"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditConcept(null)}
            className="py-2 px-4 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}

export default ManageConcepts;
