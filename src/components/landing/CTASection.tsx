
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-[#0a1a35] to-[#132f5e] text-white py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <div className="absolute w-[800px] h-[800px] rounded-full bg-blue-500/10 top-[0px] -right-[400px] blur-3xl"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-700/10 bottom-[0px] -left-[300px] blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Hiring Process?</h2>
        <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
          Join thousands of companies that use VertoHire to streamline their recruitment and make better hiring decisions.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-6 text-lg w-full sm:w-auto transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
