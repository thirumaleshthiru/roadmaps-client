import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowRight, Zap } from 'lucide-react';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { Helmet } from 'react-helmet-async';

function PopularRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [, currentUrl] = useCurrentLocation();

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:7000/roadmaps/popularroadmaps')
      .then((response) => {
        setRoadmaps(response.data.popularRoadmaps);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching roadmaps:', error);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (roadmapId, roadmapName) => {
    axios
      .patch(`http://localhost:7000/roadmaps/updateviews/${roadmapId}`)
      .then(() => {
        navigate(`/roadmaps/${roadmapName.toLowerCase()}`);
      })
      .catch((error) => console.error('Error incrementing view count:', error));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading popular roadmaps...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Popular Roadmaps | Learning Hub</title>
        <meta
          name="description"
          content="Explore our most popular learning roadmaps curated by experts for Java, Python, UI/UX, Figma, and more."
        />
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      <div className="min-h-screen px-4 py-12 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 font-semibold mb-4">
              <Zap size={18} />
              <span>Most Popular</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Trending Learning Paths
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover our most popular roadmaps chosen by thousands of learners
            </p>
          </div>

          {/* Featured Roadmap */}
          {roadmaps.length > 0 && (
            <div 
              onClick={() => handleCardClick(roadmaps[0].roadmap_id, roadmaps[0].roadmap_name)}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      Featured Roadmap
                    </span>
                    <FileText className="text-indigo-600" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 capitalize">
                    {roadmaps[0].roadmap_name}
                  </h2>
                  <p className="text-slate-600 mb-8 text-lg   leading-relaxed line-clamp-5" >
                    {roadmaps[0].roadmap_description || "Start your learning journey with this popular structured roadmap."}
                  </p>
                  <button className="px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium flex items-center gap-2 text-lg group-hover:bg-indigo-600">
                    <span>Start Learning</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Popular Roadmaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {roadmaps.slice(1).map((roadmap) => (
              <div
                key={roadmap.roadmap_id}
                onClick={() => handleCardClick(roadmap.roadmap_id, roadmap.roadmap_name)}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                    Popular
                  </span>
                  <FileText className="text-indigo-600" size={24} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4 capitalize">
                  {roadmap.roadmap_name}
                </h3>
                
                <p className="text-slate-600 mb-8 text-lg leading-relaxed line-clamp-3">
                  {roadmap.roadmap_description || "Start your learning journey with this structured roadmap."}
                </p>
                
                <button className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium flex items-center justify-center gap-2 text-lg group-hover:bg-indigo-600">
                  <span>View Roadmap</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/roadmaps')}
              className="px-8 py-4 bg-white text-slate-700 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all duration-300 font-medium border-2 border-slate-200 flex items-center gap-2 mx-auto"
            >
              <span>Explore All Roadmaps</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PopularRoadmaps;