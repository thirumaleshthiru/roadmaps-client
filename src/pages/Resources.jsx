import { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const resourceTypes = ["all", "article", "video", "website", "course", "pdf"];
const ITEMS_PER_PAGE = 9;

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("http://localhost:7000/resources/resources");
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedResource(null);
      }
    };

    if (selectedResource) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [selectedResource]);

  const handleIncrementViews = async (resourceName) => {
    try {
      await fetch(`http://localhost:7000/resources/incrementviews/${resourceName}`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleOpenModal = (resource) => {
    setSelectedResource(resource);
    handleIncrementViews(resource.resource_name);
    setResources((prevResources) =>
      prevResources.map((res) =>
        res.resource_id === resource.resource_id
          ? { ...res, views: res.views + 1 }
          : res
      )
    );
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.resource_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" ||
      (selectedType === "video" ? resource.resource_type === "youtube" : resource.resource_type === selectedType);
    
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResources = filteredResources.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading amazing resources...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Resources | Learning Hub</title>
        <meta name="description" content="Access the latest learning resources without the hassle of choosing—eliminating the guesswork so you can focus on learning." />
      </Helmet>
      <div className="min-h-screen px-4 py-12 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Discover Learning Resources
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Curated content to accelerate your journey to mastery
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="relative mb-6">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" 
                size={24}
              />
              <input
                type="text"
                placeholder="Find your next learning adventure..."
                className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 bg-white text-slate-800 placeholder-slate-400 text-lg transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="bg-slate-100 p-2 rounded-lg mr-2">
                <Filter size={20} className="text-slate-600" />
              </div>
              <span className="text-slate-800 font-semibold mr-1">Filter:</span>
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-600"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {currentResources.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="text-slate-400 mb-6">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No resources found</h3>
              <p className="text-slate-600 mb-8 text-lg">
                We couldn't find any resources matching your criteria. Try adjusting your search or filter.
              </p>
              <button
                onClick={() => {setSearchQuery(""); setSelectedType("all");}}
                className="px-8 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-200 font-medium"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentResources.map((resource) => (
                <div
                  key={resource.resource_id}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {resource.resource_type === 'youtube' ? 'video' : resource.resource_type}
                    </span>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Eye size={16} className="mr-1.5" />
                      {resource.views.toLocaleString()}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 line-clamp-2">
                    {resource.resource_name}
                  </h3>
                  
                  <p className="text-slate-600 mb-8 text-lg leading-relaxed line-clamp-2">
                    {resource.resource_description || "No description available"}
                  </p>
                  
                  <button
                    onClick={() => handleOpenModal(resource)}
                    className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium flex items-center justify-center gap-2 text-lg group-hover:bg-indigo-600"
                  >
                    Explore Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-3 rounded-xl border-2 ${
                  currentPage === 1
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
                }`}
              >
                <ChevronLeft size={24} />
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
                    return <span key={pageNumber} className="text-slate-400">•••</span>;
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
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedResource && (
        <div 
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start z-10">
              <div className="flex-1 pr-6">
                <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-3 inline-block">
                  {selectedResource.resource_type === 'youtube' ? 'video' : selectedResource.resource_type}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedResource.resource_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                aria-label="Close modal"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center text-slate-500 text-sm">
                <Eye size={18} className="mr-2" />
                {selectedResource.views.toLocaleString()} learners have viewed this resource
              </div>

              <div className="prose max-w-none">
                {selectedResource.resource_description && (
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {selectedResource.resource_description}
                  </p>
                )}
                <div
                  className="mt-6 text-slate-800"
                  dangerouslySetInnerHTML={{ __html: selectedResource.content }}
                />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-6 flex justify-end">
                <button
                  onClick={() => setSelectedResource(null)}
                  className="px-6 py-3 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-200 font-medium text-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Resources;