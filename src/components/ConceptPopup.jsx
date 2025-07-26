import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import {formatRoadmapDisplayName } from '../utils/formatRoadmapDisplayName.js'
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

  if (!concept) return null;

  return (
    <div 
      className={`
        fixed inset-0 bg-black/40 backdrop-blur-sm
        flex items-center justify-center z-50 
        px-4 py-6 sm:px-6 lg:px-8
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-0' : 'opacity-100'}
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
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-800 leading-tight">
              {formatRoadmapDisplayName(concept.concept_name)}
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
          <div 
            className="prose prose-indigo max-w-none text-gray-700 leading-relaxed
                       prose-headings:text-gray-800 prose-headings:font-medium
                       prose-p:text-gray-700 prose-p:leading-relaxed
                       prose-strong:text-gray-800 prose-strong:font-medium
                       prose-em:text-gray-700
                       prose-code:text-indigo-800 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                       prose-pre:bg-indigo-50/50 prose-pre:border prose-pre:border-indigo-200
                       prose-blockquote:border-l-indigo-300 prose-blockquote:text-gray-600
                       prose-ul:text-gray-700 prose-ol:text-gray-700
                       prose-li:text-gray-700
                       text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: concept.concept_details }}
          />
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
                        ${marked 
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
  );
}

export default ConceptPopup;