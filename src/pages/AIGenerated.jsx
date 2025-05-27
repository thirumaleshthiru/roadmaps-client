 import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { ChevronRight, Award, Book, Send, Loader2, X, BookOpen, ExternalLink, Check } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Link } from 'react-router-dom';

function Concept({ concept, index, onClick, marked, onMarkToggle, totalConcepts }) {
  const isEven = index % 2 === 0;
  const isLast = index === totalConcepts - 1;

  return (
    <div
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-16 relative`}
      id={`concept-${concept.concept_id}`}
    >
      {/* Main Content Card */}
      <div className={`w-full md:w-5/12 px-1 mb-6 md:mb-0 z-10`}>
        <div 
          className={`
            p-3 rounded-xl bg-white cursor-pointer 
            transform transition-all duration-300 
            hover:scale-102 hover:shadow-2xl 
            ${marked ? 'border-l-4 border-green-500' : 'border-l-4 border-transparent'} 
            relative overflow-hidden
            shadow-[0_3px_10px_rgb(0,0,0,0.2)]
          `}
          onClick={onClick}
        >
          {/* Concept Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-3 pr-8">
            {concept.concept_name}
          </h3>
          
          {/* Progress Indicator */}
          {marked && (
            <div className="absolute top-0 right-0 bg-green-500 text-white p-2 rounded-bl-lg">
              <Check size={16} />
            </div>
          )}
          
          {/* Concept Description */}
          <p className="text-gray-600 text-sm md:text-base">
            {concept.concept_description?.substring(0, 120)}
            {concept.concept_description?.length > 120 ? '...' : ''}
          </p>
          
          {/* Card Footer */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-indigo-600 font-medium flex items-center">
              Learn more
            </span>
            
            <span className="text-gray-500">
              {marked ? 'Completed' : 'Not started'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Center Timeline Marker */}
      <div className="w-full md:w-2/12 flex justify-center relative">
        <button
          className={`
            w-12 h-12 rounded-full 
            ${marked ? 'bg-green-500' : 'bg-white border-2 border-indigo-500'} 
            shadow-lg z-20 flex items-center justify-center 
            cursor-pointer transition-all duration-300 
            hover:scale-110 focus:outline-none
          `}
          onClick={onMarkToggle}
          aria-label={marked ? 'Mark as incomplete' : 'Mark as complete'}
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
            className={`absolute ${isEven ? 'top-12' : 'bottom-12'} left-1/2 transform -translate-x-1/2 w-1 h-16 bg-indigo-200`}
            style={{ zIndex: -1 }}
          ></div>
        )}
      </div>
      
      {/* Empty Space for Layout */}
      <div className="w-full md:w-5/12"></div>
    </div>
  );
}

function ConceptPopup({ concept, onClose, marked, onMarkToggle }) {
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [quote, setQuote] = useState('');

  // Collection of motivational quotes - wrapped in useMemo to prevent recreation on each render
  const motivationalQuotes = useMemo(() => [
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
    "You don't have to finish fast. You just have to finish."
  ], []);

  // Handle animation
  useEffect(() => {
    if (concept) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [concept]);

  // Use useCallback to memoize the handleClose function
  const handleClose = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  // Handle completing the concept
  const handleComplete = useCallback(() => {
    if (onMarkToggle && concept) {
      onMarkToggle(concept.concept_id);
      setIsAnimating(true);
      setTimeout(() => {
        onClose();
      }, 200);
    }
  }, [concept, onClose, onMarkToggle]);

  // Select a random quote when component mounts or concept changes
  useEffect(() => {
    if (concept) {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    }
  }, [concept, motivationalQuotes]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    // Close with escape key
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleClose]);

  // Function to format plain text content with basic styling
  const formatContent = (content) => {
    if (!content) return '';
    
    // Split content into sections
    const sections = content.split('\n\n').filter(s => s.trim());
    
    return sections.map((section, index) => {
      const trimmed = section.trim();
      
      // Check if it's "Brief Summary:" section
      if (trimmed.startsWith('Brief Summary:')) {
        const summaryText = trimmed.replace('Brief Summary:', '').trim();
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Brief Summary</h3>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">
              {summaryText}
            </p>
          </div>
        );
      }
      
      // Check if it's "Key Concepts:" section
      if (trimmed.startsWith('Key Concepts:')) {
        const conceptsText = trimmed.replace('Key Concepts:', '').trim();
        const concepts = conceptsText.split('\n').filter(c => c.trim()).map(c => c.replace(/^[-•*]\s*/, ''));
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Concepts</h3>
            <ul className="space-y-2">
              {concepts.map((concept, conceptIndex) => (
                <li key={conceptIndex} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span className="text-gray-700">{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Check if it's "Examples:" section
      if (trimmed.startsWith('Examples:')) {
        const examplesText = trimmed.replace('Examples:', '').trim();
        const examples = examplesText.split('\n').filter(e => e.trim()).map(e => e.replace(/^[-•*]\s*/, ''));
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Examples</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {examples.map((example, exampleIndex) => (
                  <li key={exampleIndex} className="flex items-start">
                    <span className="text-green-600 mr-2">→</span>
                    <span className="text-gray-700">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  if (!concept) return null;

  return (
    <div 
      className={`
        fixed inset-0 bg-black bg-opacity-60 
        flex items-center justify-center z-50 p-4
        transition-opacity duration-300
        ${isAnimating ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-2xl shadow-2xl 
          w-full max-w-4xl max-h-[90vh] overflow-hidden
          flex flex-col transition-transform duration-300
          ${isAnimating ? 'scale-95' : 'scale-100'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center space-x-3">
            <BookOpen className="text-indigo-500 hidden sm:block" size={24} />
            <h2 className="text-xl font-bold text-gray-800 truncate pr-2">
              {concept.concept_name}
            </h2>
          </div>
          
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-grow">
          <div className="prose prose-indigo max-w-none">
            {formatContent(concept.concept_details)}
          </div>
        </div>

        {/* Footer with Actions and Random Quote */}
        <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600 italic font-medium max-w-md pl-4 border-l-4 border-indigo-300">
            {quote}
          </div>
          
          <div className="flex space-x-3">
            {concept.resources && (
              <a
                href={concept.resources}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <ExternalLink size={16} className="mr-2" />
                Resources
              </a>
            )}
            
            <button
              className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${
                marked 
                  ? "bg-green-100 text-green-700 hover:bg-green-200" 
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              onClick={handleComplete}
            >
              <Check size={16} className="mr-2" />
              {marked ? "Completed" : "Complete"}
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              onClick={handleClose}
            >
              <Check size={16} className="mr-2" />
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI('AIzaSyBmU-6zbaAKVpc8biv_NnA6opYJ5AER5HA');

function AIGenerated() {
  const [roadmap, setRoadmap] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [markedConcepts, setMarkedConcepts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUrl] = useCurrentLocation();
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Load marked concepts for the current roadmap
  const loadMarkedConcepts = (roadmapId) => {
    try {
      const allMarkedConcepts = JSON.parse(localStorage.getItem('aiConcepts')) || {};
      return allMarkedConcepts[roadmapId] || [];
    } catch (err) {
      console.error('Error loading marked concepts:', err);
      return [];
    }
  };

  // Save marked concepts for the current roadmap
  const saveMarkedConcepts = (roadmapId, conceptIds) => {
    try {
      const allMarkedConcepts = JSON.parse(localStorage.getItem('aiConcepts')) || {};
      allMarkedConcepts[roadmapId] = conceptIds;
      localStorage.setItem('aiConcepts', JSON.stringify(allMarkedConcepts));
    } catch (err) {
      console.error('Error saving marked concepts:', err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Try to load the last generated roadmap
    try {
      const lastRoadmap = localStorage.getItem('lastGeneratedRoadmap');
      if (lastRoadmap) {
        const parsedRoadmap = JSON.parse(lastRoadmap);
        setRoadmap(parsedRoadmap);
        
        // Load marked concepts for this roadmap
        if (parsedRoadmap && parsedRoadmap.roadmap_id) {
          const conceptsForRoadmap = loadMarkedConcepts(parsedRoadmap.roadmap_id);
          setMarkedConcepts(conceptsForRoadmap);
        }
      }
    } catch (err) {
      console.error('Error loading last roadmap:', err);
    }
  }, []);

  const generateRoadmap = async (topic) => {
    setIsLoading(true);
    setError(null);
    setGenerationProgress(10);
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      setGenerationProgress(20);
      
      // Generate a unique roadmap ID
      const roadmapId = Date.now();
      
      const prompt = `
        Create a comprehensive learning roadmap for ${topic}. Format your response as a JSON object following this EXACT structure:
        {
          "roadmap_id": ${roadmapId},
          "roadmap_name": "${topic}",
          "roadmap_description": "A detailed description of ${topic} and why it's important to learn",
          "created_at": "${new Date().toISOString()}",
          "meta_title": "${topic}-roadmap",
          "meta_description": "A comprehensive step-by-step guide to learning ${topic}",
          "concepts": [
            {
              "concept_id": 1,
              "concept_name": "Introduction to ${topic}",
              "concept_description": "A brief overview of what ${topic} is and why it matters",
              "concept_details": "Brief Summary:\nA very brief and comprehensive summary of this concept in 2-3 sentences.\n\nKey Concepts:\n- First key concept\n- Second key concept\n- Third key concept\n- Fourth key concept\n\nExamples:\n- Practical example 1\n- Practical example 2\n- Practical example 3",
              "roadmap_id": ${roadmapId}
            }
            // IMPORTANT: Include 20-25 concepts total, covering everything from absolute basics to advanced topics
          ]
        }

        CRITICAL REQUIREMENTS:
        1. Generate 20-25 concepts that cover the COMPLETE learning journey from absolute beginner to advanced practitioner
        2. Each concept must build logically on previous concepts
        3. For concept_details, use ONLY this exact format:
           - Brief Summary: 2-3 sentences maximum - very brief but comprehensive
           - Key Concepts: 4-6 bullet points of the most important concepts
           - Examples: 3-4 practical examples or use cases
        4. Keep everything concise and focused - no lengthy explanations
        5. The first few concepts MUST be suitable for complete beginners with no prior knowledge
        6. The final concepts should cover advanced topics that professionals would need to know
        7. Each section should be separated by double newlines
        8. Use simple bullet points with dashes for lists
        9. Make sure Brief Summary is truly brief but covers the essence of the concept
        10. Key Concepts should be the core things someone needs to understand
        11. Examples should be practical, real-world applications or use cases
        
        Return ONLY the JSON object with no additional text or formatting.
      `;

      setGenerationProgress(30);
      const result = await model.generateContent(prompt);
      setGenerationProgress(70);
      const responseText = await result.response.text();
      setGenerationProgress(80);
      
      try {
        // Extract JSON from the response
        const jsonStr = responseText.replace(/```json|```/g, '').trim();
        const roadmapData = JSON.parse(jsonStr);
        
        // Save to localStorage as the last generated roadmap
        localStorage.setItem('lastGeneratedRoadmap', JSON.stringify(roadmapData));
        
        // Reset marked concepts for this new roadmap
        setMarkedConcepts([]);
        
        setRoadmap(roadmapData);
        setGenerationProgress(100);
      } catch (jsonError) {
        console.error('Error parsing AI response:', jsonError);
        console.log('Raw response:', responseText);
        
        // Try to extract JSON with a more lenient approach
        try {
          const jsonStartIndex = responseText.indexOf('{');
          const jsonEndIndex = responseText.lastIndexOf('}');
          
          if (jsonStartIndex >= 0 && jsonEndIndex >= 0) {
            const extractedJson = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
            const roadmapData = JSON.parse(extractedJson);
            
            // Save to localStorage as the last generated roadmap
            localStorage.setItem('lastGeneratedRoadmap', JSON.stringify(roadmapData));
            
            // Reset marked concepts for this new roadmap
            setMarkedConcepts([]);
            
            setRoadmap(roadmapData);
            setError(null);
            setGenerationProgress(100);
          } else {
            setError('Failed to generate roadmap. Please try again with a different topic.');
          }
        } catch (fallbackError) {
          console.error('Fallback extraction failed:', fallbackError);
          setError('Failed to generate roadmap. Please try again with a different topic.');
        }
      }
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setError('Failed to generate roadmap. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    
    setIsGenerating(true);
    await generateRoadmap(promptInput.trim());
    setIsGenerating(false);
    setPromptInput('');
  };

  const handleConceptClick = (concept) => {
    setSelectedConcept(concept);
  };

  const handleClosePopup = () => {
    setSelectedConcept(null);
  };

  const toggleConceptMark = (conceptId) => {
    if (!roadmap || !roadmap.roadmap_id) return;
    
    let updatedMarkedConcepts;

    if (markedConcepts.includes(conceptId)) {
      updatedMarkedConcepts = markedConcepts.filter((id) => id !== conceptId);
    } else {
      updatedMarkedConcepts = [...markedConcepts, conceptId];
    }

    setMarkedConcepts(updatedMarkedConcepts);
    // Save marked concepts for this specific roadmap
    saveMarkedConcepts(roadmap.roadmap_id, updatedMarkedConcepts);
  };

  // This function specifically handles the mark toggle from the popup
  const handlePopupMarkToggle = () => {
    if (selectedConcept) {
      toggleConceptMark(selectedConcept.concept_id);
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!roadmap || !roadmap.concepts || roadmap.concepts.length === 0) return 0;
    return Math.round((markedConcepts.length / roadmap.concepts.length) * 100);
  };

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
          <p className="text-sm text-gray-500">Creating 20-25 detailed learning concepts</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          onClick={() => setError(null)}
        >
          Try Again
        </button>
      </div>
    );
  }

  const isConceptMarked = selectedConcept ? markedConcepts.includes(selectedConcept.concept_id) : false;
  const progressPercentage = calculateProgress();

  // Main content - always show the form at the top
  return (
    <>
      <Helmet>
        <title>{roadmap ? `Expert ${roadmap.roadmap_name} Learning Roadmap` : "AI-Generated Learning Roadmaps"}</title>
        <meta
          name="description"
          content={roadmap ? roadmap.roadmap_description : "Generate comprehensive learning roadmaps for any topic using AI"}
        />
        <link rel="canonical" href={currentUrl} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {roadmap ? roadmap.roadmap_name.toUpperCase() : "AI-GENERATED LEARNING ROADMAPS"}
          </h1>
          <p className="text-md md:text-lg text-indigo-100 mb-6">
            {roadmap ? roadmap.roadmap_description : "Enter any topic below to generate a comprehensive learning roadmap with 20-25 concepts."}
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
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-700 hover:bg-indigo-800'
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
              <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
              <ChevronRight size={16} />
              <Link to="/roadmaps" className="hover:text-indigo-600 transition-colors">Roadmaps</Link>
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
                <div className="flex items-center justify-between mb-8">
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
              Enterany topic above to generate a comprehensive learning roadmap.
            </p>
            <p className="text-center text-md text-gray-500">
              Our AI will create a detailed step-by-step guide with 20-25 concepts to help you master your chosen subject from basics to advanced topics.
            </p>
          </div>
        )}
      </div>
    </>
  );
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
  );
}

export default AIGenerated;