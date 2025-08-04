
import React from 'react';
import { Trophy, Zap, PieChart, Shield } from 'lucide-react';

interface StatCardProps {
  number: string;
  text: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatCardProps> = ({ number, text, icon }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/10">
      <div className="flex flex-col items-center">
        <div className="mb-4 bg-blue-900/50 p-3 rounded-lg">
          {icon}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{number}</div>
        <div className="text-sm text-blue-300">{text}</div>
      </div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-[#132f5e] to-[#0f2752] py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <div className="absolute w-[800px] h-[800px] rounded-full bg-blue-500/5 top-[0px] -right-[400px] blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatsCard 
            number="98%" 
            text="Client Satisfaction" 
            icon={<Trophy className="h-8 w-8 text-blue-400" />} 
          />
          <StatsCard 
            number="2.5x" 
            text="Hiring Efficiency" 
            icon={<Zap className="h-8 w-8 text-blue-400" />} 
          />
          <StatsCard 
            number="30%" 
            text="Cost Reduction" 
            icon={<PieChart className="h-8 w-8 text-blue-400" />} 
          />
          <StatsCard 
            number="1000+" 
            text="Companies Trust Us" 
            icon={<Shield className="h-8 w-8 text-blue-400" />} 
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
