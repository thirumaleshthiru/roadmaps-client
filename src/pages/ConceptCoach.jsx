"use client"

import { useEffect, useState, useRef } from "react"
import { Title, Meta } from "react-head"
import { useCurrentLocation } from "../utils/useFulFunctions.js"
import { Send, Bot, User, Lightbulb, Eye, Wrench } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyBmU-6zbaAKVpc8biv_NnA6opYJ5AER5HA")

function ConceptCoach() {
  const [currentTopic, setCurrentTopic] = useState("")
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [learningMode, setLearningMode] = useState("adaptive") // adaptive, analogy, visual, project
  const [conceptProgress, setConceptProgress] = useState(0)
  const [currentUrl] = useCurrentLocation()
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const popularTopics = [
    "Neural Networks",
    "Machine Learning Basics",
    "React Hooks",
    "Database Design",
    "Blockchain Technology",
    "Python Functions",
    "Data Structures",
    "API Development",
    "Cloud Computing",
    "Cybersecurity Fundamentals",
    "Bhagavad Gita Philosophy",
    "Quantum Computing",
  ]

  const learningModes = [
    {
      id: "adaptive",
      name: "Adaptive",
      description: "AI adjusts to your level",
      icon: <Bot size={16} />,
    },
    {
      id: "analogy",
      name: "Analogy Mode",
      description: "Learn through real-world comparisons",
      icon: <Lightbulb size={16} />,
    },
    {
      id: "visual",
      name: "Visual Mode",
      description: "Focus on examples and diagrams",
      icon: <Eye size={16} />,
    },
    {
      id: "project",
      name: "Project Mode",
      description: "Learn by building something",
      icon: <Wrench size={16} />,
    },
  ]

  const startLearning = async (topic) => {
    if (!topic.trim()) return

    setCurrentTopic(topic)
    setHasStarted(true)
    setMessages([])
    setConceptProgress(0)

    const welcomeMessage = {
      id: Date.now(),
      type: "ai",
      content: `Hi! I'm your AI concept coach. I'm excited to teach you about **${topic}** in a conversational way. 

I'll break this down step by step, ask questions to make sure you understand, and adapt to your learning style. 

Before we begin, let me know: What's your current familiarity with ${topic}? Are you:
- Complete beginner 🌱
- Have some basic knowledge 🌿  
- Fairly experienced 🌳
- Just want a refresher 🔄

Just tell me in your own words!`,
      timestamp: new Date(),
    }

    setMessages([welcomeMessage])
  }

  const getModePrompt = (mode) => {
    switch (mode) {
      case "analogy":
        return "Focus heavily on real-world analogies and comparisons. Use everyday examples to explain complex concepts."
      case "visual":
        return "Emphasize visual descriptions, examples, and suggest mental models. Describe what things would look like or how to visualize concepts."
      case "project":
        return "Focus on practical applications and how to build or implement things. Include actionable steps and project ideas."
      default:
        return "Adapt your teaching style based on the user's responses and comprehension level."
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      // Build conversation context
      const conversationHistory = messages
        .map((msg) => `${msg.type === "user" ? "Student" : "Coach"}: ${msg.content}`)
        .join("\n\n")

      const modeInstruction = getModePrompt(learningMode)

      const prompt = `You are an expert AI concept coach teaching "${currentTopic}" to a student. Your role is to:

**Teaching Style:**
- Teach through conversation, not lectures
- Break concepts into digestible steps
- Ask questions to check understanding before moving forward
- Adapt difficulty based on student responses
- Be encouraging and patient
- Use the student's language level and interests

**Current Learning Mode:** ${learningMode}
**Mode Instructions:** ${modeInstruction}

**Conversation History:**
${conversationHistory}

**Latest Student Response:** ${inputMessage}

**Instructions:**
1. Respond conversationally to their latest message
2. If they seem to understand, introduce the next sub-concept
3. If they're confused, provide simpler explanations or analogies
4. Ask follow-up questions to ensure comprehension
5. Keep responses focused and not too long (2-3 paragraphs max)
6. Use markdown formatting for emphasis when helpful
7. Occasionally ask if they want to switch learning modes or need clarification
8. Track progress by mentioning what you've covered and what's coming next

Respond as the AI coach would in this conversation:`

      const result = await model.generateContent(prompt)
      const aiResponse = await result.response.text()

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update progress (simple estimation based on message count)
      setConceptProgress(Math.min(90, messages.length * 5))
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "I apologize, but I'm having trouble responding right now. Could you please try again?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetSession = () => {
    setHasStarted(false)
    setCurrentTopic("")
    setMessages([])
    setConceptProgress(0)
    setLearningMode("adaptive")
  }

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .split("\n")
      .map((line, index) => (
        <p key={index} className={line.trim() ? "mb-2" : "mb-1"}>
          <span dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
        </p>
      ))
  }

  return (
    <>
      <Title>Talk to an AI That Teaches You One Concept at a Time</Title>
      <Meta
        name="description"
        content="Learn any concept through interactive conversation with an AI coach that adapts to your learning style and pace."
      />
      <Meta rel="canonical" href={currentUrl} />

      <div className="container mx-auto px-4 py-8 max-w-6xl min-h-auto">
        {!hasStarted ? (
          // Topic Selection Screen
          <div className="text-center">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">🤖 Your Personal AI Concept Coach</h1>
              <p className="text-xl text-gray-600 mb-6">
                Learn any concept through interactive conversation. I'll adapt to your pace and style!
              </p>
            </div>

            {/* Topic Input */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">What would you like to learn today?</h2>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="text"
                  value={currentTopic}
                  onChange={(e) => setCurrentTopic(e.target.value)}
                  placeholder="Enter any concept (e.g., Neural Networks, React Hooks, Quantum Physics...)"
                  className="flex-grow p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  onKeyPress={(e) => e.key === "Enter" && startLearning(currentTopic)}
                />
                <button
                  onClick={() => startLearning(currentTopic)}
                  disabled={!currentTopic.trim()}
                  className={`px-8 py-4 rounded-lg font-medium ${
                    currentTopic.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Start Learning
                </button>
              </div>

              {/* Popular Topics */}
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Or choose a popular topic:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {popularTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => startLearning(topic)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{topic}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Modes */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Choose Your Learning Style</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {learningModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLearningMode(mode.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      learningMode === mode.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {mode.icon}
                      <span className="ml-2 font-semibold text-gray-800">{mode.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Learning: {currentTopic}</h2>
                  <p className="text-indigo-100">Mode: {learningModes.find((m) => m.id === learningMode)?.name}</p>
                </div>
                <button
                  onClick={resetSession}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                >
                  New Topic
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{conceptProgress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${conceptProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 space-y-4" style={{ maxHeight: "500px" }}>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === "user" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-800 border"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "ai" && <Bot size={16} className="mt-1 text-indigo-500" />}
                      {message.type === "user" && <User size={16} className="mt-1" />}
                      <div className="flex-1">
                        <div className="text-sm">{formatMessage(message.content)}</div>
                        <div
                          className={`text-xs mt-2 ${message.type === "user" ? "text-indigo-100" : "text-gray-500"}`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border px-4 py-3 rounded-2xl max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Bot size={16} className="text-indigo-500" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex space-x-4">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response or question..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  rows="2"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    inputMessage.trim() && !isLoading
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-sm text-gray-600">Switch mode:</span>
                {learningModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLearningMode(mode.id)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      learningMode === mode.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!hasStarted && (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Adaptive Learning</h3>
              <p className="text-gray-600">
                The AI adjusts its teaching style based on your responses and comprehension level.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Teaching</h3>
              <p className="text-gray-600">
                Learn through conversation, not lectures. Ask questions and get personalized explanations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Multiple Learning Modes</h3>
              <p className="text-gray-600">Choose from analogy, visual, project-based, or adaptive learning styles.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ConceptCoach
