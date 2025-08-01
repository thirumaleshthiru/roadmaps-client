"use client"

import { useState, useEffect, useCallback, Suspense, useRef } from "react"
import { Search, X, AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Eye, Filter } from "lucide-react"
import { Title, Meta } from "react-head"
import axiosInstance from "../utils/axiosInstance"
import { useCurrentLocation } from "../utils/useFulFunctions"

const resourceTypes = ["all", "article", "video", "website", "course", "pdf"]
const ITEMS_PER_PAGE = 6
const DEBOUNCE_DELAY = 300

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
)

const Resources = () => {
  const [resources, setResources] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedResource, setSelectedResource] = useState(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [originalUrl, setOriginalUrl] = useState("")
  const [pageTitle, setPageTitle] = useState("Learning Resources | Education Hub")
  const modalRef = useRef(null)
  const filterModalRef = useRef(null)
  const [, currentUrl] = useCurrentLocation()

  // Store original URL on component mount
  useEffect(() => {
    setOriginalUrl(window.location.href)
  }, [])

  // Function to create SEO-friendly slug from resource name
  const createSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  // Function to truncate description for meta tag
  const truncateDescription = (text, maxLength = 160) => {
    if (!text) return "Explore this learning resource to enhance your knowledge."
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + "..."
  }

  // Update URL and browser history when resource modal opens/closes
  const updateUrl = useCallback(
    (resource) => {
      if (resource) {
        const slug = createSlug(resource.resource_name)
        const newUrl = `${originalUrl}/${slug}`
        const newTitle = `${resource.resource_name}`

        // Update the page title state
        setPageTitle(newTitle)

        // Also update document.title directly for immediate effect
        document.title = newTitle

        window.history.pushState(
          { resourceId: resource.resource_id, resourceName: resource.resource_name },
          newTitle,
          newUrl,
        )
      } else {
        const defaultTitle = "Learning Resources | Education Hub"
        setPageTitle(defaultTitle)
        document.title = defaultTitle

        window.history.pushState(null, defaultTitle, originalUrl)
      }
    },
    [originalUrl],
  )

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.resourceId) {
        // Find and open the resource based on the state
        const resource = resources.find((r) => r.resource_id === event.state.resourceId)
        if (resource) {
          setSelectedResource(resource)
          const newTitle = `${resource.resource_name} | Learning Resources`
          setPageTitle(newTitle)
          document.title = newTitle
        }
      } else {
        // Close modal when navigating back to main page
        setSelectedResource(null)
        const defaultTitle = "Learning Resources | Education Hub"
        setPageTitle(defaultTitle)
        document.title = defaultTitle
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [resources])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const fetchResources = async () => {
      try {
        const cachedData = sessionStorage.getItem("resourcesData")
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          const sortedData = [...parsedData].sort((a, b) => a.resource_name.localeCompare(b.resource_name))
          setResources(sortedData)
          setLoading(false)

          const response = await axiosInstance.get("/api/resources/resources", {
            signal: controller.signal,
          })
          const sortedResponseData = [...response.data].sort((a, b) => a.resource_name.localeCompare(b.resource_name))
          sessionStorage.setItem("resourcesData", JSON.stringify(sortedResponseData))
          setResources(sortedResponseData)
        } else {
          const response = await axiosInstance.get("/api/resources/resources", {
            signal: controller.signal,
          })
          const sortedResponseData = [...response.data].sort((a, b) => a.resource_name.localeCompare(b.resource_name))
          sessionStorage.setItem("resourcesData", JSON.stringify(sortedResponseData))
          setResources(sortedResponseData)
          setLoading(false)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchResources()
    return () => controller.abort()
  }, [])

  // Handle closing modal (both button click and outside click)
  const handleCloseModal = useCallback(() => {
    setSelectedResource(null)
    updateUrl(null)
  }, [updateUrl])

  // Handle clicking outside modal for resource details
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseModal() // Use handleCloseModal instead of just setSelectedResource(null)
      }
    }

    if (selectedResource) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [selectedResource, handleCloseModal])

  // Handle clicking outside filter modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterModalRef.current && !filterModalRef.current.contains(event.target)) {
        setShowFilterModal(false)
      }
    }

    if (showFilterModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showFilterModal])

  const handleIncrementViews = async (resourceName) => {
    try {
      await axiosInstance.patch(`/api/resources/incrementviews/${resourceName}`)
    } catch (error) {
      console.error("Error incrementing views:", error)
    }
  }

  const handleOpenModal = (resource) => {
    setSelectedResource(resource)
    updateUrl(resource)
    handleIncrementViews(resource.resource_name)
    setResources((prevResources) =>
      prevResources.map((res) => (res.resource_id === resource.resource_id ? { ...res, views: res.views + 1 } : res)),
    )
  }

  const filterResources = useCallback((data, query, type) => {
    let filtered = data

    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.resource_name.toLowerCase().includes(lowercaseQuery) ||
          resource.resource_description?.toLowerCase().includes(lowercaseQuery),
      )
    }

    if (type !== "all") {
      filtered = filtered.filter((resource) =>
        type === "video" ? resource.resource_type === "youtube" : resource.resource_type === type,
      )
    }

    return filtered
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedType])

  const filteredResources = filterResources(resources, debouncedSearchQuery, selectedType)
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentResources = filteredResources.slice(startIndex, endIndex)

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleFilterSelect = (type) => {
    setSelectedType(type)
    setShowFilterModal(false)
  }

  const clearAllFilters = useCallback(() => {
    setSelectedType("all")
    setSearchQuery("")
    setShowFilterModal(false)
  }, [])

  // Generate dynamic meta tags based on selected resource
  const generateMetaTags = () => {
    if (selectedResource) {
      const resourceType = selectedResource.resource_type === "youtube" ? "video" : selectedResource.resource_type
      const currentResourceUrl = `${originalUrl}/${createSlug(selectedResource.resource_name)}`

      return (
        <>
          <Title>{pageTitle}</Title>
          <Meta name="description" content={truncateDescription(selectedResource.resource_description)} />
          <Meta rel="canonical" href={currentResourceUrl} />
          <Meta property="og:title" content={pageTitle} />
          <Meta property="og:description" content={truncateDescription(selectedResource.resource_description)} />
          <Meta property="og:url" content={currentResourceUrl} />
          <Meta property="og:type" content="article" />
          <Meta name="twitter:card" content="summary_large_image" />
          <Meta name="twitter:title" content={pageTitle} />
          <Meta name="twitter:description" content={truncateDescription(selectedResource.resource_description)} />
          <Meta
            name="keywords"
            content={`learning, education, ${resourceType}, ${selectedResource.resource_name.toLowerCase()}`}
          />
        </>
      )
    }

    return (
      <>
        <Title>{pageTitle}</Title>
        <Meta
          name="description"
          content="Explore high-quality learning resources and structured guides designed to help you learn faster, grow confidently, and reach expert-level knowledge across a wide range of technologies and career paths."
        />
        <Meta rel="canonical" href={currentUrl} />
        <Meta property="og:title" content={pageTitle} />
        <Meta
          property="og:description"
          content="Explore high-quality learning resources and structured guides designed to help you learn faster, grow confidently, and reach expert-level knowledge across a wide range of technologies and career paths."
        />
        <Meta property="og:url" content={currentUrl} />
        <Meta property="og:type" content="website" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content={pageTitle} />
        <Meta
          name="twitter:description"
          content="Explore high-quality learning resources and structured guides designed to help you learn faster, grow confidently, and reach expert-level knowledge across a wide range of technologies and career paths."
        />
        <Meta
          name="keywords"
          content="learning resources, education, online courses, tutorials, articles, videos, career development"
        />
      </>
    )
  }

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
    )
  }

  return (
    <>
      {generateMetaTags()}
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8 space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4 md:space-y-6 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              Learning Resources
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Curated content to accelerate your journey to mastery
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-3xl mx-auto px-4 flex gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative">
                <Search
                  className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search resources by name or description..."
                  className="w-full pl-12 md:pl-16 pr-12 md:pr-16 h-12 md:h-16 rounded-2xl border-0 bg-white/80 backdrop-blur-sm text-gray-800 text-base md:text-lg focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search resources"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 md:px-6 h-12 md:h-16 bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-500 transition-all duration-300 text-gray-700 hover:text-indigo-600 shadow-sm hover:shadow-md"
            >
              <Filter size={20} />
              <span className="hidden sm:inline font-medium">Filters</span>
              {selectedType !== "all" && <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>}
            </button>
          </div>

          {/* Active Filter Display */}
          {selectedType !== "all" && (
            <div className="flex justify-center px-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <span className="text-sm font-medium">
                  Filter: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedType("all")}
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          {filteredResources.length > 0 && (
            <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
              <p className="text-sm md:text-base text-gray-600">
                Showing{" "}
                <span className="font-semibold text-indigo-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredResources.length)}
                </span>{" "}
                of <span className="font-semibold text-indigo-600">{filteredResources.length}</span> resources
              </p>
            </div>
          )}

          {/* Resources Grid */}
          <Suspense fallback={<SkeletonLoader />}>
            {currentResources.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center p-6 md:p-12 bg-white rounded-2xl shadow-xl mx-4">
                <div className="text-indigo-500 mb-4 md:mb-6">
                  <AlertCircle size={40} className="mx-auto" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">No resources found</h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                  We couldn't find any resources matching your criteria. Try adjusting your search or filter.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-base md:text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  View All Resources
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4">
                {currentResources.map((resource) => (
                  <div
                    key={resource.resource_id}
                    onClick={() => handleOpenModal(resource)}
                    className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <span className="px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full bg-indigo-500/10 text-indigo-600">
                        {resource.resource_type === "youtube" ? "video" : resource.resource_type}
                      </span>
                      <div className="flex items-center text-gray-500 text-xs md:text-sm">
                        <Eye size={16} className="mr-1" />
                        {resource.views.toLocaleString()}
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                      {resource.resource_name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8 leading-relaxed line-clamp-3">
                      {resource.resource_description || "Explore this learning resource to enhance your knowledge."}
                    </p>
                    <button
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm md:text-base"
                      aria-label={`View ${resource.resource_name} resource`}
                    >
                      <span>Explore Details</span>
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="transform group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 md:gap-3 mt-8 md:mt-12 px-4" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 md:p-3 rounded-xl border-2 ${
                  currentPage === 1
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-500 hover:text-indigo-600"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1
                const isCurrentPage = pageNumber === currentPage
                const isWithinRange =
                  pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1

                if (!isWithinRange) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span key={pageNumber} className="text-gray-400">
                        •••
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-8 h-8 md:w-12 md:h-12 rounded-xl text-sm md:text-lg font-medium border-2 ${
                      isCurrentPage
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent"
                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-500 hover:text-indigo-600"
                    }`}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={isCurrentPage ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 md:p-3 rounded-xl border-2 ${
                  currentPage === totalPages
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-500 hover:text-indigo-600"
                }`}
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div ref={filterModalRef} className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Filter Resources</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                aria-label="Close filter modal"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Resource Type</h4>
                <div className="space-y-2">
                  {resourceTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterSelect(type)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        selectedType === type
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        {selectedType === type && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-3 text-center text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Details Modal */}
      {selectedResource && (
        <div
          className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
              <div className="flex-1 pr-6">
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-indigo-500/10 text-indigo-600 mb-3 inline-block">
                  {selectedResource.resource_type === "youtube" ? "video" : selectedResource.resource_type}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{selectedResource.resource_name}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center text-gray-500 text-sm">
                <Eye size={18} className="mr-2" />
                {selectedResource.views.toLocaleString()} learners have viewed this resource
              </div>
              <div className="prose max-w-none">
                {selectedResource.resource_description && (
                  <p className="text-gray-600 text-lg leading-relaxed">{selectedResource.resource_description}</p>
                )}
                <div className="mt-6 text-gray-800" dangerouslySetInnerHTML={{ __html: selectedResource.content }} />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Resources
