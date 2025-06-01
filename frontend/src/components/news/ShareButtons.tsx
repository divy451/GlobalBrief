import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  
  const handleShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({
      title: "Shared!",
      description: `Article shared on ${platform}`,
    });
  };

  return (
    <div className="flex flex-wrap gap-2 my-4">
      <Button
        size="sm"
        className="px-4 py-2 bg-[#25D366] text-white rounded hover:bg-[#22c05a] transition-colors"
        onClick={() => 
          handleShare('WhatsApp', `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`)
        }
      >
        WhatsApp
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#1da1f2] text-white rounded hover:bg-[#1a91da] transition-colors"
        onClick={() => 
          handleShare('Twitter', `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)
        }
      >
        Twitter
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#0a66c2] text-white rounded hover:bg-[#0858a8] transition-colors"
        onClick={() => 
          handleShare('LinkedIn', `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`)
        }
      >
        LinkedIn
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#E1306C] text-white rounded hover:bg-[#c92b5f] transition-colors"
        onClick={() => 
          handleShare('Instagram', `https://www.instagram.com/?url=${encodedUrl}`)
        }
      >
        Instagram
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#1877f2] text-white rounded hover:bg-[#1566d8] transition-colors"
        onClick={() => 
          handleShare('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
        }
      >
        Facebook
      </Button>
    </div>
  );
};

export default ShareButtons;