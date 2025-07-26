"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { Title, Meta } from "react-head" // Re-added react-head
import { useCurrentLocation } from "../utils/useFulFunctions.js" // Re-added useCurrentLocation
import { ChevronRight, Award, Book, Send, Loader2, X, Check } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai" // Corrected import path for GoogleGenerativeAI
import { Link } from "react-router-dom" // Re-added Link from react-router-dom

function Concept({ concept, index, onClick, marked, onMarkToggle, totalConcepts }) {
  const isEven = index % 2 === 0
  const isLast = index === totalConcepts - 1

  return (
    <div
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center mb-16 relative`}
      id={`concept-${concept.concept_id}`}
    >
      {/* Main Content Card */}
      <div className={`w-full md:w-5/12 px-1 mb-6 md:mb-0 z-10`}>
        <div
          className={`
            p-3 rounded-xl bg-white cursor-pointer 
            transform transition-all duration-300 
            hover:scale-102 hover:shadow-2xl 
            ${marked ? "border-l-4 border-green-500" : "border-l-4 border-transparent"}
            relative overflow-hidden 
            shadow-[0_3px_10px_rgb(0,0,0,0.2)]
          `}
          onClick={onClick}
        >
          {/* Concept Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-3 pr-8">{concept.concept_name}</h3>

          {/* Progress Indicator */}
          {marked && (
            <div className="absolute top-0 right-0 bg-green-500 text-white p-2 rounded-bl-lg">
              <Check size={16} />
            </div>
          )}

          {/* Concept Description */}
          <p className="text-gray-600 text-sm md:text-base">
            {concept.concept_description?.substring(0, 120)}
            {concept.concept_description?.length > 120 ? "..." : ""}
          </p>

          {/* Card Footer */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-indigo-600 font-medium flex items-center">Learn more</span>
            <span className="text-gray-500">{marked ? "Completed" : "Not started"}</span>
          </div>
        </div>
      </div>

      {/* Center Timeline Marker */}
      <div className="w-full md:w-2/12 flex justify-center relative">
        <button
          className={`
            w-12 h-12 rounded-full 
            ${marked ? "bg-green-500" : "bg-white border-2 border-indigo-500"}
            shadow-lg z-20 flex items-center justify-center 
            cursor-pointer transition-all duration-300 
            hover:scale-110 focus:outline-none
          `}
          onClick={onMarkToggle}
          aria-label={marked ? "Mark as incomplete" : "Mark as complete"}
        >
          {marked ? (
            <Check className="text-white" size={20} />
          ) : (
            <span className="font-bold text-indigo-500">{index + 1}</span>
          )}
        </button>

        {/* Timeline Connector */}
        {!isLast && (
          <div
            className={`absolute ${isEven ? "top-12" : "bottom-12"} left-1/2 transform -translate-x-1/2 w-1 h-16 bg-indigo-200`}
            style={{ zIndex: -1 }}
          ></div>
        )}
      </div>

      {/* Empty Space for Layout */}
      <div className="w-full md:w-5/12"></div>
    </div>
  )
}

function ConceptPopup({ concept, onClose, marked, onMarkToggle }) {
  const modalRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [quote, setQuote] = useState("")

  // Collection of motivational quotes - wrapped in useMemo to prevent recreation on each render
  const motivationalQuotes = useMemo(
    () => [
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there.",
      "It always seems impossible until it's done.",
      "Your attitude determines your direction.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Don't watch the clock; do what it does. Keep going.",
      "The only limit to our realization of tomorrow is our doubts of today.",
      "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
      "The harder you work for something, the greater you'll feel when you achieve it.",
      "Dreams don't work unless you do.",
      "The only person you are destined to become is the person you decide to be.",
      "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "You don't have to be great to start, but you have to start to be great.",
      "Every moment is a fresh beginning.",
      "You are never too old to set another goal or to dream a new dream.",
      "The only way to achieve the impossible is to believe it is possible.",
      "Don't let yesterday take up too much of today.",
      "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      "Progress isn't always loud—sometimes it's the quiet persistence that wins.",
      "Every big journey begins with a single brave decision.",
      "You grow stronger every time you refuse to quit.",
      "The best view comes after the toughest climb.",
      "You weren't born to just get by—you were made to rise.",
      "Even slow steps move you forward if you keep taking them.",
      "Great things never come from comfort zones.",
      "Your future is shaped by what you choose to do today.",
      "Focus on the step in front of you, not the whole staircase.",
      "You don't need permission to chase what sets your soul on fire.",
      "Failure is not the opposite of success—it's a part of it.",
      "Consistency beats intensity when the race is long.",
      "You can't rewrite the past, but you can shape the ending.",
      "Effort doesn't always show right away—trust the process.",
      "Be stronger than your strongest excuse.",
      "You're always one decision away from a completely different life.",
      "A dream written down becomes a plan. A plan followed becomes reality.",
      "Fear is a reaction—courage is a choice.",
      "The person you want to be is already inside you—keep going.",
      "You don't have to finish fast. You just have to finish.",
    ],
    [],
  )

  // Function to format text with markdown-like syntax
  const formatText = useCallback((text) => {
    if (!text) return ""

    // Convert markdown to HTML
    const formattedText = text
      // Handle code blocks first (to avoid conflicts with bold formatting)
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
      )
      // Handle bold text - multiple asterisks or single asterisks
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      // Handle line breaks
      .replace(/\n/g, "<br>")

    return formattedText
  }, [])

  // Function to format plain text content with basic styling and markdown
  const formatContent = (content) => {
    if (!content) return ""

    // Split content into sections
    const sections = content.split("\n\n").filter((s) => s.trim())

    return sections.map((section, index) => {
      const trimmed = section.trim()

      // Check if it's "Brief Summary:" section
      if (trimmed.startsWith("Brief Summary:")) {
        const summaryText = trimmed.replace("Brief Summary:", "").trim()
        return (
          <div key={index} className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Brief Summary</h3>
            <div
              className="text-gray-700 leading-relaxed bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100/50"
              dangerouslySetInnerHTML={{ __html: formatText(summaryText) }}
            />
          </div>
        )
      }

      // Check if it's "Key Concepts:" section
      if (trimmed.startsWith("Key Concepts:")) {
        const conceptsText = trimmed.replace("Key Concepts:", "").trim()
        const concepts = conceptsText
          .split("\n")
          .filter((c) => c.trim())
          .map((c) => c.replace(/^[-•*]\s*/, ""))

        return (
          <div key={index} className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Key Concepts</h3>
            <ul className="space-y-3">
              {concepts.map((concept, conceptIndex) => (
                <li key={conceptIndex} className="flex items-start group">
                  <span className="text-indigo-500 mr-3 text-lg leading-none mt-0.5">•</span>
                  <span
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatText(concept) }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      }

      // Check if it's "Examples:" section
      if (trimmed.startsWith("Examples:")) {
        const examplesText = trimmed.replace("Examples:", "").trim()
        const examples = examplesText
          .split("\n")
          .filter((e) => e.trim())
          .map((e) => e.replace(/^[-•*]\s*/, ""))

        return (
          <div key={index} className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Examples</h3>
            <div className="bg-green-50/70 p-5 rounded-2xl border border-green-100/50">
              <ul className="space-y-3">
                {examples.map((example, exampleIndex) => (
                  <li key={exampleIndex} className="flex items-start">
                    <span className="text-green-600 mr-3 text-sm leading-none mt-1">→</span>
                    <span
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatText(example) }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }

      // Regular paragraph with markdown formatting
      return (
        <div
          key={index}
          className="mb-6 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatText(trimmed) }}
        />
      )
    })
  }

  // Handle animation
  useEffect(() => {
    if (concept) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [concept])

  // Use useCallback to memoize the handleClose function
  const handleClose = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose])

  // Handle completing the concept
  const handleComplete = useCallback(() => {
    if (onMarkToggle && concept) {
      onMarkToggle(concept.concept_id)
      setIsAnimating(true)
      setTimeout(() => {
        onClose()
      }, 200)
    }
  }, [concept, onClose, onMarkToggle])

  // Select a random quote when component mounts or concept changes
  useEffect(() => {
    if (concept) {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      setQuote(motivationalQuotes[randomIndex])
    }
  }, [concept, motivationalQuotes])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose()
      }
    }

    // Close with escape key
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [handleClose])

  if (!concept) return null

  return (
    <div
      className={`
        fixed inset-0 bg-black/40 backdrop-blur-sm
        flex items-center justify-center z-50 
        px-4 py-6 sm:px-6 lg:px-8
        transition-all duration-300 ease-out
        ${isAnimating ? "opacity-0" : "opacity-100"}
      `}
    >
      <div
        ref={modalRef}
        className={`
          bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl
          w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl 
          max-h-[85vh] sm:max-h-[90vh]
          flex flex-col 
          transition-all duration-300 ease-out
          border border-gray-100/50
          ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-800 leading-tight">
              {concept.concept_name}
            </h2>
          </div>
          <button
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100/60 transition-all duration-200 text-gray-600 hover:text-gray-700"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-8 h-px bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent"></div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
          <div className="prose prose-indigo max-w-none">{formatContent(concept.concept_details)}</div>
        </div>

        {/* Quote Section */}
        {quote && (
          <>
            <div className="mx-6 sm:mx-8 h-px bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent"></div>
            <div className="px-6 sm:px-8 py-4">
              <div className="text-xs sm:text-sm text-gray-600 italic font-medium leading-relaxed text-center pl-4 border-l-4 border-indigo-300">
                "{quote}"
              </div>
            </div>
          </>
        )}

        {/* Footer with Actions */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {concept.resources && (
              <a
                href={concept.resources}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3
                          bg-indigo-50 hover:bg-indigo-100
                          text-indigo-600 text-sm font-medium
                         rounded-2xl transition-all duration-200
                         border border-indigo-200/50 hover:border-indigo-300/50"
              >
                Resources
              </a>
            )}
            <button
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3
                        text-sm font-medium rounded-2xl transition-all duration-200
                        ${
                          marked
                            ? "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200/50 hover:border-green-300/50"
                            : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                        }`}
              onClick={handleComplete}
            >
              <Check size={16} className="mr-2" />
              {marked ? "Completed" : "Mark Complete"}
            </button>
            <button
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3
                       bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium
                       rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={handleClose}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyBmU-6zbaAKVpc8biv_NnA6opYJ5AER5HA")

function AIGenerated() {
  const [roadmap, setRoadmap] = useState(null)
  const [selectedConcept, setSelectedConcept] = useState(null)
  const [markedConcepts, setMarkedConcepts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [, currentUrl] = useCurrentLocation() // Re-added useCurrentLocation
  const [promptInput, setPromptInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // Load marked concepts for the current roadmap
  const loadMarkedConcepts = (roadmapId) => {
    try {
      const allMarkedConcepts = JSON.parse(localStorage.getItem("aiConcepts")) || {}
      return allMarkedConcepts[roadmapId] || []
    } catch (err) {
      console.error("Error loading marked concepts:", err)
      return []
    }
  }

  // Save marked concepts for the current roadmap
  const saveMarkedConcepts = (roadmapId, conceptIds) => {
    try {
      const allMarkedConcepts = JSON.parse(localStorage.getItem("aiConcepts")) || {}
      allMarkedConcepts[roadmapId] = conceptIds
      localStorage.setItem("aiConcepts", JSON.stringify(allMarkedConcepts))
    } catch (err) {
      console.error("Error saving marked concepts:", err)
    }
  }

  // Enhanced JSON sanitization and parsing function
  const parseAIResponse = (responseText) => {
    console.log("Raw AI response length:", responseText.length)

    // Step 1: Clean the response text
 const cleanedText = responseText
  .replace(/```json|```/g, "") // Remove code block markers
  .replace(/^\uFEFF/, "") // Remove BOM
  .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
  .trim();

    console.log("Cleaned text length:", cleanedText.length)

    // Step 2: Find JSON boundaries
    const firstBrace = cleanedText.indexOf("{")
    const lastBrace = cleanedText.lastIndexOf("}")

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error("No valid JSON structure found in response")
    }

    const jsonContent = cleanedText.substring(firstBrace, lastBrace + 1)
    console.log("Extracted JSON length:", jsonContent.length)

    // Step 3: Apply multiple cleaning strategies
    const cleaningStrategies = [
      // Strategy 1: Basic cleaning
      (text) =>
        text
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"'), // Replace single quotes

      // Strategy 2: Fix string values with newlines
      (text) => {
        const lines = text.split("\n")
        return lines
          .map((line, index) => {
            if (line.includes(":") && line.includes('"')) {
              const colonIndex = line.indexOf(":")
              const beforeColon = line.substring(0, colonIndex + 1)
              const afterColon = line.substring(colonIndex + 1).trim()

              if (afterColon.startsWith('"')) {
                // Find proper string boundaries and escape content
                let inString = false
                let escaped = false
                let result = beforeColon + ' "'

                for (let i = 1; i < afterColon.length; i++) {
                  const char = afterColon[i]
                  if (!inString && char === '"') {
                    inString = true
                    continue
                  }
                  if (inString) {
                    if (escaped) {
                      result += char
                      escaped = false
                    } else if (char === "\\") {
                      result += "\\\\"
                      escaped = true
                    } else if (char === '"') {
                      result += '"' + afterColon.substring(i + 1)
                      break
                    } else if (char === "\n") {
                      result += "\\n"
                    } else if (char === "\r") {
                      result += "\\r"
                    } else if (char === "\t") {
                      result += "\\t"
                    } else {
                      result += char
                    }
                  }
                }
                return result
              }
            }
            return line
          })
          .join("\n")
      },

      // Strategy 3: Handle malformed arrays and objects
      (text) => {
        // Fix missing commas between array elements
        text = text.replace(/}\s*{/g, "}, {")
        // Fix missing commas between object properties
        text = text.replace(/"\s*"/g, '", "')
        return text
      },
    ]

    // Step 4: Try each cleaning strategy
    for (let i = 0; i < cleaningStrategies.length; i++) {
      try {
        const cleanedJson = cleaningStrategies[i](jsonContent)
        const parsed = JSON.parse(cleanedJson)

        // Validate the structure
        if (parsed && typeof parsed === "object" && parsed.roadmap_id && Array.isArray(parsed.concepts)) {
          console.log(`Successfully parsed with strategy ${i + 1}`)
          return parsed
        }
      } catch (strategyError) {
        console.log(`Strategy ${i + 1} failed:`, strategyError.message)
        continue
      }
    }

    // Step 5: Last resort - try to extract and reconstruct JSON manually
    try {
      console.log("Attempting manual JSON reconstruction...")

      // Extract key components using regex
      const roadmapIdMatch = cleanedText.match(/"roadmap_id":\s*(\d+)/)
      const roadmapNameMatch = cleanedText.match(/"roadmap_name":\s*"([^"]*)"/)
      const roadmapDescMatch = cleanedText.match(/"roadmap_description":\s*"([^"]*)"/)

      if (!roadmapIdMatch || !roadmapNameMatch) {
        throw new Error("Could not extract essential roadmap data")
      }

      // Try to extract concepts array
      const conceptsMatch = cleanedText.match(/"concepts":\s*\[(.*)\]/s)
      if (!conceptsMatch) {
        throw new Error("Could not extract concepts array")
      }

      // Build a minimal valid structure
      const fallbackRoadmap = {
        roadmap_id: Number.parseInt(roadmapIdMatch[1]),
        roadmap_name: roadmapNameMatch[1],
        roadmap_description: roadmapDescMatch ? roadmapDescMatch[1] : `Learn ${roadmapNameMatch[1]} step by step`,
        created_at: new Date().toISOString(),
        meta_title: `${roadmapNameMatch[1]}-roadmap`,
        meta_description: `A comprehensive step-by-step guide to learning ${roadmapNameMatch[1]}`,
        concepts: [],
      }

      // Try to extract individual concepts
      const conceptMatches = [...conceptsMatch[1].matchAll(/{[^}]*"concept_id":\s*(\d+)[^}]*}/g)]

      conceptMatches.forEach((match, index) => {
        try {
          const conceptText = match[0]
          const conceptId = Number.parseInt(match[1])
          const nameMatch = conceptText.match(/"concept_name":\s*"([^"]*)"/)
          const descMatch = conceptText.match(/"concept_description":\s*"([^"]*)"/)

          if (nameMatch) {
            fallbackRoadmap.concepts.push({
              concept_id: conceptId,
              concept_name: nameMatch[1],
              concept_description: descMatch ? descMatch[1] : `Learn about ${nameMatch[1]}`,
              concept_details: `Brief Summary: This concept covers ${nameMatch[1]}. Key Concepts: - Understanding the basics - Practical applications - Best practices Examples: - Example 1 - Example 2 - Example 3`,
              roadmap_id: fallbackRoadmap.roadmap_id,
            })
          }
        } catch (conceptError) {
          console.log(`Failed to parse concept ${index + 1}:`, conceptError.message)
        }
      })

      if (fallbackRoadmap.concepts.length > 0) {
        console.log(`Fallback reconstruction successful with ${fallbackRoadmap.concepts.length} concepts`)
        return fallbackRoadmap
      }
    } catch (fallbackError) {
      console.error("Fallback reconstruction failed:", fallbackError.message)
    }

    throw new Error("All JSON parsing strategies failed")
  }

  useEffect(() => {
    window.scrollTo(0, 0)

    // Try to load the last generated roadmap
    try {
      const lastRoadmap = localStorage.getItem("lastGeneratedRoadmap")
      if (lastRoadmap) {
        const parsedRoadmap = JSON.parse(lastRoadmap)
        setRoadmap(parsedRoadmap)

        // Load marked concepts for this roadmap
        if (parsedRoadmap && parsedRoadmap.roadmap_id) {
          const conceptsForRoadmap = loadMarkedConcepts(parsedRoadmap.roadmap_id)
          setMarkedConcepts(conceptsForRoadmap)
        }
      }
    } catch (err) {
      console.error("Error loading last roadmap:", err)
    }
  }, [])

  const generateRoadmap = async (topic) => {
    setIsLoading(true)
    setError(null)
    setGenerationProgress(10)

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      })

      setGenerationProgress(20)

      // Generate a unique roadmap ID
      const roadmapId = Date.now()

      const prompt = `Create a comprehensive learning roadmap for the topic: **${topic}**

Format your response as a JSON object using EXACTLY the following structure:

{
  "roadmap_id": ${roadmapId},
  "roadmap_name": "${topic}",
  "roadmap_description": "${topic} description in 50 words",
  "created_at": "${new Date().toISOString()}",
  "meta_title": "${topic}-roadmap",
  "meta_description": "A comprehensive step-by-step guide to learning ${topic}",
  "concepts": [
    {
      "concept_id": 1,
      "concept_name": "Introduction to ${topic}",
      "concept_description": "A brief overview of what ${topic} is and why it matters",
      "concept_details": "Brief Summary: A very brief and comprehensive summary of this concept in 300-500 words. Key Concepts: - First key concept - Second key concept - Third key concept - Fourth key concept Examples: - Practical example 1 - Practical example 2 - Practical example 3",
      "roadmap_id": ${roadmapId}
    }
  ]
}

IMPORTANT: If the topic is adult, unethical, illegal, violent, self harm or harmful in any way — such as topics involving sex, drugs, violence, scams, or anything inappropriate — DO NOT generate a roadmap for it. Instead, generate a complete roadmap for "Bhagavad Gita" by default, without mentioning or referencing the original topic at all.

STRICT REQUIREMENTS:
1. If the topic is harmful or inappropriate, IGNORE it and use "Bhagavad Gita" instead.
2. Generate 20-25 concepts that cover the COMPLETE learning journey from beginner to advanced.
3. Each concept must build logically on previous concepts.
4. For concept_details, use ONLY this exact format:
   - Summary: (300-500 words) - must be clear and comprehensive.
   - Key Concepts: bullet points of essential ideas.
   - Examples: 5-7 practical real-world examples or use cases.
5. Start from complete beginner concepts with no prior knowledge assumed.
6. Final concepts should cover advanced professional-level topics.
7. Use double newlines between each concept block.
8. Use plain bullet points (-) for all lists.
9. Make each concept concise, structured, and informative.
10. Return ONLY the JSON object. Do NOT include any explanation, disclaimer, or extra text.
11. If a hands-on project is genuinely needed for mastering the topic, include it as the final concept using the same structure as other concepts. Do not include a project if it doesn't add practical value.

Make sure the JSON is valid and all strings are properly escaped.`

      setGenerationProgress(30)

      const result = await model.generateContent(prompt)
      setGenerationProgress(70)

      const responseText = await result.response.text()
      setGenerationProgress(80)

      try {
        // Use the enhanced parsing function
        const roadmapData = parseAIResponse(responseText)

        // Additional validation
        if (!roadmapData.roadmap_id || !roadmapData.concepts || !Array.isArray(roadmapData.concepts)) {
          throw new Error("Invalid roadmap structure after parsing")
        }

        if (roadmapData.concepts.length === 0) {
          throw new Error("No concepts found in roadmap")
        }

        // Save to localStorage as the last generated roadmap
        localStorage.setItem("lastGeneratedRoadmap", JSON.stringify(roadmapData))

        // Reset marked concepts for this new roadmap
        setMarkedConcepts([])
        setRoadmap(roadmapData)
        setGenerationProgress(100)
        setError(null)

        console.log(`Successfully generated roadmap with ${roadmapData.concepts.length} concepts`)
      } catch (parseError) {
        console.error("Enhanced parsing failed:", parseError)

        // Create a basic fallback roadmap
        const fallbackRoadmap = {
          roadmap_id: roadmapId,
          roadmap_name: topic,
          roadmap_description: `A comprehensive learning guide for ${topic}`,
          created_at: new Date().toISOString(),
          meta_title: `${topic}-roadmap`,
          meta_description: `Learn ${topic} step by step`,
          concepts: [
            {
              concept_id: 1,
              concept_name: `Introduction to ${topic}`,
              concept_description: `Get started with ${topic} fundamentals`,
              concept_details: `Brief Summary: This is an introduction to ${topic}. We'll cover the basic concepts and get you started on your learning journey. Key Concepts: - Understanding what ${topic} is - Why ${topic} is important - Basic terminology - Getting started Examples: - Real-world applications - Common use cases - Getting started resources`,
              roadmap_id: roadmapId,
            },
          ],
        }

        localStorage.setItem("lastGeneratedRoadmap", JSON.stringify(fallbackRoadmap))
        setMarkedConcepts([])
        setRoadmap(fallbackRoadmap)
        setError(
          "Generated a basic roadmap. The AI response had formatting issues, but we created a starting point for you. Try generating again for a more detailed roadmap.",
        )
        setGenerationProgress(100)
      }
    } catch (err) {
      console.error("Error generating roadmap:", err)
      setError(
        "Failed to generate roadmap. Please check your internet connection and try again. If the problem persists, try a different topic.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault()
    if (!promptInput.trim()) return

    setIsGenerating(true)
    await generateRoadmap(promptInput.trim())
    setIsGenerating(false)
    setPromptInput("")
  }

  const handleConceptClick = (concept) => {
    setSelectedConcept(concept)
  }

  const handleClosePopup = () => {
    setSelectedConcept(null)
  }

  const toggleConceptMark = (conceptId) => {
    if (!roadmap || !roadmap.roadmap_id) return

    let updatedMarkedConcepts
    if (markedConcepts.includes(conceptId)) {
      updatedMarkedConcepts = markedConcepts.filter((id) => id !== conceptId)
    } else {
      updatedMarkedConcepts = [...markedConcepts, conceptId]
    }

    setMarkedConcepts(updatedMarkedConcepts)

    // Save marked concepts for this specific roadmap
    saveMarkedConcepts(roadmap.roadmap_id, updatedMarkedConcepts)
  }

  // This function specifically handles the mark toggle from the popup
  const handlePopupMarkToggle = () => {
    if (selectedConcept) {
      toggleConceptMark(selectedConcept.concept_id)
    }
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!roadmap || !roadmap.concepts || roadmap.concepts.length === 0) return 0
    return Math.round((markedConcepts.length / roadmap.concepts.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Generating your comprehensive roadmap...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen px-4">
        <div className="text-red-500 text-lg font-semibold mb-4 text-center max-w-2xl">{error}</div>
        <div className="flex gap-4">
          <button
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            onClick={() => setError(null)}
          >
            Try Again
          </button>
          {roadmap && (
            <button
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              onClick={() => {
                setError(null)
                // Keep the existing roadmap
              }}
            >
              Continue with Current Roadmap
            </button>
          )}
        </div>
      </div>
    )
  }

  const isConceptMarked = selectedConcept ? markedConcepts.includes(selectedConcept.concept_id) : false
  const progressPercentage = calculateProgress()

  // Main content - always show the form at the top
  return (
    <>
      <Title>{roadmap ? `Expert ${roadmap.roadmap_name} Learning Roadmap` : "AI-Generated Learning Roadmaps"}</Title>
      <Meta  
        name="description"
        content={
          roadmap ? roadmap.roadmap_description : "Generate comprehensive learning roadmaps for any topic using AI"
        }
      />
   
      <Meta rel="canonical" href={currentUrl} />  
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {roadmap ? roadmap.roadmap_name.toUpperCase() : "AI-GENERATED LEARNING ROADMAPS"}
          </h1>
          <p className="text-md md:text-lg text-indigo-100 mb-6">
            {roadmap
              ? roadmap.roadmap_description
              : "Enter any topic below to generate a comprehensive learning roadmap with 20-25 concepts."}
          </p>
          <form onSubmit={handleGenerateRoadmap} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Enter a topic (e.g., Python, Machine Learning, Web Development)"
              className="flex-grow p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim()}
              className={`p-3 rounded-lg text-white flex items-center justify-center ${
                isGenerating || !promptInput.trim()
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-700 hover:bg-indigo-800"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  <span>{roadmap ? "Generate New Roadmap" : "Generate Roadmap"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {roadmap ? (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
              <a href="/" className="hover:text-indigo-600 transition-colors">
                Home
              </a>
              <ChevronRight size={16} />
              <Link to="/roadmaps" className="hover:text-indigo-600 transition-colors">
                Roadmaps
              </Link>
              <ChevronRight size={16} />
              <span className="font-medium text-indigo-600">{roadmap.roadmap_name}</span>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">Your Progress</h3>
                <span className="text-sm font-medium text-indigo-600">{progressPercentage}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {markedConcepts.length} of {roadmap.concepts ? roadmap.concepts.length : 0} concepts completed
              </p>
            </div>

            {roadmap.concepts && roadmap.concepts.length > 0 ? (
              <div className="relative p-6">
                <div className="flex md:items-center flex-col md:flex-row gap-4 justify-between mb-8">
                  <div className="flex items-center">
                    <Award className="text-indigo-500 mr-2" size={24} />
                    <h2 className="text-2xl font-semibold text-gray-800">Learning Path</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {roadmap.concepts.length} concepts from beginner to advanced
                  </div>
                </div>
                <RoadmapDetails
                  data={roadmap.concepts}
                  onConceptClick={handleConceptClick}
                  markedConcepts={markedConcepts}
                  toggleConceptMark={toggleConceptMark}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg">
                <Book className="text-indigo-300 mb-4" size={64} />
                <p className="text-center text-lg text-gray-600">
                  This roadmap is currently being developed and will be available soon.
                </p>
              </div>
            )}

            <ConceptPopup
              concept={selectedConcept}
              onClose={handleClosePopup}
              marked={isConceptMarked}
              onMarkToggle={handlePopupMarkToggle}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg">
            <Book className="text-indigo-300 mb-4" size={64} />
            <p className="text-center text-lg text-gray-600 mb-4">
              Enter any topic above to generate a comprehensive learning roadmap.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function RoadmapDetails({ data, onConceptClick, markedConcepts, toggleConceptMark }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto pb-16">
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 sm:w-2 h-full bg-gradient-to-b from-indigo-300 to-purple-300 rounded-full shadow-lg"></div>
      {data.map((concept, index) => (
        <Concept
          key={concept.concept_id}
          concept={concept}
          index={index}
          onClick={() => onConceptClick(concept)}
          marked={markedConcepts.includes(concept.concept_id)}
          onMarkToggle={() => toggleConceptMark(concept.concept_id)}
          totalConcepts={data.length}
        />
      ))}
    </div>
  )
}

export default AIGenerated
