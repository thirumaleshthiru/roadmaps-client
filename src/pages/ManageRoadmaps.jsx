import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
function ManageRoadmaps() {
  const { token } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        const response = await fetch("http://localhost:7000/roadmaps/roadmapnames");
        if (!response.ok) {
          throw new Error("Failed to fetch roadmaps");
        }
        const data = await response.json();
        setRoadmaps(data);
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
      const response = await fetch(
        `http://localhost:7000/roadmaps/delete/${roadmapId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete roadmap");
      }

      setSuccess("Roadmap deleted successfully!");
      setRoadmaps((prev) =>
        prev.filter((roadmap) => roadmap.roadmap_id !== roadmapId)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Roadmaps</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {loading ? (
          <p className="text-gray-600">Loading roadmaps...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {roadmaps.map((roadmap) => (
              <li
                key={roadmap.roadmap_id}
                className="flex justify-between items-center py-4"
              >
                <span className="text-gray-800 text-lg">
                  {roadmap.roadmap_name}
                </span>
                <button
                  onClick={() => handleDelete(roadmap.roadmap_id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ManageRoadmaps;
