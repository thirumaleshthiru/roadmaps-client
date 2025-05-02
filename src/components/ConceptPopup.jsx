import React, { useEffect, useRef, useState } from 'react';
import { X, BookOpen, Link, Check } from 'lucide-react';

function ConceptPopup({ concept, onClose }) {
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [quote, setQuote] = useState('');

  // Collection of motivational quotes
  const motivationalQuotes = [
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
  ];

  // Handle animation
  useEffect(() => {
    if (concept) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [concept]);

  // Select a random quote when component mounts or concept changes
  useEffect(() => {
    if (concept) {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    }
  }, [concept, motivationalQuotes]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

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