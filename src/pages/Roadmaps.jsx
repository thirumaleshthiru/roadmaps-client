import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance.js';
import { Map, Search,   AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { Helmet } from 'react-helmet-async';

const ITEMS_PER_PAGE = 6;
const DEBOUNCE_DELAY = 300;

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

function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const navigate = useNavigate();
  const [, currentUrl] = useCurrentLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const filterRoadmaps = useCallback((data, query) => {
    if (!query) return data;
    const lowercaseQuery = query.toLowerCase();
    return data.filter((roadmap) => 
      roadmap.roadmap_name.toLowerCase().includes(lowercaseQuery) ||
      roadmap.roadmap_description?.toLowerCase().includes(lowercaseQuery)
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRoadmaps = async () => {
      try {
        const cachedData = sessionStorage.getItem('roadmapsData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          // Sort roadmaps by name to maintain consistent order
          const sortedData = [...parsedData].sort((a, b) => 
            a.roadmap_name.localeCompare(b.roadmap_name)
          );
          setRoadmaps(sortedData);
          setLoading(false);
          
          const response = await axiosInstance.get('/api/roadmaps/roadmaps', {
            signal: controller.signal
          });
          // Sort the new data the same way
          const sortedResponseData = [...response.data.roadmaps].sort((a, b) => 
            a.roadmap_name.localeCompare(b.roadmap_name)
          );
          sessionStorage.setItem('roadmapsData', JSON.stringify(sortedResponseData));
          setRoadmaps(sortedResponseData);
        } else {
          const response = await axiosInstance.get('/api/roadmaps/roadmaps', {
            signal: controller.signal
          });
          // Sort the initial data
          const sortedResponseData = [...response.data.roadmaps].sort((a, b) => 
            a.roadmap_name.localeCompare(b.roadmap_name)
          );
          sessionStorage.setItem('roadmapsData', JSON.stringify(sortedResponseData));
          setRoadmaps(sortedResponseData);
          setLoading(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchRoadmaps();
    return () => controller.abort();
  }, []);

  const handleCardClick = useCallback(async (roadmapId, roadmapName) => {
    try {
      await axiosInstance.patch(`/api/roadmaps/updateviews/${roadmapId}`);
      navigate(`/roadmaps/${roadmapName.toLowerCase()}`);
    } catch (error) {
      // Handle error silently
    }
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const filteredRoadmaps = filterRoadmaps(roadmaps, debouncedSearchQuery);
  const totalPages = Math.ceil(filteredRoadmaps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRoadmaps = filteredRoadmaps.slice(startIndex, endIndex);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8">
          <div className="text-center mb-12">
            <div className="w-3/4 h-16 bg-gray-200 rounded-2xl mx-auto mb-6"></div>
            <div className="w-2/4 h-8 bg-gray-200 rounded-2xl mx-auto"></div>
          </div>
          <div className="max-w-3xl mx-auto mb-12">
            <div className="h-16 bg-gray-200 rounded-2xl w-full"></div>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learning Roadmaps | Education Hub</title>
        <meta name="description" content="Explore structured learning paths to guide your journey from beginner to expert in various skills and technologies." />
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8 space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Learning Roadmaps
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your personalized journey from beginner to expert in any field
            </p>
          </div>
          
          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search roadmaps by name or description..."
                  className="w-full pl-16 pr-16 h-16 rounded-2xl border-0 bg-white/80 backdrop-blur-sm text-gray-800 text-lg focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search roadmaps"
                />
                 
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          {filteredRoadmaps.length > 0 && (
            <div className="flex justify-between items-center max-w-7xl mx-auto px-1">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-indigo-600">{startIndex + 1}-{Math.min(endIndex, filteredRoadmaps.length)}</span> of <span className="font-semibold text-indigo-600">{filteredRoadmaps.length}</span> roadmaps
              </p>
            </div>
          )}
          
          {/* Roadmaps Grid */}
          <Suspense fallback={<SkeletonLoader />}>
            {currentRoadmaps.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center p-12 bg-white rounded-2xl shadow-xl">
                <div className="text-indigo-500 mb-6">
                  <AlertCircle size={56} className="mx-auto" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No roadmaps found</h3>
                <p className="text-gray-600 mb-8 text-lg">We couldn't find any roadmaps matching your search. Try different keywords or browse all roadmaps.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  View All Roadmaps
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentRoadmaps.map((roadmap) => (
                  <div
                    key={roadmap.roadmap_id}
                    onClick={() => handleCardClick(roadmap.roadmap_id, roadmap.roadmap_name)}
                    className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-2 text-sm font-semibold rounded-full bg-indigo-500/10 text-indigo-600">Roadmap</span>
                      <Map className="text-indigo-500" size={28} aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">{roadmap.roadmap_name}</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">{roadmap.roadmap_description || "Start your learning journey with this structured roadmap."}</p>
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
            )}
          </Suspense>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-3 mt-12" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-3 rounded-xl border-2 ${
                  currentPage === 1
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-500 hover:text-indigo-500"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;
                const isWithinRange =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1;
                  
                if (!isWithinRange) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return <span key={pageNumber} className="text-gray-400">•••</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-12 h-12 rounded-xl text-lg font-medium ${
                      isCurrentPage
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-500 hover:text-indigo-500"
                    }`}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-3 rounded-xl border-2 ${
                  currentPage === totalPages
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-500 hover:text-indigo-500"
                }`}
                aria-label="Next page"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}

export default Roadmaps;