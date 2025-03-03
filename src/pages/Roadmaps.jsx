import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { Helmet } from 'react-helmet-async';

// Constants
const ITEMS_PER_PAGE = 2;
const DEBOUNCE_DELAY = 300;

// Skeleton loader component for content
const SkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
          <div className="w-6 h-6 bg-slate-200 rounded"></div>
        </div>
        <div className="w-3/4 h-8 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2 mb-8">
          <div className="w-full h-4 bg-slate-200 rounded"></div>
          <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
          <div className="w-4/6 h-4 bg-slate-200 rounded"></div>
        </div>
        <div className="w-full h-12 bg-slate-200 rounded-xl"></div>
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

  // Memoized filter function
  const filterRoadmaps = useCallback((data, query) => {
    if (!query) return data;
    const lowercaseQuery = query.toLowerCase();
    return data.filter((roadmap) => 
      roadmap.roadmap_name.toLowerCase().includes(lowercaseQuery) ||
      roadmap.roadmap_description.toLowerCase().includes(lowercaseQuery)
    );
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Data fetching with error handling and caching
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchRoadmaps = async () => {
      try {
        const cachedData = sessionStorage.getItem('roadmapsData');
        if (cachedData) {
          setRoadmaps(JSON.parse(cachedData));
          setLoading(false);
          
          // Refresh cache in background
          const response = await axios.get('http://localhost:7000/roadmaps/roadmaps', {
            signal: controller.signal
          });
          sessionStorage.setItem('roadmapsData', JSON.stringify(response.data.roadmaps));
          setRoadmaps(response.data.roadmaps);
        } else {
          const response = await axios.get('http://localhost:7000/roadmaps/roadmaps', {
            signal: controller.signal
          });
          sessionStorage.setItem('roadmapsData', JSON.stringify(response.data.roadmaps));
          setRoadmaps(response.data.roadmaps);
          setLoading(false);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching roadmaps:', error);
          setLoading(false);
        }
      }
    };

    fetchRoadmaps();

    return () => controller.abort();
  }, []);

  const handleCardClick = useCallback(async (roadmapId, roadmapName) => {
    try {
      await axios.patch(`http://localhost:7000/roadmaps/updateviews/${roadmapId}`);
      navigate(`/roadmaps/${roadmapName.toLowerCase()}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, [navigate]);

  // Reset page on search
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
          <div className="text-center mb-12">
            <div className="w-3/4 h-12 bg-slate-200 rounded-lg mx-auto mb-4"></div>
            <div className="w-2/4 h-6 bg-slate-200 rounded-lg mx-auto"></div>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Expert Roadmaps | Learning Hub</title>
        <meta
          name="description"
          content="Master skills at your own pace using our expert roadmaps for Java, Python, UI/UX, Figma, and more."
        />
        <link rel="canonical" href={currentUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="http://localhost:7000" />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Learning Roadmaps
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Structured paths to guide your learning journey from beginner to expert
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" 
                size={24}
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search roadmaps by name or description..."
                className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 bg-white text-slate-800 placeholder-slate-400 text-lg transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search roadmaps"
              />
            </div>
          </div>

          <Suspense fallback={<SkeletonLoader />}>
            {currentRoadmaps.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="text-slate-400 mb-6">
                  <Search size={48} className="mx-auto" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">No roadmaps found</h3>
                <p className="text-slate-600 mb-8 text-lg">
                  We couldn't find any roadmaps matching your search. Try different keywords or browse all roadmaps.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 text-lg font-medium"
                >
                  View All Roadmaps
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {currentRoadmaps.map((roadmap) => (
                  <div
                    key={roadmap.roadmap_id}
                    onClick={() => handleCardClick(roadmap.roadmap_id, roadmap.roadmap_name)}
                    className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer relative overflow-hidden"
                    role="button"
                    tabIndex={0}
                    style={{ contain: 'content' }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                        Roadmap
                      </span>
                      <FileText className="text-indigo-600" size={24} aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 capitalize">
                      {roadmap.roadmap_name}
                    </h3>
                    
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed line-clamp-3">
                      {roadmap.roadmap_description || "Start your learning journey with this structured roadmap."}
                    </p>
                    
                    <button 
                      className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium flex items-center justify-center gap-2 text-lg group-hover:bg-indigo-600"
                      aria-label={`View ${roadmap.roadmap_name} roadmap`}
                    >
                      <span>View Roadmap</span>
                      <ArrowRight size={20} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Suspense>

          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-3 mt-12" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-3 rounded-xl border-2 ${
                  currentPage === 1
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
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
                    return <span key={pageNumber} className="text-slate-400" aria-hidden="true">•••</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-12 h-12 rounded-xl text-lg font-medium border-2 ${
                      isCurrentPage
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
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
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
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