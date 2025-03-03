import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../utils/AuthConext';

function CustomNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {token,logout} = useAuth();

  const handleLogout = ()=>{
    logout()
  }

  return (
    <nav className="bg-base-100  sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between h-16 gap-6 font-normal">
        <Link to="/" className="text-2xl font-bold flex items-center">
          RoadmapMonk
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-primary transition">
            Home
          </Link>
          <Link to="/roadmaps" className="text-gray-600 hover:text-primary transition">
            Roadmaps
          </Link>
          <Link to="/popular" className="text-gray-600 hover:text-primary transition">
            Popular Roadmaps
          </Link>

          <Link to="/resources" className="text-gray-600 hover:text-primary transition">
            Resources
          </Link>

          <Link to="/blog" className="text-gray-600 hover:text-primary transition">
            Blog
          </Link>
           
          {token && 
          <Link to="/dashboard" className="text-gray-600 hover:text-primary transition">
          Dashboard
        </Link>
          }
          { token &&  (<button onClick={handleLogout}>Logout</button>)}
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white z-50 fixed w-full">
          <ul className="space-y-2 px-6 py-4 flex flex-col gap-3">
            <li>
              <Link to="/" className="block text-gray-600 hover:text-primary transition" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/roadmaps" className="block text-gray-600 hover:text-primary transition" onClick={() => setIsOpen(false)}>
                Roadmaps
              </Link>
            </li>
            <li>
                <Link to="/popular" className="text-gray-600 hover:text-primary transition" onClick={() => setIsOpen(false)}>
                Popular Roadmaps
              </Link>
            </li>
            <li>
              <Link to="/resources" className="text-gray-600 hover:text-primary transition" onClick={() => setIsOpen(false)}>
              Resources
            </Link>
            </li>
            <li>
            <Link to="/blog" className="text-gray-600 hover:text-primary transition" onClick={() => setIsOpen(false)}>
            Blog
          </Link>
          
            </li>
            
          </ul>
        </div>
      )}
    </nav>
  );
}

export default CustomNavbar;
