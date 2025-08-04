
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="relative z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex justify-between items-center py-6">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/ec0ef243-550f-463c-830d-1d7c794203c5.png" 
              alt="VERTO Logo" 
              className="h-8 w-auto"
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
              Testimonials
            </a>
            <Link to="/login">
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Link to="/login">
              <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
