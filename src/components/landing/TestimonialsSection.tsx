
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role }) => {
  return (
    <div className="bg-white rounded-xl p-8 transition-all duration-300 hover:shadow-lg border border-gray-100 relative h-full">
      <div className="absolute -top-4 -left-4 text-[#2563eb] bg-blue-50 p-2 rounded-full border-4 border-white">
        <CheckCircle className="h-6 w-6" />
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-semibold text-[#0a1a35]">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1a35]">Trusted by Industry Leaders</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Hear what our customers have to say about how VertoHire transformed their hiring process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="VertoHire has completely transformed our recruitment process. We're now able to find and hire top talent much faster with the AI matching feature."
            author="Sarah Johnson"
            role="HR Director, TechCorp"
          />
          <TestimonialCard 
            quote="The analytics provided by VertoHire have helped us identify bottlenecks in our hiring process and make data-driven decisions to improve our time-to-hire."
            author="Michael Chen"
            role="Recruitment Manager, Innovate Inc."
          />
          <TestimonialCard 
            quote="Easy to use and incredibly powerful. VertoHire has streamlined our entire candidate journey from application to onboarding, saving us countless hours."
            author="Amanda Rodriguez"
            role="Talent Acquisition, Global Solutions"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
