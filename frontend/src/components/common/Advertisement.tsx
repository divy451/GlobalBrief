import React, { useEffect } from 'react';

interface AdvertisementProps {
  type: 'banner' | 'square' | 'skyscraper';
  adSlot?: string;
  adClient?: string; // Add new prop for dynamic ad client
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, adSlot, adClient }) => {
  const getAdSize = () => {
    switch (type) {
      case 'banner':
        return 'h-24 md:h-32';
      case 'square':
        return 'h-60 md:h-72';
      case 'skyscraper':
        return 'h-96 md:h-[500px]';
      default:
        return 'h-24 md:h-32';
    }
  };

  useEffect(() => {
    if (adSlot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`Advertisement (${type}): AdSense ad initialized, slot: ${adSlot}`);
      } catch (error) {
        console.error(`Advertisement (${type}): AdSense ad error:`, error);
      }
    }
  }, [adSlot, type]);

  if (!adSlot) {
    // Fallback to placeholder if no adSlot provided
    return (
      <div className={`bg-news-light border border-dashed border-news-dark flex items-center justify-center w-full ${getAdSize()}`}>
        <div className="text-center">
          <p className="text-news-dark font-medium">Advertisement</p>
          <p className="text-xs text-gray-500">Your ad could be here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${getAdSize()}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient || "ca-pub-8618999712463527"} // Use adClient prop, default to original
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default Advertisement;