import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X} from 'lucide-react';
import { useAuth } from '../utils/AuthConext';

function CustomNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between h-20 gap-6 font-medium">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            RoadmapsHub
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-zinc-700 hover:text-indigo-600 transition">
            Home
          </Link>
          <Link to="/roadmaps" className="text-zinc-700 hover:text-indigo-600 transition">
            Roadmaps
          </Link>
          <Link to="/popular" className="text-zinc-700 hover:text-indigo-600 transition">
            Popular
          </Link>
          <Link to="/ai-generated-roadmaps" className="text-zinc-700 hover:text-indigo-600 transition relative">
            AI Generated Roadmaps
          
          </Link>
          <Link to="/resources" className="text-zinc-700 hover:text-indigo-600 transition">
            Resources
          </Link>
          <Link to="/blog" className="text-zinc-700 hover:text-indigo-600 transition">
            Blog
          </Link>

          {token && (
            <Link to="/dashboard" className="text-zinc-700 hover:text-indigo-600 transition">
              Dashboard
            </Link>
          )}
          
          {token && (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-md transition-all"
            >
              Logout
            </button>
          ) }
        </div>
        
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-zinc-700">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Menu
            </span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-700 hover:text-indigo-600 transition">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-6">
              <Link 
                to="/" 
                className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg" 
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/roadmaps" 
                className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg" 
                onClick={() => setIsOpen(false)}
              >
                Roadmaps
              </Link>
              <Link 
                to="/popular" 
                className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg" 
                onClick={() => setIsOpen(false)}
              >
                Popular Roadmaps
              </Link>
              <Link 
                to="/ai-generated-roadmaps" 
                className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg flex items-center justify-between" 
                onClick={() => setIsOpen(false)}
              >
                <span>AI Generated Roadmaps</span>
               
              </Link>
              <Link 
                to="/resources" 
                className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg" 
                onClick={() => setIsOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/blog" 
                className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg" 
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              
              {token && (
                <Link 
                  to="/dashboard" 
                  className="block text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all py-3 px-4 rounded-lg" 
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          {token && (
            <div className="p-6 border-t">
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-md transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default CustomNavbar;