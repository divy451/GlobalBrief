import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const PrivacyPolicy: React.FC = () => (
  <MainLayout>
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        At Briefly Global, we value your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you visit our website.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
      <p className="mb-4">
        We may collect personal information such as your name, email address, and browsing data when you interact with our site, including through comments, subscriptions, or analytics.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Use of Information</h2>
      <p className="mb-4">
        We use your information to improve our services, personalize content, and display relevant advertisements via partners like Google AdSense.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Third-Party Services</h2>
      <p className="mb-4">
        We use Google AdSense to serve ads. Google may use cookies and web beacons to collect non-personal information for ad personalization. Visit Google's <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-news-accent hover:underline">Ad Policies</a> for more details.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Cookies</h2>
      <p className="mb-4">
        Our site uses cookies to enhance your experience. You can manage cookie preferences through your browser settings.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p className="mb-4">
        For questions about this policy, contact us at <a href="mailto:privacy@briefly-global.com" className="text-news-accent hover:underline">privacy@briefly-global.com</a>.
      </p>
    </div>
  </MainLayout>
);

export default PrivacyPolicy;