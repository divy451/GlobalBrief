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
        variant="outline"
        size="sm"
        onClick={() => 
          handleShare('WhatsApp', `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => 
          handleShare('Twitter', `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => 
          handleShare('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => 
          handleShare('LinkedIn', `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`)
        }
      >
        <Share className="mr-1 h-4 w-4" />
        LinkedIn
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => 
          handleShare('Instagram', `https://www.instagram.com/?url=${encodedUrl}`) // Note: Instagram doesn't support direct sharing via URL, this opens Instagram with the URL
        }
      >
        <Share className="mr-1 h-4 w-4" />
        Instagram
      </Button>
      
      <Button
        variant="outline"
        size="sm"
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
    </div>
  );
};

export default ShareButtons;