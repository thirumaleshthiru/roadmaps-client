import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

function Concept({ concept, index, onClick, marked, onMarkToggle, totalConcepts }) {
  const isEven = index % 2 === 0;
  const isLast = index === totalConcepts - 1;

  return (
    <div
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-16 relative`}
      id={`concept-${concept.concept_id}`}
    >
      {/* Main Content Card */}
      <div className={`w-full md:w-5/12 px-4 mb-6 md:mb-0 z-10`}>
        <div 
          className={`
            p-6 rounded-xl shadow-lg bg-white cursor-pointer 
            transform transition-all duration-300 
            hover:scale-102 hover:shadow-2xl 
            ${marked ? 'border-l-4 border-green-500' : 'border-l-4 border-transparent'} 
            relative overflow-hidden
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
              Learn more <ArrowRight size={14} className="ml-1" />
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

export default Concept;