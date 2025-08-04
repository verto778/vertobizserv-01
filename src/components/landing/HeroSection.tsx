
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="flex-grow flex items-center relative overflow-hidden">
      <div className="absolute w-[800px] h-[800px] rounded-full bg-blue-500/10 -top-[400px] -right-[400px] blur-3xl"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-700/10 bottom-[0px] -left-[300px] blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-28 lg:py-32 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
              AI-Powered Recruitment Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-white">Transform Your</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent inline-block mt-2">Hiring Process</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-3xl">
              VertoHire helps you find the perfect candidates faster with AI-powered insights, 
              seamless interview scheduling, and comprehensive analytics.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/login">
                <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-6 text-lg w-full sm:w-auto group transition-all duration-300 animate-pulse">
                  Get Started Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative animate-fade-in delay-200">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-1 rounded-3xl backdrop-blur-xl border border-white/10 shadow-xl relative">
              <div className="bg-gradient-to-b from-[#0f2a53] to-[#1a3a67] rounded-3xl p-8 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-blue-300">VertoHire Dashboard</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Total Candidates</div>
                      <div className="text-lg font-bold">124</div>
                    </div>
                    <div className="mt-2 w-full bg-blue-900/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Interviews Scheduled</div>
                      <div className="text-lg font-bold">32</div>
                    </div>
                    <div className="mt-2 w-full bg-blue-900/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Offers Sent</div>
                      <div className="text-lg font-bold">14</div>
                    </div>
                    <div className="mt-2 w-full bg-blue-900/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
