import React from 'react';
import { NavigateIcon, MapPinIcon, BegoniaIcon, ShareIcon } from './Icons';
import { GuideEntry, ContentBlock } from '../types';
import { getAssetUrl } from '../App';

interface PlaceCardProps {
  entry: GuideEntry;
  index: number;
  onClick?: (entry: GuideEntry) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ 
  entry, 
  index, 
  onClick,
}) => {
  // Use user-provided image with fallback
  const displayImage = getAssetUrl(entry.photoUrl || "/images/lg/coming_soon.png");

  // Helper to extract text summary
  const getSummary = (review: string | ContentBlock[]) => {
    let text = "";
    if (typeof review === 'string') {
        text = review;
    } else if (Array.isArray(review)) {
        // Find first text block
        const textBlock = review.find(b => b.type === 'text') as { type: 'text', content: string } | undefined;
        text = textBlock ? textBlock.content : "";
    }
    
    // Truncate to 30 characters as requested
    if (text.length > 30) {
        return text.substring(0, 30) + "...";
    }
    return text;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the details modal
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?tab=${entry.category}&id=${entry.id}`;
    const shareData = {
      title: `LIWEI GUIDE - ${entry.name}`,
      text: `推薦你看看這家餐廳：${entry.name}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('連結已複製到剪貼簿！');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div 
      className="flex flex-col w-full h-full bg-white rounded-none md:rounded-xl shadow-lg border-t-4 border-[#000053] overflow-hidden relative group/card cursor-pointer transform transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-[#C5A059] active:scale-[0.98] active:shadow-md"
      onClick={() => onClick && onClick(entry)}
    >
      
      {/* 
         Changed layout to strictly flex-col (vertical) to support Grid view better.
         Removed md:flex-row to ensure consistent "Card" shape in the 3-column grid.
      */}
      <div className="flex flex-col h-full">
        {/* Image Section - Fixed Height */}
        <div className="w-full h-48 relative bg-stone-200 shrink-0 group overflow-hidden">
          <img 
            src={displayImage} 
            referrerPolicy="no-referrer"
            alt={entry.name} 
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/card:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl("/images/lg/coming_soon.png");
            }}
          />
          {/* Guide Rating Badge - Begonia Icons */}
          <div className="absolute top-0 left-0 bg-[#000053]/90 backdrop-blur-sm text-white px-3 py-2 shadow-md z-10 rounded-br-lg">
             <div className="flex gap-1">
               {Array.from({ length: entry.guideRating }).map((_, i) => (
                 <BegoniaIcon key={i} className="w-5 h-5 text-white" />
               ))}
             </div>
          </div>
        </div>
        
        {/* Main Content Section */}
        <div className="flex-1 p-5 flex flex-col relative">
          
          {/* Header Info */}
          <div className="mb-3">
             <div className="flex flex-wrap items-baseline gap-2 mb-1">
               <h3 className="text-xl font-bold font-serif text-[#000053] tracking-wide transition-colors group-hover/card:text-[#000053] line-clamp-1">{entry.name}</h3>
             </div>

             <div className="flex items-center gap-2 mb-1">
               {(entry.country || entry.city) && (
                 <span className="text-xs font-medium text-stone-500 uppercase tracking-wider font-sans truncate">
                   {entry.country} {entry.city ? `· ${entry.city}` : ''}
                 </span>
               )}
             </div>

             {/* Sub-info: Cuisine & Address */}
             <div className="flex flex-col gap-1 text-sm text-stone-600 font-sans">
                {entry.cuisine && (
                  <span className="inline-flex items-center self-start px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-700 text-xs">
                    {entry.cuisine}
                  </span>
                )}
                {entry.address && (
                  <div className="flex items-center gap-1 opacity-80 truncate w-full">
                    <MapPinIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{entry.address}</span>
                  </div>
                )}
             </div>
          </div>

          {/* Guide Review Summary - Fixed min-height for consistency */}
          <div className="mb-4 relative flex-grow">
            <p className="text-stone-800 leading-relaxed text-sm font-serif italic border-l-2 border-[#000053] pl-3 transition-all duration-500 group-hover/card:border-[#C5A059] group-hover/card:text-stone-900 break-words">
               "{getSummary(entry.guideReview)}"
            </p>
          </div>

          {/* Metadata Footer - Pushed to bottom */}
          <div className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
             <div></div>
             
             <div className="flex items-center gap-3">
                 <button 
                    onClick={handleShare}
                    className="text-stone-400 hover:text-[#000053] transition-colors hover:scale-105 active:scale-95"
                    title="分享"
                 >
                     <ShareIcon className="w-4 h-4" />
                 </button>
                 <button className="text-xs font-bold text-stone-500 hover:text-[#000053] underline decoration-[#000053]/50 decoration-2 underline-offset-4 transition-all group-hover/card:text-[#000053] group-hover/card:decoration-[#C5A059] whitespace-nowrap">
                     閱讀更多
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;