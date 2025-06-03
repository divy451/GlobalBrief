
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';

const AboutPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Briefly Global</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              Briefly Global is your premier destination for concise yet comprehensive news coverage from around the world. 
              Founded with the mission to deliver accurate, timely, and easily digestible news, we strive to keep our readers 
              informed without overwhelming them with unnecessary details.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p className="mb-6">
              In today's fast-paced world, staying informed shouldn't be a time-consuming task. At Briefly Global, we believe 
              that everyone deserves access to clear, concise, and accurate information. Our team of dedicated journalists and 
              editors works around the clock to bring you the most important stories from across the globe, presented in a format 
              that respects your time while providing the context you need.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Accuracy:</strong> We verify all information before publishing and promptly correct any errors.</li>
              <li><strong>Impartiality:</strong> We present facts without bias, giving you a balanced view of events.</li>
              <li><strong>Relevance:</strong> We focus on stories that matter, filtering out the noise.</li>
              <li><strong>Accessibility:</strong> We make complex topics understandable without oversimplification.</li>
              <li><strong>Timeliness:</strong> We deliver breaking news quickly without sacrificing accuracy.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Coverage</h2>
            <p className="mb-6">
              Briefly Global covers a wide range of topics including world politics, business, technology, science, health, 
              sports, and entertainment. Our specialized teams ensure expert coverage across all these categories, bringing 
              you insights that go beyond the headlines.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1 duration-300">
                <h3 className="font-bold text-xl mb-3 text-red-600">Our Reach</h3>
                <p>
                  With correspondents in major cities across six continents, Briefly Global provides truly international 
                  coverage with local insights. Our digital-first approach ensures that we can reach readers wherever they are.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1 duration-300">
                <h3 className="font-bold text-xl mb-3 text-red-600">Our Team</h3>
                <p>
                  Our diverse team of journalists, editors, fact-checkers, and multimedia specialists brings decades of 
                  combined experience in news reporting and digital publishing to deliver excellence in every story.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p className="mb-6">
              We value your feedback and are always looking to improve our coverage. If you have suggestions, corrections, 
              or news tips, please don't hesitate to reach out to us at <a href="mailto:contact@brieflyglobal.com" className="text-red-600 hover:underline">contact@brieflyglobal.com</a>.
            </p>
            
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="italic">
                "Delivering the world's stories, briefly but completely."
              </p>
            </div>
          </div>
          
          <div className="mt-10">
            <Link to="/" className="text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-colors">
              &larr; Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
