import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance.js';
import { ArrowRight, Zap, Map } from 'lucide-react';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { Title, Meta } from 'react-head';

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="w-32 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="w-4/5 h-8 bg-gray-200 rounded-lg mb-6"></div>
        <div className="space-y-3 mb-8">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
          <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
      </div>
    ))}
  </div>
);

function PopularRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [, currentUrl] = useCurrentLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get('/api/roadmaps/popularroadmaps')
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
    axiosInstance
      .patch(`/api/roadmaps/updateviews/${roadmapId}`)
      .then(() => {
        navigate(`/roadmaps/${roadmapName.toLowerCase()}`);
      })
      .catch((error) => console.error('Error incrementing view count:', error));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8">
          <div className="text-center mb-12">
            <div className="w-3/4 h-16 bg-gray-200 rounded-2xl mx-auto mb-6"></div>
            <div className="w-2/4 h-8 bg-gray-200 rounded-2xl mx-auto"></div>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <>
      <Title>Popular Roadmaps | Easy Roadmaps</Title>
      <Meta name="description" content="Explore our most popular learning roadmaps curated by experts for Java, Python, UI/UX, Figma, and more." />
      <Meta rel="canonical" href={currentUrl} />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8 space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 font-semibold">
              <Zap size={18} />
              <span>Most Popular</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              Trending Learning Paths
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our most popular roadmaps chosen by thousands of learners
            </p>
          </div>

          {/* Featured Roadmap */}
          {roadmaps.length > 0 && (
            <div 
              onClick={() => handleCardClick(roadmaps[0].roadmap_id, roadmaps[0].roadmap_name)}
              className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
              role="button"
              tabIndex={0}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-indigo-500/10 text-indigo-600">
                  Featured Roadmap
                </span>
                <Map className="text-indigo-500" size={28} aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
                {roadmaps[0].roadmap_name}
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed line-clamp-5">
                {roadmaps[0].roadmap_description || "Start your learning journey with this popular structured roadmap."}
              </p>
              <button 
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                aria-label={`View ${roadmaps[0].roadmap_name} roadmap`}
              >
                <span>Start Learning</span>
                <ArrowRight size={20} aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          )}

          {/* Rest of Popular Roadmaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roadmaps.slice(1).map((roadmap) => (
              <div
                key={roadmap.roadmap_id}
                onClick={() => handleCardClick(roadmap.roadmap_id, roadmap.roadmap_name)}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                role="button"
                tabIndex={0}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-2 text-sm font-semibold rounded-full bg-indigo-500/10 text-indigo-600">
                    Popular
                  </span>
                  <Map className="text-indigo-500" size={28} aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                  {roadmap.roadmap_name}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">
                  {roadmap.roadmap_description || "Start your learning journey with this structured roadmap."}
                </p>
                <button
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  aria-label={`View ${roadmap.roadmap_name} roadmap`}
                >
                  <span>View Roadmap</span>
                  <ArrowRight size={20} aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/roadmaps')}
              className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all duration-300 font-medium border-2 border-gray-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
              aria-label="Explore all roadmaps"
            >
              <span>Explore All Roadmaps</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PopularRoadmaps;