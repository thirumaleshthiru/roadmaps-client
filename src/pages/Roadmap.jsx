import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCurrentLocation } from '../utils/useFulFunctions.js';
import { ChevronRight, Award, Book } from 'lucide-react';

// Import components
import Concept from '../components/Concept';
import ConceptPopup from '../components/ConceptPopup';
 
function Roadmap() {
  const { roadmapname } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [markedConcepts, setMarkedConcepts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUrl] = useCurrentLocation();

  

  // Fetch roadmap data and load saved progress
  useEffect(() => {
    setIsLoading(true);
    
    axios
      .get(`http://localhost:7000/roadmaps/roadmapbyname/${roadmapname}`)
      .then((response) => {
        setRoadmap(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching roadmap:', error);
        setError('Failed to load roadmap. Please try again later.');
        setIsLoading(false);
      });

    // Load marked concepts from localStorage
    try {
      const storedConcepts = JSON.parse(localStorage.getItem('markedConcepts')) || [];
      setMarkedConcepts(storedConcepts);
    } catch (err) {
      console.error('Error loading saved progress:', err);
      localStorage.setItem('markedConcepts', JSON.stringify([]));
    }
  }, [roadmapname]);

  // Handlers
  const handleConceptClick = (concept) => {
    setSelectedConcept(concept);
  };

  const handleClosePopup = () => {
    setSelectedConcept(null);
  };

  const toggleConceptMark = (conceptId) => {
    let updatedMarkedConcepts;

    if (markedConcepts.includes(conceptId)) {
      updatedMarkedConcepts = markedConcepts.filter((id) => id !== conceptId);
    } else {
      updatedMarkedConcepts = [...markedConcepts, conceptId];
    }

    setMarkedConcepts(updatedMarkedConcepts);
    localStorage.setItem('markedConcepts', JSON.stringify(updatedMarkedConcepts));
  };

 
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // If roadmap is not found
  if (!roadmap) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-gray-600 text-xl font-semibold mb-4">Roadmap not found</div>
        <a href="/roadmaps" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors">
          Return to Roadmaps
        </a>
      </div>
    );
  }

 

  return (
    <>
      <Helmet>
        <title>{`Latest Expert Design Roadmap: ${roadmapname}`}</title>
        <meta
          name="description"
          content={`Engage your skills with our new expert ${roadmapname} roadmap.`}
        />
        <link rel="canonical" href={currentUrl} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Roadmap Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {roadmap.roadmap_name.toUpperCase()}
          </h1>
          <p className="text-md md:text-lg text-indigo-100 mb-6">
            {roadmap.roadmap_description}
          </p>
          
        
           
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
          <ChevronRight size={16} />
          <a href="/roadmaps" className="hover:text-indigo-600 transition-colors">Roadmaps</a>
          <ChevronRight size={16} />
          <span className="font-medium text-indigo-600">{roadmap.roadmap_name}</span>
        </div>

        {/* Main Content */}
        {roadmap.concepts && roadmap.concepts.length > 0 ? (
          <div className="relative p-6">
            <div className="flex items-center mb-8">
              <Award className="text-indigo-500 mr-2" size={24} />
              <h2 className="text-2xl font-semibold text-gray-800">Learning Path</h2>
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
              This roadmap is currently under development and will be available soon.
            </p>
          </div>
        )}
        
        {/* Concept Popup */}
        <ConceptPopup concept={selectedConcept} onClose={handleClosePopup} />
      </div>
    </>
  );
}

function RoadmapDetails({ data, onConceptClick, markedConcepts, toggleConceptMark }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto pb-16">
      {/* Timeline center line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 sm:w-2 h-full bg-gradient-to-b from-indigo-300 to-purple-300 rounded-full shadow-lg"></div>
      
      {/* Render concepts */}
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

export default Roadmap;