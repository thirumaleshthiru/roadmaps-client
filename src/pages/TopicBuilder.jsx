 
import { useState, useEffect, useRef } from "react"
import { ChevronRight, ChevronLeft, RotateCcw, BarChart3, Calendar, Sun, Moon } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

const GOOGLE_API_KEY = "AIzaSyBlbuPBWLfowtV0nIpzJcanAXF3xe-dJHA"

function TopicBuilder() {
  const [currentStep, setCurrentStep] = useState(1)
  const [customTopic, setCustomTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [topicContent, setTopicContent] = useState([])
  const [topicInfo, setTopicInfo] = useState({ title: "", category: "" })
  const [currentSection, setCurrentSection] = useState(0)
  const [isLearning, setIsLearning] = useState(false)
  const [completedTopics, setCompletedTopics] = useState([])
  const [topicCompleted, setTopicCompleted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
  const contentRef = useRef(null)

  // Dark mode styles
  const darkStyles = {
    background: darkMode ? "#0f172a" : "#ffffff",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    borderColor: darkMode ? "#334155" : "#e2e8f0",
  }

  const cardStyles = {
    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    borderColor: darkMode ? "#475569" : "#e2e8f0",
  }

  const inputStyles = {
    backgroundColor: darkMode ? "#334155" : "#ffffff",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    borderColor: darkMode ? "#64748b" : "#d1d5db",
  }

  // Load data from localStorage
  useEffect(() => {
    const savedCompleted = localStorage.getItem("completedTopics")
    if (savedCompleted) {
      try {
        setCompletedTopics(JSON.parse(savedCompleted))
      } catch (error) {
        console.error("Error loading completed topics:", error)
        setCompletedTopics([])
      }
    }
  }, [])

  // Save completed topics to localStorage
  useEffect(() => {
    localStorage.setItem("completedTopics", JSON.stringify(completedTopics))
  }, [completedTopics])

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save dark mode preference and apply to document
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    document.body.style.backgroundColor = darkMode ? "#0f172a" : "#ffffff"
    document.body.style.color = darkMode ? "#f1f5f9" : "#0f172a"
  }, [darkMode])

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const updateAnalyticsOnSuccess = () => {
    const completedTopic = {
      id: `custom-${Date.now()}`,
      title: topicInfo.title || customTopic,
      category: "Educational Topic",
      completedAt: new Date().toISOString(),
    }

    setCompletedTopics((prev) => [...prev, completedTopic])
  }

  // Advanced JSON cleaning and parsing function
  // Removed unused cleanAndParseJSON function

  // Helper function to format content into paragraphs and handle special formatting
  // Removed unused formatContent function



  // Removed unused renderListItems function

  const generateTopicContent = async () => {
    setIsGenerating(true)
    const topic = customTopic

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      const prompt = `Create a comprehensive educational guide about "${topic}" with dynamic content types. Return the content in this exact JSON format:

{
  "title": "Complete Guide to ${topic}",
  "category": "Topic Category",
  "sections": [
    {
      "title": "Section Title",
      "content_blocks": [
        {
          "type": "text",
          "content": "Detailed explanatory text"
        },
        {
          "type": "list",
          "style": "bullet|numbered",
          "items": [
            "List item 1",
            "List item 2"
          ]
        },
        {
          "type": "code",
          "language": "language_name",
          "content": "code_example"
        }
      ]
    }
  ]
}

STRUCTURAL REQUIREMENTS:
1. Generate exactly 12-15 comprehensive sections
2. Each section must follow a clear learning progression
3. Each section should contain 5-8 content blocks
4. Use an appropriate mix of content types based on the topic
5. Include relevant examples and practical applications

SECTION PROGRESSION (adapt based on topic):
1. Introduction and Fundamentals
2. Core Concepts and Basic Principles
3. Essential Components/Elements
4. Theoretical Framework
5. Practical Applications
6. Advanced Concepts
7. Real-world Examples and Case Studies
8. Common Challenges and Solutions
9. Best Practices and Guidelines
10. Practical Exercises and Activities
11. Advanced Applications
12. Future Trends and Developments
(Additional sections based on topic complexity)

CONTENT GUIDELINES:
1. Start with basic concepts and progressively increase complexity
2. Include clear examples and explanations
3. Break down complex ideas into digestible parts
4. Use lists for:
   - Key points and summaries
   - Step-by-step instructions
   - Comparisons and contrasts
   - Features and characteristics
5. Each section should be self-contained but build upon previous sections
6. Include practical exercises or activities where relevant
7. Address common misconceptions and mistakes
8. Provide real-world applications and examples

FORMAT RULES:
- Each text block should be substantial and well-structured
- Lists should be comprehensive (4-8 items) 
- Examples should be clear, practical and relatable
- Code examples (when appropriate) should be well-commented
- Content should be factually accurate and current
- Use proper terminology with clear explanations
- Balance theoretical concepts with practical applications

IMPORTANT:
- Return ONLY valid JSON
- No markdown formatting in content
- No placeholders or TODO comments
- Ensure all content is complete and comprehensive
- Double-check JSON structure before returning`

      const result = await model.generateContent(prompt)
      const response = await result.response.text()

      // Enhanced JSON cleaning and parsing
      try {
        let cleaned = response;
        
        // Remove any markdown or text outside the JSON
        cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Find the actual JSON object
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("No valid JSON object found in response");
        }
        
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        
        // Fix common JSON formatting issues
        cleaned = cleaned
          // Remove comments
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
          // Fix unescaped newlines in strings
          .replace(/(?<!\\)\\n/g, '\\n')
          // Fix unescaped quotes in strings
          .replace(/(?<!\\)"/g, '\\"')
          // Remove trailing commas
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix double commas
          .replace(/,,+/g, ',');

        const parsed = JSON.parse(cleaned);
        
        // Validate structure
        if (!parsed.sections || !Array.isArray(parsed.sections)) {
          throw new Error("Invalid response format: missing sections array");
        }

        if (parsed.sections.length < 12) {
          throw new Error("Insufficient content: less than 12 sections");
        }

        // Validate each section
        parsed.sections.forEach((section, index) => {
          if (!section.title || !section.content_blocks || !Array.isArray(section.content_blocks)) {
            throw new Error(`Invalid section format at index ${index}`);
          }
          
          if (section.content_blocks.length < 3) {
            throw new Error(`Insufficient content blocks in section ${index}`);
          }

          // Validate and clean each content block
          section.content_blocks = section.content_blocks.map((block, blockIndex) => {
            if (!block.type || !block.content) {
              throw new Error(`Invalid content block at section ${index}, block ${blockIndex}`);
            }

            // Clean up content based on type
            switch (block.type) {
              case 'text':
                block.content = block.content.trim();
                break;
              case 'list':
                if (!block.style || !Array.isArray(block.items) || block.items.length === 0) {
                  throw new Error(`Invalid list block at section ${index}, block ${blockIndex}`);
                }
                block.items = block.items.map(item => item.trim());
                block.style = ['bullet', 'numbered'].includes(block.style) ? block.style : 'bullet';
                break;
              case 'code':
                block.language = block.language?.toLowerCase().trim() || 'plaintext';
                block.content = block.content.trim();
                break;
            }
            return block;
          });
        });

        setTopicContent(parsed.sections);
        setTopicInfo({
          title: parsed.title || `Complete Guide to ${topic}`,
          category: parsed.category || "Educational Topic",
        });
        setCurrentSection(0);
        setIsLearning(true);
        setTopicCompleted(false)
        updateAnalyticsOnSuccess()

      } catch (error) {
        throw new Error(`Failed to process AI response: ${error.message}. Trying to regenerate...`)
      }

    } catch (error) {
      alert(`Failed to generate topic content: ${error.message}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Update the content rendering to handle the new structured format
  const renderContentBlock = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <p className="mb-4 leading-relaxed" style={{ color: darkMode ? "#e2e8f0" : "#374151" }}>
            {block.content}
          </p>
        );
      case 'code':
        return (
          <pre className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto font-mono border border-gray-200 dark:border-gray-700">
            <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400">
              {block.language}
            </div>
            <code className={`language-${block.language || 'plaintext'}`}>
              {block.content}
            </code>
          </pre>
        );
      case 'list':
        return (
          <div className={`my-4 space-y-2 ${block.style === 'numbered' ? 'list-decimal' : 'list-disc'} list-inside`}>
            {block.items.map((item, index) => (
              <li key={index} className="ml-4 mb-2">
                {item}
              </li>
            ))}
          </div>
        );
      default:
        // Default case for unknown block types
        return null;
    }
  }

  // Update the content section rendering
  const renderContent = () => {
    const section = topicContent[currentSection];
    if (!section) return null;

    return (
      <div className="prose prose-lg max-w-none">
        {section.content_blocks.map((block, index) => (
          <div key={index}>
            {renderContentBlock(block)}
          </div>
        ))}
      </div>
    );
  }

  const nextSection = () => {
    if (currentSection < topicContent.length - 1) {
      setCurrentSection(currentSection + 1)
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      if (!topicCompleted) {
        completeTopic()
      }
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const completeTopic = () => {
    if (topicCompleted) return
    setTopicCompleted(true)

    setTimeout(() => {
      resetBuilder()
    }, 2000)
  }

  const resetBuilder = () => {
    setCurrentStep(1)
    setCustomTopic("")
    setTopicContent([])
    setTopicInfo({ title: "", category: "" })
    setCurrentSection(0)
    setIsLearning(false)
    setTopicCompleted(false)
  }

  const clearAllData = () => {
    localStorage.removeItem("completedTopics")
    setCompletedTopics([])
    resetBuilder()
  }

  // Analytics functions
  const getThisWeekTopics = () => {
    const now = new Date()
    const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000)
    startOfWeek.setHours(0, 0, 0, 0)

    return completedTopics.filter((topic) => {
      const topicDate = new Date(topic.completedAt)
      return topicDate >= startOfWeek
    })
  }

  const getCategoryStats = () => {
    const thisWeekTopics = getThisWeekTopics()
    const categoryCount = {}
    thisWeekTopics.forEach((topic) => {
      categoryCount[topic.category] = (categoryCount[topic.category] || 0) + 1
    })
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }

  const getLearningStreak = () => {
    if (completedTopics.length === 0) return 0

    const sortedTopics = [...completedTopics].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const topic of sortedTopics) {
      const topicDate = new Date(topic.completedAt)
      topicDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate - topicDate) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
      } else if (diffDays === streak + 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  if (isLearning && topicContent.length > 0) {
    const isLastSection = currentSection === topicContent.length - 1
    const isFirstSection = currentSection === 0
    const progress = ((currentSection + 1) / topicContent.length) * 100

    return (
      <div style={darkStyles} className="min-h-screen">
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${darkStyles.borderColor}` }}>
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-medium truncate" style={{ color: darkStyles.color }}>
                  {topicInfo.title}
                </h1>
                <p className="text-sm mt-1" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  {topicInfo.category} • Section {currentSection + 1} of {topicContent.length}
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-3 p-2 rounded-lg transition-colors"
                style={{
                  color: darkMode ? "#94a3b8" : "#6b7280",
                  backgroundColor: darkMode ? "#334155" : "#f1f5f9",
                }}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={resetBuilder}
                className="ml-3 p-2 transition-colors"
                style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 rounded-full h-2" style={{ backgroundColor: darkMode ? "#475569" : "#e2e8f0" }}>
              <div
                className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-20">
          <div ref={contentRef}>
            <h2 className="text-xl sm:text-2xl font-medium mb-4" style={{ color: darkStyles.color }}>
              {topicContent[currentSection]?.title}
            </h2>
            {renderContent()}

            {/* AI Disclaimer */}
            {currentSection === topicContent.length - 1 && (
              <div
                className="mt-6 p-3 rounded-lg border"
                style={{
                  backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                  borderColor: darkStyles.borderColor,
                }}
              >
                <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  <strong>Note:</strong> This content is generated by AI and may contain mistakes or inaccuracies.
                  Please verify important information from reliable sources.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div
          className="fixed bottom-0 left-0 right-0 shadow-lg"
          style={{
            backgroundColor: darkStyles.background,
            borderTop: `1px solid ${darkStyles.borderColor}`,
          }}
        >
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={prevSection}
                disabled={isFirstSection}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors min-w-[100px] justify-center"
                style={{
                  color: isFirstSection ? (darkMode ? "#64748b" : "#9ca3af") : darkStyles.color,
                  backgroundColor: isFirstSection
                    ? darkMode
                      ? "#334155"
                      : "#f3f4f6"
                    : darkMode
                      ? "#475569"
                      : "#f1f5f9",
                  cursor: isFirstSection ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-sm font-medium" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                {currentSection + 1} / {topicContent.length}
              </div>

              <button
                onClick={nextSection}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[100px] justify-center"
              >
                <span>{isLastSection ? "Complete" : "Next"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        {topicCompleted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-lg p-6 text-center max-w-sm mx-4" style={cardStyles}>
              <h3 className="text-xl font-medium mb-3" style={{ color: darkStyles.color }}>
                Topic Completed!
              </h3>
              <p style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>Returning to main menu...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { id: 1, name: "Topic", active: currentStep >= 1 },
    { id: 2, name: "Generate", active: currentStep >= 2 },
    { id: 3, name: "Analytics", active: true },
  ]

  return (
    <div style={darkStyles} className="min-h-screen">
      {/* Header */}
      <div>
        <div className="px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: darkStyles.color }}>
              AI Topic Learning Builder
            </h1>
            <p className="mt-1 text-sm sm:text-base" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
              Master any educational topic with comprehensive AI-generated content
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Tabs */}
      <div className="sticky top-0 z-10">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-0 min-w-max px-2 sm:px-0 sm:justify-center sm:w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentStep(tab.id)}
                className="flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                style={{
                  borderBottomColor: currentStep === tab.id ? "#3b82f6" : "transparent",
                  color:
                    currentStep === tab.id
                      ? "#3b82f6"
                      : tab.active
                        ? darkStyles.color
                        : darkMode
                          ? "#64748b"
                          : "#9ca3af",
                  backgroundColor: currentStep === tab.id ? (darkMode ? "#1e3a8a20" : "#dbeafe") : "transparent",
                  cursor: tab.active ? "pointer" : "not-allowed",
                }}
                disabled={!tab.active}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Step 1: Topic Input */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: darkStyles.color }}>
                What Do You Want to Learn?
              </h2>
              <p className="text-sm sm:text-base" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                Enter any educational topic you want to master
              </p>
            </div>

            {/* Topic Input */}
            <div className="rounded-xl p-6 border" style={cardStyles}>
              <label className="block text-lg font-bold mb-3" style={{ color: darkStyles.color }}>
                Enter Your Learning Topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., JavaScript, Mathematics, Chemistry, Archaeology, Machine Learning, Ancient Rome..."
                className="w-full p-4 text-base border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                style={inputStyles}
              />

              {/* Examples */}
              <div className="mt-4">
                <p className="text-sm mb-2" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  Popular topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "JavaScript",
                    "Mathematics",
                    "Chemistry",
                    "Archaeology",
                    "Physics",
                    "Python",
                    "History",
                    "Biology",
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setCustomTopic(example)}
                      className="px-3 py-1 text-sm rounded-full border transition-colors hover:bg-blue-50 dark:hover:bg-blue-900"
                      style={{
                        color: darkMode ? "#94a3b8" : "#6b7280",
                        borderColor: darkStyles.borderColor,
                      }}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {customTopic.trim().length > 2 && (
                <button
                  onClick={goToNextStep}
                  className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue with "{customTopic}"
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Generate */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: darkStyles.color }}>
                Ready to Learn!
              </h2>
              <p className="text-sm sm:text-base" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                Your comprehensive learning content will be generated covering all aspects of the topic
              </p>
            </div>

            <div className="rounded-xl p-4" style={cardStyles}>
              <h3 className="text-lg font-bold mb-4" style={{ color: darkStyles.color }}>
                Your Learning Topic:
              </h3>
              <div className="text-center p-6 rounded-lg" style={{ backgroundColor: darkMode ? "#334155" : "#f8fafc" }}>
                <div className="text-xl font-bold" style={{ color: darkStyles.color }}>
                  {customTopic}
                </div>
                <div className="text-sm mt-2" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  Complete mastery with comprehensive coverage
                </div>
              </div>
            </div>

            <button
              onClick={generateTopicContent}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Complete Knowledge...</span>
                </div>
              ) : (
                "Generate Complete Knowledge & Start Learning"
              )}
            </button>
          </div>
        )}

        {/* Step 3: Analytics */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: darkStyles.color }}>
                Your Weekly Learning Analytics
              </h2>
              <p className="text-sm sm:text-base" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                Track your learning progress this week
              </p>
            </div>

            {getThisWeekTopics().length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: darkMode ? "#334155" : "#f1f5f9" }}
                >
                  <span className="text-2xl font-bold" style={{ color: darkMode ? "#64748b" : "#d1d5db" }}>
                    📚
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: darkStyles.color }}>
                  No Learning Data This Week
                </h3>
                <p className="mb-4" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  Complete your first topic this week to see analytics here
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl p-4 shadow-sm border" style={cardStyles}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                        Topics Learned
                      </span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: darkStyles.color }}>
                      {getThisWeekTopics().length}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 shadow-sm border" style={cardStyles}>
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                        Categories
                      </span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: darkStyles.color }}>
                      {[...new Set(getThisWeekTopics().map((topic) => topic.category))].length}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 shadow-sm border" style={cardStyles}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
                        Streak
                      </span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: darkStyles.color }}>
                      {getLearningStreak()}
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                {getCategoryStats().length > 0 && (
                  <div className="rounded-xl p-4 shadow-sm border" style={cardStyles}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: darkStyles.color }}>
                      Category Breakdown This Week
                    </h3>
                    <div className="space-y-3">
                      {getCategoryStats().map((stat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span style={{ color: darkMode ? "#e2e8f0" : "#374151" }}>{stat.category}</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-20 rounded-full h-2"
                              style={{ backgroundColor: darkMode ? "#475569" : "#e5e7eb" }}
                            >
                              <div
                                className="bg-blue-600 rounded-full h-2"
                                style={{
                                  width: `${(stat.count / Math.max(...getCategoryStats().map((s) => s.count))) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-6" style={{ color: darkStyles.color }}>
                              {stat.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Data Button */}
                <div className="text-center">
                  <button
                    onClick={clearAllData}
                    className="text-sm text-red-600 hover:text-red-800 font-medium px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear All Data
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Fixed Dark Mode Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          style={{
            color: darkMode ? "#f1f5f9" : "#0f172a",
            backgroundColor: darkMode ? "#334155" : "#ffffff",
            border: `2px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      <style>
        {`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}

export default TopicBuilder;
