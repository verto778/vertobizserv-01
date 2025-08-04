
import React, { useRef, useEffect } from 'react';
import { Users, Clock, BarChart3, Briefcase, CheckCircle, Shield } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02] border border-blue-100 h-full">
      <div className="bg-blue-50 p-3 rounded-lg inline-block mb-5">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-blue-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  // Animation refs
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe elements
    featureRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // Add ref to feature element
  const addFeatureRef = (el: HTMLDivElement | null) => {
    if (el && !featureRefs.current.includes(el)) {
      featureRefs.current.push(el);
    }
  };

  return (
    <section id="features" className="bg-white text-[#0a1a35] py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <div className="absolute w-full h-20 bg-gradient-to-b from-[#0f2752] to-transparent top-0 left-0"></div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent inline-block">
            Features Designed for Modern Recruiting
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to streamline your hiring process and make data-driven decisions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div ref={addFeatureRef} className="opacity-0">
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-[#2563eb]" />}
              title="AI Candidate Matching"
              description="Our AI algorithms match the best candidates to your job requirements, saving you hours of manual screening."
            />
          </div>
          <div ref={addFeatureRef} className="opacity-0">
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-[#2563eb]" />}
              title="Automated Scheduling"
              description="Eliminate scheduling conflicts with our automated interview scheduling system that syncs with everyone's calendars."
            />
          </div>
          <div ref={addFeatureRef} className="opacity-0">
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-[#2563eb]" />}
              title="Advanced Analytics"
              description="Gain insights into your recruitment process with comprehensive analytics and customizable reports."
            />
          </div>
          <div ref={addFeatureRef} className="opacity-0">
            <FeatureCard 
              icon={<Briefcase className="h-8 w-8 text-[#2563eb]" />}
              title="Branded Career Portal"
              description="Create a customized career portal that reflects your company's brand and values."
            />
          </div>
          <div ref={addFeatureRef} className="opacity-0">
            <FeatureCard 
              icon={<CheckCircle className="h-8 w-8 text-[#2563eb]" />}
              title="Collaborative Hiring"
              description="Enable your entire team to collaborate on hiring decisions with shared notes and evaluations."
            />
          </div>
          <div ref={addFeatureRef} className="opacity-0">
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-[#2563eb]" />}
              title="Compliance & Security"
              description="Stay compliant with hiring regulations and keep candidate data secure with our enterprise-grade security."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
