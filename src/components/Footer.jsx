import React from "react";
 import {Link} from 'react-router-dom';
const Footer = () => {
  return (
    <footer className="bg-gray-900 py-10 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-400">
              Expert Roadmaps provides expertly curated learning paths to help you master
              programming, data science, and design.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>
                <Link href="/roadmaps" className="hover:text-white">
                  Explore Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm text-gray-400">Email: methirumaleshgandam@gmail.com</p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>&copy; 2025 Pathly. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;