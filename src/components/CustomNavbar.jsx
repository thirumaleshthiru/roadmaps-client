import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
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
            Pathly
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
      
      {isOpen && (
        <div className="md:hidden bg-white z-50 fixed w-full shadow-lg">
          <div className="space-y-4 px-6 py-6 flex flex-col">
            <Link 
              to="/" 
              className="block text-zinc-700 hover:text-indigo-600 transition py-2" 
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/roadmaps" 
              className="block text-zinc-700 hover:text-indigo-600 transition py-2" 
              onClick={() => setIsOpen(false)}
            >
              Roadmaps
            </Link>
            <Link 
              to="/popular" 
              className="block text-zinc-700 hover:text-indigo-600 transition py-2" 
              onClick={() => setIsOpen(false)}
            >
              Popular Roadmaps
            </Link>
            <Link 
              to="/resources" 
              className="block text-zinc-700 hover:text-indigo-600 transition py-2" 
              onClick={() => setIsOpen(false)}
            >
              Resources
            </Link>
            <Link 
              to="/blog" 
              className="block text-zinc-700 hover:text-indigo-600 transition py-2" 
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            
            {token && (
              <Link 
                to="/dashboard" 
                className="block text-zinc-700 hover:text-indigo-600 transition py-2" 
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {token && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full py-3 mt-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-md transition-all"
              >
                Logout
              </button>
            )  }
          </div>
        </div>
      )}
    </nav>
  );
}

export default CustomNavbar;