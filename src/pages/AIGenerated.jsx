import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { ChevronRight, Award, Book, Send, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
 
import { Link } from 'react-router-dom';
import Concept from '../components/Concept';
import ConceptPopup from '../components/ConceptPopup';

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
              "concept_details": "Detailed HTML content about this concept with headings, paragraphs, lists, etc.",
              "roadmap_id": ${roadmapId}
            }
            // IMPORTANT: Include 20-25 concepts total, covering everything from absolute basics to advanced topics
          ]
        }

        CRITICAL REQUIREMENTS:
        1. Generate 20-25 concepts that cover the COMPLETE learning journey from absolute beginner to advanced practitioner
        2. Each concept must build logically on previous concepts
        3. Include proper HTML formatting in the concept_details field with <h2>, <p>, <ul>, <li>, etc. tags
        4. Each concept_details should be comprehensive with detailed explanations
        5. Include fun facts, code examples when relevant, and practical tips
        6. Ensure the roadmap is professionally written as if created by an expert in ${topic}
        7. Make sure ALL HTML tags are properly escaped in the JSON (use \\u003C for < and \\u003E for >)
        8. The first few concepts MUST be suitable for complete beginners with no prior knowledge
        9. The final concepts should cover advanced topics that professionals would need to know
        
        Return ONLY the JSON object with no additional text.
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
        setError('Failed to generate roadmap. Please try again with a different topic.');
        
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
          }
        } catch (fallbackError) {
          console.error('Fallback extraction failed:', fallbackError);
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
              Enter any topic above to generate a comprehensive learning roadmap.
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