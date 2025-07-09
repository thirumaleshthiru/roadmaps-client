 
import { useState, useEffect } from "react"
import { Plus, CheckCircle2, Square, Trash2, X, ChevronDown, ChevronRight, BarChart3 } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyBmU-6zbaAKVpc8biv_NnA6opYJ5AER5HA")

const ResponsiveChecklist = () => {
  const [checklists, setChecklists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("") // 'topic', 'subtopic', 'view', or 'ai-generate'
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedTopics, setExpandedTopics] = useState({})
  const [viewModalData, setViewModalData] = useState({ title: "", description: "", type: "" })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    aiCount: 15,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedChecklists = localStorage.getItem("smart-checklists")
      const savedExpandedTopics = localStorage.getItem("smart-checklists-expanded")

      if (savedChecklists) {
        const parsedChecklists = JSON.parse(savedChecklists)
        setChecklists(parsedChecklists)

        if (savedExpandedTopics) {
          setExpandedTopics(JSON.parse(savedExpandedTopics))
        } else {
          // Initialize all topics as expanded if no saved state
          const initialExpanded = {}
          parsedChecklists.forEach((topic) => {
            initialExpanded[topic.id] = true
          })
          setExpandedTopics(initialExpanded)
        }
      } else {
        // Initialize with sample data only if no saved data exists
        const sampleData = [
          {
            id: 1,
            title: "Project Launch Preparation",
            description: "All tasks needed for successful project launch",
            createdAt: new Date().toISOString(),
            subtopics: [
              { id: 11, text: "Complete market research", completed: true, completedAt: "2025-07-01" },
              { id: 12, text: "Finalize product specifications", completed: true, completedAt: "2025-07-02" },
              { id: 13, text: "Set up development environment", completed: false, completedAt: null },
              { id: 14, text: "Create project timeline", completed: false, completedAt: null },
              { id: 15, text: "Prepare marketing materials", completed: false, completedAt: null },
            ],
          },
          {
            id: 2,
            title: "Home Organization",
            description: "Spring cleaning and organization tasks",
            createdAt: new Date().toISOString(),
            subtopics: [
              { id: 21, text: "Declutter bedroom", completed: true, completedAt: "2025-07-03" },
              { id: 22, text: "Organize kitchen cabinets", completed: false, completedAt: null },
              { id: 23, text: "Clean garage", completed: false, completedAt: null },
              { id: 24, text: "Sort through documents", completed: false, completedAt: null },
            ],
          },
        ]
        setChecklists(sampleData)
        localStorage.setItem("smart-checklists", JSON.stringify(sampleData))

        // Initialize all topics as expanded
        const initialExpanded = {}
        sampleData.forEach((topic) => {
          initialExpanded[topic.id] = true
        })
        setExpandedTopics(initialExpanded)
        localStorage.setItem("smart-checklists-expanded", JSON.stringify(initialExpanded))
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Something is not right use again")
    }
  }, [])

  // Save to localStorage whenever checklists change
  useEffect(() => {
    if (checklists.length > 0) {
      localStorage.setItem("smart-checklists", JSON.stringify(checklists))
    }
  }, [checklists])

  // Save to localStorage whenever expandedTopics change
  useEffect(() => {
    localStorage.setItem("smart-checklists-expanded", JSON.stringify(expandedTopics))
  }, [expandedTopics])

  const generateAIChecklist = async (topic, count = 15) => {
    setIsGenerating(true)
    setError(null)

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Create a comprehensive checklist for the topic: "${topic}"


Format your response as a JSON object using this EXACT structure:
{
  "title": "${topic} Checklist",
  "description": "Comprehensive checklist for ${topic}",
  "items": [
    "First task",
    "Second task",
    "Third task"
  ]
}

IMPORTANT:
If the topic is unethical, adult, illegal, violent, or harmful in any way — such as topics involving sex, drugs, scams, violence, or anything inappropriate — DO NOT create a checklist for it. Instead, create a checklist for "Bhagavad Gita" with complete neutrality. Do not mention or refer to the original topic.


Requirements:
1. Generate exactly ${count} checklist items
2. Items must be specific, actionable, and meaningful
3. Order the items in a logical learning or execution sequence
4. Make sure all tasks are clear, ethical, and practical
 
Return ONLY the JSON object with no explanation, disclaimer, or extra formatting.
`;

      const result = await model.generateContent(prompt)
      const responseText = await result.response.text()

      try {
        // Extract JSON from the response
        const jsonStr = responseText.replace(/```json|```/g, "").trim()
        const aiData = JSON.parse(jsonStr)

        // Create new checklist with AI-generated items
        const newChecklist = {
          id: Date.now(),
          title: aiData.title,
          description: aiData.description,
          createdAt: new Date().toISOString(),
          isAIGenerated: true,
          subtopics: aiData.items.map((item, index) => ({
            id: Date.now() + index + 1,
            text: item,
            completed: false,
            completedAt: null,
          })),
        }

        setChecklists((prev) => [newChecklist, ...prev])
        setExpandedTopics((prev) => ({ ...prev, [newChecklist.id]: true }))
      } catch (jsonError) {
        console.error("Error parsing AI response:", jsonError)

        // Try to extract JSON with a more lenient approach
        try {
          const jsonStartIndex = responseText.indexOf("{")
          const jsonEndIndex = responseText.lastIndexOf("}")

          if (jsonStartIndex >= 0 && jsonEndIndex >= 0) {
            const extractedJson = responseText.substring(jsonStartIndex, jsonEndIndex + 1)
            const aiData = JSON.parse(extractedJson)

            const newChecklist = {
              id: Date.now(),
              title: aiData.title,
              description: aiData.description,
              createdAt: new Date().toISOString(),
              isAIGenerated: true,
              subtopics: aiData.items.map((item, index) => ({
                id: Date.now() + index + 1,
                text: item,
                completed: false,
                completedAt: null,
              })),
            }

            setChecklists((prev) => [newChecklist, ...prev])
            setExpandedTopics((prev) => ({ ...prev, [newChecklist.id]: true }))
          } else {
            setError("Something is not right use again")
          }
        } catch (fallbackError) {
          console.error("Fallback extraction failed:", fallbackError)
          setError("Something is not right use again")
        }
      }
    } catch (err) {
      console.error("Error generating AI checklist:", err)
      setError("Something is not right use again")
    } finally {
      setIsGenerating(false)
    }
  }

  const openModal = (type, topicId = null) => {
    setModalType(type)
    setSelectedTopicId(topicId)
    setShowModal(true)
    setFormData({
      title: "",
      description: "",
      aiCount: 15,
    })
    setError(null)
  }

  const openViewModal = (title, description, type) => {
    setViewModalData({ title, description, type })
    setModalType("view")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType("")
    setSelectedTopicId(null)
    setViewModalData({ title: "", description: "", type: "" })
    setFormData({
      title: "",
      description: "",
      aiCount: 15,
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault?.()

    try {
      if (modalType === "ai-generate") {
        if (!formData.title.trim()) return
        // Handle empty or invalid count properly
        let count = 15 // default
        if (formData.aiCount !== "" && formData.aiCount !== null && formData.aiCount !== undefined) {
          const parsedCount = Number.parseInt(formData.aiCount)
          if (!isNaN(parsedCount)) {
            count = Math.max(5, Math.min(30, parsedCount)) // Clamp between 5-30
          }
        }
        await generateAIChecklist(formData.title.trim(), count)
        closeModal()
        return
      }

      if (!formData.title.trim()) return

      if (modalType === "topic") {
        const newTopic = {
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          createdAt: new Date().toISOString(),
          subtopics: [],
        }
        setChecklists((prev) => [newTopic, ...prev]) // Changed to add to front
        setExpandedTopics((prev) => ({ ...prev, [newTopic.id]: true }))
      } else if (modalType === "subtopic") {
        const newSubtopic = {
          id: Date.now(),
          text: formData.title,
          completed: false,
          completedAt: null,
        }
        setChecklists((prev) =>
          prev.map((topic) =>
            topic.id === selectedTopicId ? { ...topic, subtopics: [...topic.subtopics, newSubtopic] } : topic,
          ),
        )
      }
      closeModal()
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError("Something is not right use again")
    }
  }

  const toggleSubtopic = (topicId, subtopicId) => {
    try {
      setChecklists((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                subtopics: topic.subtopics.map((subtopic) =>
                  subtopic.id === subtopicId
                    ? {
                        ...subtopic,
                        completed: !subtopic.completed,
                        completedAt: !subtopic.completed ? new Date().toISOString() : null,
                      }
                    : subtopic,
                ),
              }
            : topic,
        ),
      )
    } catch (err) {
      console.error("Error toggling subtopic:", err)
      setError("Something is not right use again")
    }
  }

  const deleteSubtopic = (topicId, subtopicId) => {
    try {
      setChecklists((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                subtopics: topic.subtopics.filter((subtopic) => subtopic.id !== subtopicId),
              }
            : topic,
        ),
      )
    } catch (err) {
      console.error("Error deleting subtopic:", err)
      setError("Something is not right use again")
    }
  }

  const deleteTopic = (topicId) => {
    try {
      setChecklists((prev) => prev.filter((topic) => topic.id !== topicId))
      setExpandedTopics((prev) => {
        const newExpanded = { ...prev }
        delete newExpanded[topicId]
        return newExpanded
      })
    } catch (err) {
      console.error("Error deleting topic:", err)
      setError("Something is not right use again")
    }
  }

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }))
  }

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const getStats = () => {
    const totalTopics = checklists.length
    const totalSubtopics = checklists.reduce((sum, topic) => sum + topic.subtopics.length, 0)
    const completedSubtopics = checklists.reduce(
      (sum, topic) => sum + topic.subtopics.filter((sub) => sub.completed).length,
      0,
    )
    const completedTopics = checklists.filter(
      (topic) => topic.subtopics.length > 0 && topic.subtopics.every((sub) => sub.completed),
    ).length

    return {
      totalTopics,
      totalSubtopics,
      completedSubtopics,
      completedTopics,
      completionRate: totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0,
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Smart Checklist</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Analytics Panel */}
        <div
          className={`fixed top-0 left-0 z-40 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:top-auto lg:h-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Analytics Header - Always visible at top */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
              </div>

              {/* Enhanced Mobile Close Button - Always visible and prominent */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 transition-colors shadow-md border border-red-200"
                aria-label="Close Analytics Panel"
              >
                <X size={22} className="text-red-600" />
              </button>
            </div>
          </div>

          {/* Analytics Content - Scrollable with proper height calculation */}
          <div className="overflow-y-auto" style={{ height: "calc(100vh - 80px)" }}>
            <div className="p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalTopics}</div>
                  <div className="text-sm text-blue-600/80 font-medium">Topics</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalSubtopics}</div>
                  <div className="text-sm text-purple-600/80 font-medium">Tasks</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">{stats.completedSubtopics}</div>
                  <div className="text-sm text-green-600/80 font-medium">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{stats.completionRate}%</div>
                  <div className="text-sm text-orange-600/80 font-medium">Progress</div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {stats.completedSubtopics} of {stats.totalSubtopics} tasks completed
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-2">
                  {checklists.slice(0, 3).map((topic) => (
                    <div key={topic.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 truncate">{truncateText(topic.title, 25)}</span>
                    </div>
                  ))}
                  {checklists.length === 0 && <div className="text-gray-500 text-center py-2">No activity yet</div>}
                </div>
              </div>

              {/* Mobile-only: Additional close button at bottom */}
              <div className="lg:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium text-gray-700"
                >
                  <X size={18} />
                  Close Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Smart Checklist</h1>
                  <p className="text-gray-600">Organize your projects with topics and subtasks</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal("ai-generate")}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={20} />
                    <span>Use AI</span>
                  </button>
                  <button
                    onClick={() => openModal("topic")}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={20} />
                    <span>Add Topic</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Checklists */}
            <div className="space-y-4">
              {checklists.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No checklists yet</h3>
                  <p className="text-gray-600 mb-6">Create your first checklist to get organized!</p>
                  <button
                    onClick={() => openModal("topic")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  >
                    Create First Topic
                  </button>
                </div>
              ) : (
                checklists.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Topic Header */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {expandedTopics[topic.id] ? (
                              <ChevronDown size={20} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={20} className="text-gray-600" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => openViewModal(topic.title, topic.description, "topic")}
                              >
                                <span className="lg:hidden">{truncateText(topic.title, 20)}</span>
                                <span className="hidden lg:block">{truncateText(topic.title, 40)}</span>
                              </h3>
                              {topic.isAIGenerated && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  AI
                                </span>
                              )}
                            </div>
                            <p
                              className="text-gray-600 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => openViewModal(topic.title, topic.description, "topic")}
                            >
                              <span className="lg:hidden">{truncateText(topic.description, 25)}</span>
                              <span className="hidden lg:block">{truncateText(topic.description, 50)}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <span>
                                {topic.subtopics.filter((sub) => sub.completed).length} / {topic.subtopics.length}{" "}
                                completed
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal("subtopic", topic.id)}
                            className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                          >
                            <Plus size={14} />
                            <span className="hidden sm:block">Add Task</span>
                          </button>
                          <button
                            onClick={() => deleteTopic(topic.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtopics */}
                    {expandedTopics[topic.id] && (
                      <div className="px-6 pb-6">
                        {topic.subtopics.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">
                            <div className="text-3xl mb-2">✨</div>
                            <p className="text-sm">No tasks yet. Add your first task to get started!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {topic.subtopics.map((subtopic) => (
                              <div
                                key={subtopic.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                                  subtopic.completed
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <button
                                  onClick={() => toggleSubtopic(topic.id, subtopic.id)}
                                  className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                                    subtopic.completed
                                      ? "bg-green-500 border-green-500 text-white"
                                      : "border-gray-300 hover:border-green-500"
                                  }`}
                                >
                                  {subtopic.completed ? <CheckCircle2 size={14} /> : <Square size={14} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm cursor-pointer hover:text-blue-600 transition-colors ${subtopic.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                                    onClick={() => openViewModal(subtopic.text, "", "task")}
                                  >
                                    <span className="lg:hidden">{truncateText(subtopic.text, 20)}</span>
                                    <span className="hidden lg:block">{truncateText(subtopic.text, 40)}</span>
                                  </p>
                                  {subtopic.completed && subtopic.completedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Completed on {new Date(subtopic.completedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => deleteSubtopic(topic.id, subtopic.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalType === "topic"
                    ? "Add New Topic"
                    : modalType === "subtopic"
                      ? "Add New Task"
                      : modalType === "ai-generate"
                        ? "Use AI for Your Topic"
                        : modalType === "view"
                          ? viewModalData.type === "topic"
                            ? "Topic Details"
                            : "Task Details"
                          : ""}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {modalType === "view" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {viewModalData.type === "topic" ? "Topic Title" : "Task Name"}
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border max-h-60 overflow-y-auto">
                      <p className="text-gray-900 whitespace-pre-wrap break-words">{viewModalData.title}</p>
                    </div>
                  </div>

                  {viewModalData.type === "topic" && viewModalData.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <div className="p-4 bg-gray-50 rounded-xl border max-h-60 overflow-y-auto">
                        <p className="text-gray-900 whitespace-pre-wrap break-words">{viewModalData.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={closeModal}
                      className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {modalType === "topic"
                        ? "Topic Title"
                        : modalType === "ai-generate"
                          ? "Topic for AI"
                          : "Task Name"}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={
                        modalType === "topic"
                          ? "Enter topic title..."
                          : modalType === "ai-generate"
                            ? "Enter topic for AI..."
                            : "Enter task name..."
                      }
                      maxLength={100}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
                    />
                    <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</div>
                  </div>

                  {modalType === "topic" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Enter description..."
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</div>
                    </div>
                  )}

                  {modalType === "ai-generate" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of tasks (5-30)</label>
                      <input
                        type="text"
                        value={formData.aiCount}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow empty string or any digits while typing
                          if (value === "" || /^\d*$/.test(value)) {
                            setFormData((prev) => ({ ...prev, aiCount: value }))
                          }
                        }}
                        onBlur={() => {
                          // Only validate if there's actually a value
                          if (formData.aiCount === "" || formData.aiCount === null || formData.aiCount === undefined) {
                            setFormData((prev) => ({ ...prev, aiCount: 15 }))
                          } else {
                            let numValue = Number.parseInt(formData.aiCount)
                            if (isNaN(numValue) || numValue < 5) numValue = 5
                            if (numValue > 30) numValue = 30
                            setFormData((prev) => ({ ...prev, aiCount: numValue }))
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="15"
                      />
                      <div className="text-xs text-gray-500 mt-1">Min: 5, Max: 30</div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.title.trim() || isGenerating}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating
                        ? "Generating..."
                        : modalType === "topic"
                          ? "Create Topic"
                          : modalType === "ai-generate"
                            ? "Generate"
                            : "Add Task"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default ResponsiveChecklist
