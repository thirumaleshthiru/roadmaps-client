import React, { useEffect, useRef, useState } from 'react';
import { X, BookOpen, Link, Check } from 'lucide-react';

function ConceptPopup({ concept, onClose }) {
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // Handle animation
  useEffect(() => {
    if (concept) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [concept]);

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
  }, [onClose]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
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
          <div 
            className="prose prose-indigo max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: concept.concept_details }}
          ></div>
        </div>

        {/* Footer with Actions */}
        <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Part of the learning journey
          </div>
          
          <div className="flex space-x-3">
            {concept.resources && (
              <a
                href={concept.resources}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <Link size={16} className="mr-2" />
                Resources
              </a>
            )}
            
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

export default ConceptPopup;