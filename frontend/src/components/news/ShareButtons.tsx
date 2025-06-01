import React from 'react';
import { Share } from 'lucide-react';
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
        <Share className="mr-1 h-4 w-4" />
        WhatsApp
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#1da1f2] text-white rounded hover:bg-[#1a91da] transition-colors"
        onClick={() => 
          handleShare('Twitter', `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        Twitter
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#0a66c2] text-white rounded hover:bg-[#0858a8] transition-colors"
        onClick={() => 
          handleShare('LinkedIn', `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        LinkedIn
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#E1306C] text-white rounded hover:bg-[#c92b5f] transition-colors"
        onClick={() => 
          handleShare('Instagram', `https://www.instagram.com/?url=${encodedUrl}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        Instagram
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Copied!",
            description: "Link copied to clipboard",
          });
        }}
      >
        <Share className="mr-1 h-4 w-4" />
        Copy Link
      </Button>
      
      <Button
        size="sm"
        className="px-4 py-2 bg-[#1877f2] text-white rounded hover:bg-[#1566d8] transition-colors"
        onClick={() => 
          handleShare('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        Facebook
      </Button>
    </div>
  );
};

export default ShareButtons;