import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GuideEntry, AppSettings, LinkItem, ContentBlock } from './types';
import { UtensilsIcon, XMarkIcon, PhotoIcon, SortIcon, MapPinIcon, Bars3Icon, GlobeIcon, BegoniaIcon, CalendarIcon, NavigateIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ShareIcon } from './components/Icons';
import PlaceCard from './components/PlaceCard';

// CONSTANTS & COLORS
const NAVY = '#000053'; // Navy Blue
const GOLD = '#C5A059'; // Champagne Gold

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) return <span className="text-stone-800">{text}</span>;
  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="text-[#C5A059] font-bold">{part}</span>
        ) : (
          <span key={i} className="text-stone-800">{part}</span>
        )
      )}
    </>
  );
};

export const getAssetUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  const baseUrl = import.meta.env.BASE_URL || "/";
  return baseUrl.endsWith("/") ? `${baseUrl}${cleanUrl}` : `${baseUrl}/${cleanUrl}`;
};

const getEntryReviewText = (entry: GuideEntry): string => {
  if (typeof entry.guideReview === 'string') {
      return entry.guideReview;
  }
  if (Array.isArray(entry.guideReview)) {
      return entry.guideReview
          .filter(block => block.type === 'text')
          .map(block => block.content)
          .join(' ');
  }
  return '';
};

const getEntryPhotos = (entry: GuideEntry): string[] => {
  const photos = entry.photos && entry.photos.length > 0 ? entry.photos : [entry.photoUrl];
  const validPhotos = photos.filter(p => p && p.trim() !== "");
  const result = validPhotos.length > 0 ? validPhotos : ["/images/lg/coming_soon.png"];
  return result.map(p => getAssetUrl(p));
};

// HARDCODED INITIAL DATA (User modifies code to update this)
const INITIAL_ENTRIES: GuideEntry[] = [
  {
      id: 1715423891001,
      name: "究醬石頭火鍋",
      mapLink: "https://share.google/z5ISzmCGutnermjJP",
      guideRating: 3,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/restaurant/jiojiang.jpg",
      photos: [
          "/images/restaurant/jiojiang.jpg"
      ],
      country: "臺灣",
      city: "宜蘭縣",
      address: "265宜蘭縣羅東鎮大同路42巷2號",
      cuisine: "火鍋",
      category: 'dining',
      timestamp: 1715423891001,
      updatedAt: 1767052800000 // 2025-12-30
  },
  {
      id: 1715423891002,
      name: "羅東紅豆湯圓",
      mapLink: "https://share.google/4zZl0C5e0LcN6TIqs",
      guideRating: 2,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/restaurant/lodongredbeantangyuan.jpg",
      photos: [
          "/images/restaurant/lodongredbeantangyuan.jpg"
      ],
      country: "臺灣",
      city: "宜蘭縣",
      address: "265宜蘭縣羅東鎮中山路三段180號",
      cuisine: "甜點",
      category: 'dining',
      timestamp: 1715423891002,
      updatedAt: 1767052800000 // 2025-12-30
  },
  {
      id: 1715423891003,
      name: "新平價牛排館",
      mapLink: "https://maps.app.goo.gl/QRWuC7j2aNopvJgy9",
      guideRating: 2,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/restaurant/shin_pin_jia_steak.jpg",
      photos: [
          "/images/restaurant/shin_pin_jia_steak.jpg"
      ],
      country: "臺灣",
      city: "宜蘭縣",
      address: "265宜蘭縣羅東鎮天津路8之7號",
      cuisine: "西式",
      category: 'dining',
      timestamp: 1715423891003,
      updatedAt: 1767052800000 // 2025-12-30
  },
  {
      id: 1715423891004,
      name: "阿伯烤地瓜",
      mapLink: "https://maps.app.goo.gl/rygpqvBmdv4ABaJ98",
      guideRating: 1,
      guideReview: [{ id: "1", type: "text", content: "充滿職人精神的烤地瓜，但是阿伯有點重聽要大聲一點。" }],
      photoUrl: "/images/restaurant/uncle_roasts_sweet_potatoes.webp",
      country: "臺灣",
      city: "新北市",
      address: "234新北市永和區環河西路一段95巷4弄7號",
      cuisine: "甜點",
      category: 'dining',
      timestamp: 1715423891004,
      updatedAt: 1767052800000
  },
  {
      id: 1715423891005,
      name: "埃及沙威瑪王",
      mapLink: "https://maps.app.goo.gl/2BFsQhfVGHfqgHVUA",
      guideRating: 1,
      guideReview: [{ id: "1", type: "text", content: "意外的好吃，看起來沒有特別衛生，不過製作過程蠻乾淨的。雞肉風味佳，相較起來偏鹹，不過整體是好吃的。麵包鬆軟，生菜新鮮。" }],
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxGlC-2pQTebdiaYhTr7V5EwyxvSA1y0p-DsYIUHEYwl29zAc6fD0h-W07OPm-WeXN9PAE69ERMF86P-ccOsBC6bZ-OmWNICdvDROpAtBPyoGc_4J6sKYqE_cHUyPO_pTOUpTONbVCVHCi5=s1360-w1360-h1020-rw",
      country: "臺灣",
      city: "台北市",
      address: "106臺北市大安區羅斯福路三段325號",
      cuisine: "小吃",
      category: 'dining',
      timestamp: 1715423891005,
      updatedAt: 1767052800000
  },
  {
      id: 1715423891006,
      name: "淺草牛光",
      mapLink: "https://maps.app.goo.gl/ocBos46Rjd2UUj6n8",
      guideRating: 2,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "https://lh3.googleusercontent.com/p/AF1QipNvtX-cjv8eAQOoESoYoIz92XPFqecWIUKizl8-=w900-h482-p-k-no",
      country: "日本",
      city: "東京",
      address: "日本〒111-0033 Tokyo, Taito City, Hanakawado, 1 Chome−2−8 コーポ 101",
      cuisine: "日式",
      category: 'dining',
      timestamp: 1715423891006,
      updatedAt: 1767052800000
  },
  {
      id: 1715423891007,
      name: "Brulee Merize Tokyo Gift Palette Store ブリュレメリゼ 東京ギフトパレット店",
      mapLink: "https://maps.app.goo.gl/cinWo6iukH6PgJtU9",
      guideRating: 3,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "日本",
      city: "東京",
      address: "日本〒100-0005 Tokyo, Chiyoda City, Marunouchi, 1 Chome−9−1 JR Tokyo Station, Yaesu North Exit 「東京ギフトパレット」 内",
      cuisine: "甜點",
      category: 'dining',
      timestamp: 1715423891007,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891008,
      name: "喫茶店に恋して。東京駅グランスタ店",
      mapLink: "https://maps.app.goo.gl/jqgCXDoMf8pbKQo57",
      guideRating: 2,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "日本",
      city: "東京",
      address: "日本〒100-0005 Tokyo, Chiyoda City, Marunouchi, 1 Chome−9−1 JR Tokyo Station, 改札内 B1F 八重洲地下中央口 グランスタ内 銀の鈴エリア エレベーター前",
      cuisine: "甜點",
      category: 'dining',
      timestamp: 1715423891008,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891009,
      name: "各地鐵路便當 “祭”駅弁屋 駅弁屋 祭 グランスタ東京",
      mapLink: "https://maps.app.goo.gl/9dCivzdmcFc2djk1A",
      guideRating: 1,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "日本",
      city: "東京",
      address: "JR Tokyo Station, 構内, 1 Chome-9-1 Marunouchi, Chiyoda City, Tokyo 100-0005日本",
      cuisine: "日式",
      category: 'dining',
      timestamp: 1715423891009,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891010,
      name: "Riziere",
      mapLink: "https://maps.app.goo.gl/ofSMngugAcbPtbVJ7",
      guideRating: 2,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "日本",
      city: "京都",
      address: "日本〒605-0847 Kyoto, Higashiyama Ward, Higashihashizumecho, 23番",
      cuisine: "甜點",
      category: 'dining',
      timestamp: 1715423891010,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891011,
      name: "Brulee Kyoto 烏丸五条店",
      mapLink: "https://maps.app.goo.gl/rX294PEMZLqHa4xs7",
      guideRating: 1,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "日本",
      city: "京都",
      address: "397-2 Osakacho, Shimogyo Ward, Kyoto, 600-8177日本",
      cuisine: "甜點",
      category: 'dining',
      timestamp: 1715423891011,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891012,
      name: "碧華樓",
      mapLink: "https://maps.app.goo.gl/vLr5T1KQgZ92vU9B7",
      guideRating: 1,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "馬來西亞",
      city: "吉隆坡",
      address: "No134, Jalan Petaling, City Centre, 50000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, 馬來西亞",
      cuisine: "中式",
      category: 'dining',
      timestamp: 1715423891012,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891013,
      name: "Spaghetti Factory Central World",
      mapLink: "https://maps.app.goo.gl/khjKg7JWBbwQ3pwt8",
      guideRating: 1,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "泰國",
      city: "曼谷",
      address: "999/9 ศูนย์การค้าเซ็นทรัลเวิลด์ ชั้น 6 แขวงปทุมวัน Pathum Wan, Bangkok 10330泰國",
      cuisine: "西式",
      category: 'dining',
      timestamp: 1715423891013,
      updatedAt: 1781822400000
  },
  {
      id: 1715423891014,
      name: "Warung Soto Lamongan Kuala Lumpur",
      mapLink: "https://maps.app.goo.gl/wr24uTVwKB5PR1Mu5",
      guideRating: 2,
      guideReview: [{ id: "1", type: "text", content: "暫無評論" }],
      photoUrl: "/images/lg/coming_soon.png",
      photos: ["/images/lg/coming_soon.png"],
      country: "馬來西亞",
      city: "吉隆坡",
      address: "30-3, Jalan Raja Alang Chow Kit, Kampung Baru, 50300 Kuala Lumpur, 馬來西亞",
      cuisine: "印尼料理",
      category: 'dining',
      timestamp: 1715423891014,
      updatedAt: 1781822400000
  }
];

// Carousel Slides Configuration
// Updated structure to split subtitle and title
const DINING_SLIDES = [
    { 
        image: "/images/restaurant/jiojiang.jpg", 
        entryId: 1715423891001, 
        subtitle: "當月傑出餐廳",
        title: "究醬石頭火鍋" 
    },
    { 
        image: "/images/restaurant/lodongredbeantangyuan.jpg", 
        entryId: 1715423891002, 
        subtitle: "當月傑出餐廳",
        title: "羅東紅豆湯圓" 
    },
    { 
        image: "/images/restaurant/shin_pin_jia_steak.jpg", 
        entryId: 1715423891003, 
        subtitle: "當月傑出餐廳",
        title: "新平價牛排館" 
    },
    { 
        image: "/images/restaurant/uncle_roasts_sweet_potatoes.webp", 
        entryId: 1715423891004, 
        subtitle: "當月傑出餐廳",
        title: "阿伯烤地瓜" 
    },
    { 
        image: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxGlC-2pQTebdiaYhTr7V5EwyxvSA1y0p-DsYIUHEYwl29zAc6fD0h-W07OPm-WeXN9PAE69ERMF86P-ccOsBC6bZ-OmWNICdvDROpAtBPyoGc_4J6sKYqE_cHUyPO_pTOUpTONbVCVHCi5=s1360-w1360-h1020-rw", 
        entryId: 1715423891005, 
        subtitle: "當月傑出餐廳",
        title: "埃及沙威瑪王" 
    }
];

// 2. Travel Slides
const TRAVEL_SLIDES = [
    { image: "https://picsum.photos/id/1036/1600/900", entryId: 0, subtitle: "探索秘境", title: "山林之旅" },
    { image: "https://picsum.photos/id/1015/1600/900", entryId: 0, subtitle: "推薦行程", title: "海岸線的呼喚" },
    { image: "https://picsum.photos/id/1040/1600/900", entryId: 0, subtitle: "深度旅遊", title: "古堡巡禮" },
    { image: "https://picsum.photos/id/1039/1600/900", entryId: 0, subtitle: "城市漫遊", title: "城市漫遊" },
    { image: "https://picsum.photos/id/1038/1600/900", entryId: 0, subtitle: "極地探險", title: "極地探險" },
];

// 3. Story Slides
const STORY_SLIDES = [
    { image: "https://picsum.photos/id/1069/1600/900", entryId: 0, subtitle: "味覺記憶", title: "關於味覺的記憶" },
    { image: "https://picsum.photos/id/1062/1600/900", entryId: 0, subtitle: "生活隨筆", title: "那些年我們一起去的餐廳" },
    { image: "https://picsum.photos/id/1059/1600/900", entryId: 0, subtitle: "獨家食譜", title: "廚房裡的秘密" },
    { image: "https://picsum.photos/id/1050/1600/900", entryId: 0, subtitle: "深夜食堂", title: "深夜食堂" },
    { image: "https://picsum.photos/id/1049/1600/900", entryId: 0, subtitle: "咖啡與書", title: "咖啡與書" },
];

const INITIAL_SETTINGS: AppSettings = {
    coverImageUrl: '',
    aboutCoverImageUrl: 'https://duk.tw/WPB8QC.jpg',
    aboutContent: [
        { 
            id: '1', 
            type: 'text', 
            content: '歡迎來到LIWEI GUIDE，這是一個源於趣味、集成經典的私人品味空間。\n\n源於紀錄美好生活，在走訪各地的過程中，蒐羅了無數的美食足跡，因而決定將這些珍貴的收藏匯集成冊，打造出這座屬於自己的美食指南。沉穩的海軍藍與純淨白，象徵著如同航海指南般的指引與專業，引領每一位饕客穿梭於我的嚴選餐廳名單中。\n\n除了舌尖上的記憶，這裡也同步記載著旅遊故事與生活網誌，透過文字與影像，將那些旅途中的感觸具象呈現。\n\n這不只是一份推薦清單，更是一份對生活的分享，誠摯邀請您一同探索世界各個角落的動人滋味。' 
        }
    ],
    socialLinks: [
        { id: 2, label: 'Google Maps', url: 'https://maps.app.goo.gl/HFUoXgzjCadJJaSo9' }
    ]
};

const App: React.FC = () => {
  // App State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'dining' | 'travel' | 'story' | 'about'>('home');
  const [guideEntries] = useState<GuideEntry[]>(INITIAL_ENTRIES);
  const [appSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Filter & Search State
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Rotating Placeholder State
  const [searchPlaceholderWord, setSearchPlaceholderWord] = useState("佳餚");
  const [fadeClass, setFadeClass] = useState("opacity-100 scale-100");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
      const words = ["佳餚", "旅行", "網誌"];
      let index = 0;
      const interval = setInterval(() => {
          setFadeClass("opacity-0 scale-95");
          setTimeout(() => {
              index = (index + 1) % words.length;
              setSearchPlaceholderWord(words[index]);
              setFadeClass("opacity-100 scale-100");
          }, 300);
      }, 2500);
      return () => clearInterval(interval);
  }, []);

  // Detail Modal State (View Restaurant)
  const [viewingEntry, setViewingEntry] = useState<GuideEntry | null>(null);
  
  // Multi-photo slider in details modal
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(0);

  // Refs for Scrolling
  const mainContentRef = useRef<HTMLDivElement>(null);
  const diningScrollRef = useRef<HTMLDivElement>(null);
  const travelScrollRef = useRef<HTMLDivElement>(null);
  const storyScrollRef = useRef<HTMLDivElement>(null);

  // Ref for Triple Click Logic
  const headerClickRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  // Swipe logic states for Carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Search Suggestions State & Refs
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync outside click to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keydown listener for Lightbox Modal (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!lightboxOpen || !viewingEntry) return;
    const currentPhotos = viewingEntry.photos && viewingEntry.photos.length > 0 ? viewingEntry.photos : [viewingEntry.photoUrl];
    if (currentPhotos.length <= 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setLightboxOpen(false);
        } else if (event.key === "ArrowRight") {
            setLightboxPhotoIndex(prev => (prev + 1) % currentPhotos.length);
        } else if (event.key === "ArrowLeft") {
            setLightboxPhotoIndex(prev => (prev - 1 + currentPhotos.length) % currentPhotos.length);
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, viewingEntry]);

  // Compute all matching suggestions across dining, travel, and story pages
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const suggestions: {
        entry: GuideEntry;
        matchField: 'name' | 'cuisine' | 'address' | 'review';
        matchLabel: string;
        matchValue: string;
    }[] = [];

    for (const entry of guideEntries) {
        // 1. Check title/name
        if (entry.name && entry.name.toLowerCase().includes(query)) {
            suggestions.push({
                entry,
                matchField: 'name',
                matchLabel: '名稱',
                matchValue: entry.name
            });
            continue;
        }

        // 2. Check cuisine
        if (entry.cuisine && entry.cuisine.toLowerCase().includes(query)) {
            suggestions.push({
                entry,
                matchField: 'cuisine',
                matchLabel: '料理',
                matchValue: entry.cuisine
            });
            continue;
        }

        // 3. Check city, country, or address
        const cityMatch = entry.city && entry.city.toLowerCase().includes(query);
        const addressMatch = entry.address && entry.address.toLowerCase().includes(query);
        if (cityMatch || addressMatch) {
            suggestions.push({
                entry,
                matchField: 'address',
                matchLabel: '地址與地區',
                matchValue: entry.address || entry.city || ''
            });
            continue;
        }

        // 4. Check review
        const reviewText = getEntryReviewText(entry);
        if (reviewText && reviewText.toLowerCase().includes(query)) {
            const index = reviewText.toLowerCase().indexOf(query);
            const start = Math.max(0, index - 15);
            const end = Math.min(reviewText.length, index + query.length + 15);
            const snippet = (start > 0 ? "..." : "") + reviewText.slice(start, end).replace(/\s+/g, ' ') + (end < reviewText.length ? "..." : "");
            suggestions.push({
                entry,
                matchField: 'review',
                matchLabel: '詳細內文',
                matchValue: snippet
            });
            continue;
        }
    }

    return suggestions;
  }, [searchQuery, guideEntries]);

  const handleSelectSuggestion = (entry: GuideEntry) => {
    setSearchQuery("");
    setShowSuggestions(false);
    handleTabChange(entry.category);
    setTimeout(() => {
      openEntry(entry);
    }, 100);
  };

  // Sync state with URL history (Browser Back/Next Button)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const id = params.get('id');

        // Sync Tab
        if (tab && ['home', 'dining', 'travel', 'story', 'about'].includes(tab)) {
            setActiveTab(tab as any);
        } else {
            setActiveTab('home'); // Default
        }

        // Sync Entry (Modal)
        if (id) {
            const entry = guideEntries.find(e => e.id.toString() === id);
            if (entry) setViewingEntry(entry);
        } else {
            setViewingEntry(null);
        }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial load handling
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const id = params.get('id');
    if (tab && ['home', 'dining', 'travel', 'story', 'about'].includes(tab)) {
        setActiveTab(tab as any);
    }
    if (id) {
        const entry = guideEntries.find(e => e.id.toString() === id);
        if (entry) setViewingEntry(entry);
    }

    // 3 Second Loading Screen
    const timer = setTimeout(() => {
        setLoading(false);
    }, 3000);

    return () => {
        window.removeEventListener('popstate', handlePopState);
        clearTimeout(timer);
    };
  }, [guideEntries]);

  // Scroll to top when activeTab changes
  useEffect(() => {
      if (mainContentRef.current) {
          mainContentRef.current.scrollTo(0, 0);
      }
  }, [activeTab]);

  // Generate Random Luxury Background for Home
  const heroBackgroundStyle = useMemo(() => {
    const x = Math.floor(Math.random() * 40) + 30; 
    const y = Math.floor(Math.random() * 40) + 30;
    return {
        background: `radial-gradient(circle at ${x}% ${y}%, #1a1a6e 0%, ${NAVY} 70%, #000020 100%)`,
        backgroundImage: `radial-gradient(circle at ${x}% ${y}%, #1a1a6e 0%, ${NAVY} 70%, #000020 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'normal'
    };
  }, []);

  const currentSlides = useMemo(() => {
      switch (activeTab) {
          case 'travel': return TRAVEL_SLIDES;
          case 'story': return STORY_SLIDES;
          default: return DINING_SLIDES;
      }
  }, [activeTab]);

  const getSlideImage = (slide: { image: string, entryId?: number }) => {
      if (slide.entryId) {
          const found = guideEntries.find(e => e.id === slide.entryId);
          if (found) {
              const photos = getEntryPhotos(found);
              if (photos && photos.length > 0 && photos[0] && photos[0] !== getAssetUrl("/images/lg/coming_soon.png")) {
                  return photos[0];
              }
              return getAssetUrl("/images/lg/coming_soon.png");
          }
      }
      return getAssetUrl(slide.image || "/images/lg/coming_soon.png");
  };

  // Reset Carousel Index when tab changes
  useEffect(() => {
      setCarouselIndex(0);
  }, [activeTab]);

  // Carousel Auto-Slide
  useEffect(() => {
      if (!['dining', 'travel', 'story'].includes(activeTab)) return;
      const interval = setInterval(() => {
          setCarouselIndex(prev => (prev + 1) % currentSlides.length);
      }, 5000);
      return () => clearInterval(interval);
  }, [activeTab, currentSlides]);

  const handleHeaderIconClick = () => {
      if (activeTab !== 'dining') return;
      const now = Date.now();
      const timeDiff = now - headerClickRef.current.lastTime;
      if (timeDiff > 500) {
          headerClickRef.current.count = 1;
      } else {
          headerClickRef.current.count += 1;
      }
      headerClickRef.current.lastTime = now;
      if (headerClickRef.current.count === 3) {
          const diningEntries = guideEntries.filter(e => e.category === 'dining');
          if (diningEntries.length > 0) {
              const randomIndex = Math.floor(Math.random() * diningEntries.length);
              openEntry(diningEntries[randomIndex]);
          }
          headerClickRef.current.count = 0;
      }
  };

  // Navigation Wrappers using pushState for history support
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
    resetFilters();
    
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    url.searchParams.delete('id'); // Close entry if switching tabs
    window.history.pushState({}, '', url.toString());
  };

  const openEntry = (entry: GuideEntry) => {
      setViewingEntry(entry);
      setActivePhotoIndex(0);
      setLightboxOpen(false);
      const url = new URL(window.location.href);
      url.searchParams.set('id', entry.id.toString());
      // Ensure tab param persists
      if (!url.searchParams.has('tab')) {
          url.searchParams.set('tab', activeTab);
      }
      window.history.pushState({}, '', url.toString());
  };

  const closeEntry = () => {
      setViewingEntry(null);
      setActivePhotoIndex(0);
      setLightboxOpen(false);
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
  };

  // Carousel Manual Controls
  const nextSlide = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCarouselIndex(prev => (prev + 1) % currentSlides.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCarouselIndex(prev => (prev - 1 + currentSlides.length) % currentSlides.length);
  };

  const goToSlide = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setCarouselIndex(index);
  };

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      
      const distance = touchStartX.current - touchEndX.current;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
          // Swiped Left -> Next Slide
          setCarouselIndex(prev => (prev + 1) % currentSlides.length);
      } else if (isRightSwipe) {
           // Swiped Right -> Prev Slide
          setCarouselIndex(prev => (prev - 1 + currentSlides.length) % currentSlides.length);
      }

      // Reset
      touchStartX.current = null;
      touchEndX.current = null;
  };

  const handleCarouselClick = () => {
      const slide = currentSlides[carouselIndex];
      const entry = guideEntries.find(e => e.id === slide.entryId);
      if (entry) {
          openEntry(entry);
      } else if (slide.entryId !== 0) {
          alert("此資料尚未建立");
      }
  };

  const resetFilters = () => {
      setFilterCountry('all');
      setFilterCity('all');
      setFilterCuisine('all');
      setSearchQuery("");
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
      if (ref.current) {
          const scrollAmount = ref.current.clientWidth * 0.8;
          ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
  };

  const renderContentBlocks = (review: string | ContentBlock[]) => {
      if (typeof review === 'string') {
          return <p className="text-stone-800 leading-relaxed font-serif whitespace-pre-wrap text-lg">{review}</p>;
      }
      if (!review || review.length === 0) {
          return <p className="text-stone-400 italic">尚無內容...</p>;
      }
      return (
          <div className="space-y-6">
              {review.map((block) => {
                  if (block.type === 'text') {
                      return <p key={block.id} className="text-stone-800 leading-relaxed font-serif whitespace-pre-wrap text-lg">{block.content}</p>;
                  } else {
                      return (
                          <figure key={block.id} className="my-6">
                              <img 
                                  src={getAssetUrl(block.url || "/images/lg/coming_soon.png")} 
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                      (e.target as HTMLImageElement).src = getAssetUrl("/images/lg/coming_soon.png");
                                  }} 
                                  alt={block.caption || 'Image'} 
                                  className="w-full rounded-lg shadow-md" 
                              />
                              {block.caption && <figcaption className="text-center text-sm text-stone-500 mt-2 italic">{block.caption}</figcaption>}
                          </figure>
                      );
                  }
              })}
          </div>
      );
  };

  // Helper sort function for home page sections: Newest first
  const sortNewest = (a: GuideEntry, b: GuideEntry) => {
      const timeA = a.updatedAt || a.timestamp;
      const timeB = b.updatedAt || b.timestamp;
      
      // If times are different, sort by time desc
      if (timeA !== timeB) return timeB - timeA;
      
      // Fallback to ID (Creation order) desc if times are equal
      return b.id - a.id;
  };

  // 1. Isolate entries based on the active tab first (This ensures filters only show relevant data)
  const currentTabEntries = useMemo(() => {
      switch (activeTab) {
          case 'dining': return guideEntries.filter(e => e.category === 'dining');
          case 'travel': return guideEntries.filter(e => e.category === 'travel');
          case 'story': return guideEntries.filter(e => e.category === 'story');
          default: return [];
      }
  }, [activeTab, guideEntries]);

  // 2. Derive unique filter options dynamically to prevent invalid combinations/empty options
  const uniqueCountries = useMemo(() => {
    let entries = currentTabEntries;
    if (filterCity !== 'all') {
      entries = entries.filter(e => e.city === filterCity);
    }
    return Array.from(new Set(entries.map(e => e.country).filter(Boolean))) as string[];
  }, [currentTabEntries, filterCity]);

  const uniqueCities = useMemo(() => {
    let entries = currentTabEntries;
    if (filterCountry !== 'all') {
      entries = entries.filter(e => e.country === filterCountry);
    }
    return Array.from(new Set(entries.map(e => e.city).filter(Boolean))) as string[];
  }, [currentTabEntries, filterCountry]);

  const uniqueCuisines = useMemo(() => {
    let entries = currentTabEntries;
    if (filterCountry !== 'all') {
      entries = entries.filter(e => e.country === filterCountry);
    }
    if (filterCity !== 'all') {
      entries = entries.filter(e => e.city === filterCity);
    }
    return Array.from(new Set(entries.map(e => e.cuisine).filter(Boolean))) as string[];
  }, [currentTabEntries, filterCountry, filterCity]);

  // Validate and auto-reset selected filters if they become invalid for the current selections
  useEffect(() => {
    if (filterCountry !== 'all' && !uniqueCountries.includes(filterCountry)) {
      setFilterCountry('all');
    }
  }, [uniqueCountries, filterCountry]);

  useEffect(() => {
    if (filterCity !== 'all' && !uniqueCities.includes(filterCity)) {
      setFilterCity('all');
    }
  }, [uniqueCities, filterCity]);

  useEffect(() => {
    if (filterCuisine !== 'all' && !uniqueCuisines.includes(filterCuisine)) {
      setFilterCuisine('all');
    }
  }, [uniqueCuisines, filterCuisine]);

  // 3. Apply user filters to the isolated entries
  const processedEntries = useMemo(() => {
    let result = [...currentTabEntries];

    if (filterCountry !== 'all') result = result.filter(e => e.country === filterCountry);
    if (filterCity !== 'all') result = result.filter(e => e.city === filterCity);
    if (filterCuisine !== 'all') result = result.filter(e => e.cuisine === filterCuisine);

    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(e => {
            const name = (e.name || "").toLowerCase();
            const address = (e.address || "").toLowerCase();
            return name.includes(query) || address.includes(query);
        });
    }

    // UPDATED: Default Sort by Date (Newest first if desc)
    result.sort((a, b) => {
        const timeA = a.updatedAt || a.timestamp;
        const timeB = b.updatedAt || b.timestamp;
        
        // Primary Sort: Date
        if (timeA !== timeB) {
             return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
        
        // Secondary Sort: ID (Creation order) for deterministic sort
        return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
    });
    return result;
  }, [currentTabEntries, sortOrder, filterCountry, filterCity, filterCuisine, searchQuery]);

  const toggleSort = () => {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }

  // UPDATED: Apply sorting to Home Page data sources
  const diningEntries = useMemo(() => guideEntries.filter(e => e.category === 'dining').sort(sortNewest), [guideEntries]);
  const travelEntries = useMemo(() => guideEntries.filter(e => e.category === 'travel').sort(sortNewest), [guideEntries]);
  const storyEntries = useMemo(() => guideEntries.filter(e => e.category === 'story').sort(sortNewest), [guideEntries]);

  // Unified homepage search results across all categories
  const homeSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return guideEntries.filter(entry => {
        const nameMatch = entry.name && entry.name.toLowerCase().includes(query);
        const cuisineMatch = entry.cuisine && entry.cuisine.toLowerCase().includes(query);
        const locationMatch = [entry.country, entry.city, entry.address].filter(Boolean).join(' ').toLowerCase().includes(query);
        const reviewMatch = getEntryReviewText(entry).toLowerCase().includes(query);
        return nameMatch || cuisineMatch || locationMatch || reviewMatch;
    }).sort(sortNewest);
  }, [searchQuery, guideEntries]);

  const Footer = () => (
      <div className="py-12 text-center border-t border-stone-200 mt-auto bg-[#f4f4f4]">
          <p className="font-serif text-[#000053] font-bold text-lg">LIWEI GUIDE</p>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">EST. 2005</p>
      </div>
  );

  const handleShareEntry = async (entry: GuideEntry) => {
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

  if (loading) {
      return (
          <div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white"
            style={{
                background: `radial-gradient(circle at center, #1a1a6e 0%, ${NAVY} 100%)`,
                backgroundImage: `radial-gradient(circle at center, #1a1a6e 0%, ${NAVY} 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
            }}
          >
              <h1 className="text-4xl md:text-5xl font-bold font-serif mb-8 tracking-widest animate-pulse text-shadow-lg">LIWEI GUIDE</h1>
              <div className="animate-spin duration-[3000ms]">
                  <BegoniaIcon className="w-16 h-16 text-white drop-shadow-md" />
              </div>
          </div>
      );
  }

  const entryPhotos = viewingEntry ? getEntryPhotos(viewingEntry) : [];

  const handleNextPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (entryPhotos.length > 0) {
          setActivePhotoIndex(prev => (prev + 1) % entryPhotos.length);
      }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (entryPhotos.length > 0) {
          setActivePhotoIndex(prev => (prev - 1 + entryPhotos.length) % entryPhotos.length);
      }
  };

  const handleNextLightboxPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (entryPhotos.length > 0) {
          setLightboxPhotoIndex(prev => (prev + 1) % entryPhotos.length);
      }
  };

  const handlePrevLightboxPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (entryPhotos.length > 0) {
          setLightboxPhotoIndex(prev => (prev - 1 + entryPhotos.length) % entryPhotos.length);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f8f6] font-serif overflow-hidden relative">
      <div className="bg-noise" />
      
      <div 
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[90] transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-6 flex justify-between items-center border-b border-stone-100">
            <h2 className="text-xl font-bold text-[#000053]">LIWEI GUIDE</h2>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-transform active:scale-95">
                <XMarkIcon className="w-6 h-6 text-stone-500" />
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
                <div onClick={() => handleTabChange('home')} className="cursor-pointer group hover:bg-stone-50 rounded-lg p-2 -mx-2 transition-all active:scale-95 duration-200">
                    <h3 className="text-lg font-bold text-stone-800 flex items-center gap-3 group-hover:text-[#000053] transition-colors"><BegoniaIcon className="w-5 h-5 text-[#000053] transition-colors group-hover:text-[#C5A059]" />首頁</h3>
                </div>
                 <div onClick={() => handleTabChange('dining')} className="cursor-pointer group hover:bg-stone-50 rounded-lg p-2 -mx-2 transition-all active:scale-95 duration-200">
                    <h3 className="text-lg font-bold text-stone-800 flex items-center gap-3 group-hover:text-[#000053] transition-colors"><BegoniaIcon className="w-5 h-5 text-[#000053] transition-colors group-hover:text-[#C5A059]" />佳餚</h3>
                </div>
                <div onClick={() => handleTabChange('travel')} className="cursor-pointer group hover:bg-stone-50 rounded-lg p-2 -mx-2 transition-all active:scale-95 duration-200">
                    <h3 className="text-lg font-bold text-stone-800 flex items-center gap-3 group-hover:text-[#000053] transition-colors"><BegoniaIcon className="w-5 h-5 text-[#000053] transition-colors group-hover:text-[#C5A059]" />旅行</h3>
                </div>
                <div onClick={() => handleTabChange('story')} className="cursor-pointer group hover:bg-stone-50 rounded-lg p-2 -mx-2 transition-all active:scale-95 duration-200">
                    <h3 className="text-lg font-bold text-stone-800 flex items-center gap-3 group-hover:text-[#000053] transition-colors"><BegoniaIcon className="w-5 h-5 text-[#000053] transition-colors group-hover:text-[#C5A059]" />網誌</h3>
                </div>
                <div onClick={() => handleTabChange('about')} className="cursor-pointer group hover:bg-stone-50 rounded-lg p-2 -mx-2 transition-all active:scale-95 duration-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-3 group-hover:text-[#000053] transition-colors"><BegoniaIcon className="w-5 h-5 text-[#000053] transition-colors group-hover:text-[#C5A059]" />關於</h3>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-3"><BegoniaIcon className="w-5 h-5 text-[#000053]" />連結</h3>
                    <div className="space-y-3 pl-2">
                        {appSettings.socialLinks && appSettings.socialLinks.length > 0 ? (
                            appSettings.socialLinks.map((link) => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-all group active:scale-95">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-[#000053] transition-all duration-200 group-hover:text-[#C5A059] group-hover:scale-110"><GlobeIcon className="w-4 h-4" /></div>
                                    <span className="text-stone-700 font-medium group-hover:text-[#000053]">{link.label}</span>
                                </a>
                            ))
                        ) : (<p className="text-stone-400 text-sm italic">暫無連結</p>)}
                    </div>
                </div>
            </div>
         </div>
      </div>

      <header className={`bg-[${NAVY}] text-white shadow-lg sticky top-0 z-30 transition-colors duration-300`}>
        <div className="px-4 h-16 flex items-center justify-between">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-transform active:scale-90 duration-200">
                <Bars3Icon className="w-6 h-6" />
            </button>
            <button onClick={() => handleTabChange('home')} className="flex flex-col items-center select-none transition-transform active:scale-95 duration-200">
                 <h1 className="text-xl md:text-2xl font-bold font-serif tracking-wide leading-none text-white">LIWEI GUIDE</h1>
            </button>
            <button onClick={handleHeaderIconClick} className="p-2 hover:scale-110 active:scale-90 transition-transform duration-200">
                <BegoniaIcon className="w-6 h-6 text-white" />
            </button>
        </div>
      </header>

      <main ref={mainContentRef} className="flex-1 overflow-y-auto w-full h-full relative scroll-smooth z-0">
        
        {activeTab === 'home' && (
            <div key="home" className="animate-fade-in-up flex flex-col min-h-full">
                <div className="relative w-full h-[85vh] overflow-hidden flex flex-col justify-center" style={heroBackgroundStyle}>
                     <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
                     <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-center items-start">
                         <div className="mb-8"><h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-2 tracking-widest animate-title-reveal text-shadow-lg text-left">LIWEI GUIDE</h2></div>
                         <div ref={searchContainerRef} className="w-full max-w-sm animate-subtitle-reveal relative">
                             <div className="relative">
                                 <input 
                                     type="text" 
                                     placeholder="" 
                                     className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-white/50 border border-white/20 focus:outline-none focus:bg-white/20 focus:border-white/40 shadow-xl transition-all font-sans" 
                                     value={searchQuery} 
                                     onChange={(e) => {
                                         setSearchQuery(e.target.value);
                                         setShowSuggestions(true);
                                     }} 
                                     onFocus={() => {
                                          setIsSearchFocused(true);
                                          setShowSuggestions(true);
                                      }}
                                      onBlur={() => {
                                          setIsSearchFocused(false);
                                      }}
                                     onKeyDown={(e) => { 
                                         if (e.key === 'Enter') { 
                                             setShowSuggestions(false);
                                         } 
                                     }} 
                                 />
                                 <MagnifyingGlassIcon className="w-6 h-6 text-white/70 absolute left-4 top-1/2 -translate-y-1/2" />
                                  {!searchQuery && !isSearchFocused && (
                                      <div className="absolute left-12 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none flex items-center font-sans select-none tracking-wide text-sm">
                                          <span>搜尋</span>
                                          <span className={`inline-block ml-1 transition-all duration-300 transform ${fadeClass} text-[#C5A059] font-medium`}>
                                              {searchPlaceholderWord}
                                          </span>
                                      </div>
                                  )}
                             </div>

                             {/* Suggestions Panel */}
                             {showSuggestions && searchQuery.trim() && (
                                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-[100] animate-fade-in-up max-h-80 overflow-y-auto">
                                     {searchSuggestions.length > 0 ? (
                                         <div className="py-2 text-[#242424]">
                                             <div className="px-4 py-2 text-[10px] text-stone-400 font-sans border-b border-stone-100 bg-stone-50 flex justify-between items-center select-none">
                                                 <span className="uppercase tracking-wider font-semibold">符合關聯之內容建議</span>
                                                 <span className="bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold font-mono">共 {searchSuggestions.length} 筆</span>
                                             </div>
                                             {searchSuggestions.map(({ entry, matchField, matchLabel, matchValue }) => {
                                                 const categoryStyles = {
                                                     dining: 'bg-amber-50 text-amber-700 border-amber-200',
                                                     travel: 'bg-blue-50 text-blue-700 border-blue-200',
                                                     story: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                 };
                                                 const categoryLabel = {
                                                     dining: '佳餚',
                                                     travel: '旅行',
                                                     story: '網誌',
                                                 };

                                                 return (
                                                     <button
                                                         key={`${entry.id}-${matchField}`}
                                                         onClick={() => handleSelectSuggestion(entry)}
                                                         className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0 flex flex-col transition-colors group cursor-pointer"
                                                     >
                                                         <div className="flex items-center justify-between gap-2 w-full">
                                                             <span className="font-bold text-stone-900 group-hover:text-[#000053] transition-colors leading-snug truncate block flex-1">
                                                                 {highlightText(entry.name, searchQuery)}
                                                             </span>
                                                             <span className={`text-[10px] px-1.5 py-0.5 rounded border font-sans shrink-0 ${categoryStyles[entry.category]}`}>
                                                                 {categoryLabel[entry.category]}
                                                             </span>
                                                         </div>
                                                         {matchField !== 'name' && (
                                                             <div className="text-xs text-stone-500 font-sans mt-1.5 flex items-center gap-1.5 w-full">
                                                                 <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-sans text-[9px] shrink-0 font-medium">
                                                                     {matchLabel}
                                                                 </span>
                                                                 <span className="truncate block flex-1 text-stone-500">
                                                                     {highlightText(matchValue, searchQuery)}
                                                                 </span>
                                                             </div>
                                                         )}
                                                     </button>
                                                 );
                                             })}
                                         </div>
                                     ) : (
                                         <div className="p-6 text-center text-stone-400 font-sans">
                                             <p className="text-sm font-semibold">未找到與其相符的內容</p>
                                             <p className="text-[11px] mt-1 opacity-70">請嘗試更換關鍵字搜尋</p>
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>
                     </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 w-full">
                    {searchQuery.trim() ? (
                        <section className="animate-fade-in-up">
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-300 pb-4 mb-8 gap-2">
                                <h3 className="text-2xl md:text-3xl font-bold text-[#000053] font-serif tracking-wide">
                                    搜尋：『{searchQuery}』之結果
                                </h3>
                                <div className="text-sm text-stone-500 font-sans">
                                    共找到 <span className="font-bold text-[#C5A059]">{homeSearchResults.length}</span> 筆相關內容
                                    {homeSearchResults.length > 0 && <span className="ml-2 text-xs opacity-80">(點擊卡片查看詳細)</span>}
                                </div>
                            </div>
                            
                            {homeSearchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {homeSearchResults.map((entry, idx) => (
                                        <PlaceCard key={entry.id} entry={entry} index={idx} onClick={openEntry} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                                    <p className="text-stone-500 font-serif text-lg">沒有與「{searchQuery}」相符的內容</p>
                                    <p className="text-stone-400 text-sm mt-1 font-sans">請嘗試輸入其他關鍵字，例如：宜蘭、地瓜、牛排、沙威瑪等。</p>
                                    <button 
                                        onClick={() => setSearchQuery("")} 
                                        className="mt-6 bg-[#000053] text-white px-5 py-2.5 rounded-full text-xs font-bold font-sans hover:bg-stone-800 transition-colors active:scale-95 cursor-pointer"
                                    >
                                        清除搜尋字詞
                                    </button>
                                </div>
                            )}
                        </section>
                    ) : (
                        <>
                            <section className="relative group/section">
                                <div className="flex items-end justify-between border-b border-stone-300 pb-4 mb-8">
                                     <h3 className="text-2xl md:text-3xl font-bold text-[#000053] font-serif tracking-wide">RESTAURANT GUIDE</h3>
                                     <button onClick={() => handleTabChange('dining')} className="text-sm font-bold text-stone-500 hover:text-[#000053] flex items-center gap-1 transition-transform active:scale-95">查看更多 <ChevronRightIcon className="w-4 h-4" /></button>
                                </div>
                                <div className="relative">
                                    <button onClick={() => scrollContainer(diningScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#000053] text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 active:scale-90 -ml-4"><ChevronLeftIcon className="w-6 h-6" /></button>
                                    <div ref={diningScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x snap-mandatory scroll-smooth">
                                        {diningEntries.slice(0, 5).map((entry, idx) => (<div key={entry.id} className="min-w-[85vw] md:min-w-[350px] snap-center"><PlaceCard entry={entry} index={idx} onClick={openEntry} /></div>))}
                                        {diningEntries.length === 0 && <p className="text-stone-400 italic min-w-[300px]">No restaurants yet.</p>}
                                    </div>
                                     <button onClick={() => scrollContainer(diningScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#000053] text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 active:scale-90 -mr-4"><ChevronRightIcon className="w-6 h-6" /></button>
                                </div>
                            </section>

                            <section className="relative group/section">
                                <div className="flex items-end justify-between border-b border-stone-300 pb-4 mb-8">
                                     <h3 className="text-2xl md:text-3xl font-bold text-[#000053] font-serif tracking-wide">TRAVEL GUIDE</h3>
                                     <button onClick={() => handleTabChange('travel')} className="text-sm font-bold text-stone-500 hover:text-[#000053] flex items-center gap-1 transition-transform active:scale-95">查看更多 <ChevronRightIcon className="w-4 h-4" /></button>
                                </div>
                                <div className="relative">
                                     <button onClick={() => scrollContainer(travelScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#000053] text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 active:scale-90 -ml-4"><ChevronLeftIcon className="w-6 h-6" /></button>
                                    <div ref={travelScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x snap-mandatory scroll-smooth">
                                        {travelEntries.slice(0, 5).map((entry, idx) => (<div key={entry.id} className="min-w-[85vw] md:min-w-[350px] snap-center"><PlaceCard entry={entry} index={idx} onClick={openEntry} /></div>))}
                                        {travelEntries.length === 0 && (<div className="bg-stone-100 rounded-xl p-12 text-center text-stone-400 italic min-w-full flex flex-col items-center justify-center"><GlobeIcon className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>Travel stories coming soon...</p></div>)}
                                    </div>
                                    <button onClick={() => scrollContainer(travelScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#000053] text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 active:scale-90 -mr-4"><ChevronRightIcon className="w-6 h-6" /></button>
                                </div>
                            </section>

                            <section className="relative group/section">
                                <div className="flex items-end justify-between border-b border-stone-300 pb-4 mb-8">
                                     <h3 className="text-2xl md:text-3xl font-bold text-[#000053] font-serif tracking-wide">STORY GUIDE</h3>
                                     <button onClick={() => handleTabChange('story')} className="text-sm font-bold text-stone-500 hover:text-[#000053] flex items-center gap-1 transition-transform active:scale-95">查看更多 <ChevronRightIcon className="w-4 h-4" /></button>
                                </div>
                                <div className="relative">
                                     <button onClick={() => scrollContainer(storyScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#000053] text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 active:scale-90 -ml-4"><ChevronLeftIcon className="w-6 h-6" /></button>
                                    <div ref={storyScrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x snap-mandatory scroll-smooth">
                                        {storyEntries.slice(0, 5).map((entry, idx) => (<div key={entry.id} className="min-w-[85vw] md:min-w-[350px] snap-center"><PlaceCard entry={entry} index={idx} onClick={openEntry} /></div>))}
                                        {storyEntries.length === 0 && (<div className="bg-stone-100 rounded-xl p-12 text-center text-stone-400 italic min-w-full flex flex-col items-center justify-center"><BegoniaIcon className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>Personal stories coming soon...</p></div>)}
                                    </div>
                                     <button onClick={() => scrollContainer(storyScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#000053] text-white p-2 rounded-full shadow-lg opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 active:scale-90 -mr-4"><ChevronRightIcon className="w-6 h-6" /></button>
                                </div>
                            </section>
                        </>
                    )}
                </div>
                <Footer />
            </div>
        )}

        {(activeTab === 'dining' || activeTab === 'travel' || activeTab === 'story') && (
            <div key={activeTab} className="animate-fade-in-up flex flex-col min-h-full">
                 <div 
                     className="relative w-full h-[50vh] bg-black group overflow-hidden touch-pan-y"
                     onTouchStart={handleTouchStart}
                     onTouchMove={handleTouchMove}
                     onTouchEnd={handleTouchEnd}
                 >
                     {currentSlides.map((slide, index) => (
                         <div 
                           key={index}
                           className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer overflow-hidden ${index === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                           onClick={handleCarouselClick}
                         >
                             {/* Ken Burns Effect applied here */}
                             <img 
                                src={getSlideImage(slide)}
                                 referrerPolicy="no-referrer"
                                 onError={(e) => {
                                      (e.target as HTMLImageElement).src = getAssetUrl("/images/lg/coming_soon.png");
                                   }} 
                                alt={slide.title} 
                                className={`w-full h-full object-cover opacity-80 ${index === carouselIndex ? 'animate-ken-burns' : ''}`} 
                             />
                             <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                                 {/* Improved Typography: Small subtitle above, Title below, no colon */}
                                 <p className="text-sm md:text-base uppercase tracking-[0.3em] font-medium text-white/90 mb-1">{slide.subtitle}</p>
                                 <h2 className="text-3xl md:text-4xl font-bold font-serif mb-2 tracking-wide text-shadow">{slide.title}</h2>
                                 <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-4 text-[#C5A059]">更多資訊...</p>
                             </div>
                         </div>
                     ))}
                     
                     <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"><ChevronLeftIcon className="w-8 h-8" /></button>
                     <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"><ChevronRightIcon className="w-8 h-8" /></button>

                     <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                         {currentSlides.map((_, idx) => (
                             <div 
                                key={idx} 
                                onClick={(e) => goToSlide(e, idx)} 
                                className={`w-2 h-2 rounded-full transition-all cursor-pointer hover:scale-125 ${idx === carouselIndex ? 'bg-[#C5A059] w-6' : 'bg-white/50'}`} 
                             />
                         ))}
                     </div>
                 </div>

                 <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm py-3 px-4">
                     <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 md:flex-none">
                            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="bg-stone-100 text-stone-700 text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#000053] hover:bg-stone-200 cursor-pointer transition-colors font-sans"><option value="all">所有國家</option>{uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}</select>
                             <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-stone-100 text-stone-700 text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#000053] hover:bg-stone-200 cursor-pointer transition-colors font-sans"><option value="all">所有縣市</option>{uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}</select>
                            {activeTab === 'dining' && (<select value={filterCuisine} onChange={(e) => setFilterCuisine(e.target.value)} className="bg-stone-100 text-stone-700 text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#000053] hover:bg-stone-200 cursor-pointer transition-colors font-sans"><option value="all">所有料理</option>{uniqueCuisines.map(c => <option key={c} value={c}>{c}</option>)}</select>)}
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                            <div className="relative flex-1 md:flex-none">
                                <input type="text" placeholder={`搜尋${searchPlaceholderWord}...`} className="pl-4 pr-10 py-1.5 rounded-lg border border-stone-200 text-sm w-full md:w-64 focus:border-[#000053] outline-none bg-stone-50 font-sans" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2" />
                            </div>
                            <button onClick={toggleSort} className="flex items-center gap-1 text-[#000053] hover:bg-[#000053] hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-[#000053]/20 shrink-0 active:scale-95"><SortIcon className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} /></button>
                        </div>
                     </div>
                 </div>

                 <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-12 min-h-[50vh]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {processedEntries.map((entry, idx) => (<PlaceCard key={entry.id} entry={entry} index={idx} onClick={openEntry} />))}
                    </div>
                    {processedEntries.length === 0 && (<div className="text-center py-20 text-stone-500 col-span-full">沒有符合條件的項目</div>)}
                 </div>
                 <Footer />
            </div>
        )}

        {activeTab === 'about' && (
            <div key="about" className="animate-fade-in-up flex flex-col min-h-full">
                  <div className="relative w-full h-48 md:h-64 lg:h-80 bg-stone-200 overflow-hidden shrink-0">
                      <img 
                          src={getAssetUrl(appSettings.aboutCoverImageUrl || "/images/lg/coming_soon.png")} 
                          onError={(e) => {
                                      (e.target as HTMLImageElement).src = getAssetUrl("/images/lg/coming_soon.png");
                                   }}
                          alt="About Cover" 
                          className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
                          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-shadow tracking-widest">關於</h2>
                          <p className="text-white/80 text-sm md:text-base font-serif tracking-[0.2em] uppercase">LIWEI GUIDE</p>
                      </div>
                  </div>
                  
                  <div className="max-w-3xl mx-auto p-6 md:p-10 mb-8">
                      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4 mb-8 gap-2">
                           <span className="text-lg font-bold text-[#000053] tracking-widest">主編 / LIWEI HSU</span>
                           <span className="text-sm text-stone-500 font-serif tracking-widest">2025/12/31</span>
                      </div>
                      
                      <div className="blog-content mb-10">
                          {renderContentBlocks(appSettings.aboutContent || [])}
                      </div>
                      
                      <div className="pt-8 border-t border-stone-200 text-center">
                            <h3 className="text-lg font-bold text-stone-700 mb-6 font-serif">LIWEI GUIDE</h3>
                            
                            <div className="flex flex-wrap justify-center gap-4 mb-6">
                                <button onClick={() => handleTabChange('home')} className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif">首頁</button>
                                <button onClick={() => handleTabChange('dining')} className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif">佳餚</button>
                                <button onClick={() => handleTabChange('travel')} className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif">旅行</button>
                                <button onClick={() => handleTabChange('story')} className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif">網誌</button>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4">
                                 {appSettings.socialLinks?.map(link => (
                                     <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-700 font-bold transition-all active:scale-95">
                                         <GlobeIcon className="w-4 h-4 text-[#000053]" />
                                         {link.label}
                                     </a>
                                 ))}
                            </div>
                       </div>
                  </div>

                  <Footer />
            </div>
        )}

      </main>

      {/* Viewing Details Modal (Global Modal) */}
      {viewingEntry && (
        <div 
            className="fixed inset-0 bg-white z-[80] overflow-y-auto animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
        >
           <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-100 p-4 flex justify-between items-center z-10">
               <div className="flex items-center gap-2">
                   <button 
                     onClick={closeEntry}
                     className="flex items-center gap-1 text-stone-500 hover:text-[#000053] transition-colors active:scale-95"
                   >
                      <XMarkIcon className="w-6 h-6" />
                      <span className="font-bold">關閉</span>
                   </button>
               </div>
               
               <button 
                 onClick={() => handleShareEntry(viewingEntry)}
                 className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full text-stone-600 font-bold text-sm transition-all active:scale-95"
               >
                  <ShareIcon className="w-4 h-4" />
                  分享
               </button>
           </div>

           <div className="w-full h-64 md:h-[450px] relative overflow-hidden group/modalcover bg-stone-950 select-none">
               {/* Images Layer */}
               <div className="absolute inset-0 w-full h-full">
                   {entryPhotos.map((photo, index) => (
                       <div 
                           key={index}
                           className={`absolute inset-0 transition-all duration-700 ease-out transform ${
                               index === activePhotoIndex 
                                   ? "opacity-100 scale-100 translate-x-0 cursor-zoom-in" 
                                   : "opacity-0 scale-105 pointer-events-none"
                           }`}
                           onClick={() => {
                               if (index === activePhotoIndex) {
                                   setLightboxPhotoIndex(activePhotoIndex);
                                   setLightboxOpen(true);
                               }
                           }}
                       >
                           <img 
                               src={getAssetUrl(photo || "/images/lg/coming_soon.png")}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                      (e.target as HTMLImageElement).src = getAssetUrl("/images/lg/coming_soon.png");
                                   }}
                               className="w-full h-full object-cover"
                               alt={`${viewingEntry.name} - ${index + 1}`}
                           />
                       </div>
                   ))}
               </div>

               {/* Left/Right Controls */}
               {entryPhotos.length > 1 && (
                   <>
                       <button 
                           onClick={handlePrevPhoto}
                           className="absolute left-4 top-1/2 -translate-y-1/2 z-25 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 opacity-0 group-hover/modalcover:opacity-100 duration-300 shadow-lg cursor-pointer"
                       >
                           <ChevronLeftIcon className="w-5 h-5" />
                       </button>
                       <button 
                           onClick={handleNextPhoto}
                           className="absolute right-4 top-1/2 -translate-y-1/2 z-25 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 opacity-0 group-hover/modalcover:opacity-100 duration-300 shadow-lg cursor-pointer"
                       >
                           <ChevronRightIcon className="w-5 h-5" />
                       </button>

                       {/* Slide Dots Overlay */}
                       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 flex gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg">
                           {entryPhotos.map((_, index) => (
                               <button
                                   key={index}
                                   onClick={(e) => {
                                       e.stopPropagation();
                                       setActivePhotoIndex(index);
                                   }}
                                   className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                       index === activePhotoIndex 
                                           ? "w-4 bg-white" 
                                           : "w-2 bg-white/40 hover:bg-white/70"
                                   }`}
                               />
                           ))}
                       </div>
                   </>
               )}

               {/* Full-screen tooltip hover tag */}
               <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md text-white text-[11px] font-sans px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none opacity-0 group-hover/modalcover:opacity-100 transition-opacity duration-300 shadow-md">
                   <PhotoIcon className="w-3.5 h-3.5" />
                   <span>點擊看大圖</span>
                   {entryPhotos.length > 1 && <span className="opacity-60">({activePhotoIndex + 1}/{entryPhotos.length})</span>}
               </div>

               <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none z-10"></div>
               <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white z-20">
                   <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap gap-3 mb-3">
                            {viewingEntry.country && <span className="bg-[#000053] px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{viewingEntry.country}</span>}
                            {viewingEntry.city && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{viewingEntry.city}</span>}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 leading-tight text-shadow">{viewingEntry.name}</h1>
                        <div className="flex items-center gap-4 text-sm md:text-base">
                             <div className="flex items-center gap-1 text-white">
                                {Array.from({ length: viewingEntry.guideRating }).map((_, i) => (
                                    <BegoniaIcon key={i} className="w-5 h-5" />
                                ))}
                             </div>
                             {/* Date removed */}
                        </div>
                   </div>
               </div>
           </div>

           <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <MapPinIcon className="w-6 h-6 text-[#000053] mt-1 shrink-0" />
                        <div>
                            <h3 className="font-bold text-stone-800 mb-1">{viewingEntry.category === 'dining' ? '餐廳資訊' : '位置資訊'}</h3>
                            <p className="text-stone-600">{viewingEntry.address || `${viewingEntry.city || ''} ${viewingEntry.country || ''}`}</p>
                        </div>
                    </div>
                    <a 
                      href={viewingEntry.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#000053] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#000053]/80 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <NavigateIcon className="w-4 h-4" />
                        導航
                    </a>
                </div>

                <div className="blog-content">
                    {renderContentBlocks(viewingEntry.guideReview)}
                </div>

                <div className="mt-16 pt-10 border-t border-stone-200 text-center">
                    <UtensilsIcon className="w-8 h-8 mx-auto text-stone-300 mb-4" />
                    <p className="font-serif text-[#000053] font-bold text-lg">LIWEI GUIDE</p>
                    <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">EST. 2005</p>
                </div>
           </div>
        </div>
      )}


      {/* Photo Lightbox Popup Modal */}
      {lightboxOpen && viewingEntry && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col justify-between items-center select-none animate-lightbox-fade"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header Controls */}
          <div className="w-full p-4 md:p-6 flex justify-between items-center z-[110] relative text-white/90">
             <div className="font-serif text-sm opacity-75">
                 {viewingEntry.name} {entryPhotos.length > 1 && <span className="ml-2 font-sans bg-white/10 px-2.5 py-1 rounded-full text-xs font-semibold">{lightboxPhotoIndex + 1} / {entryPhotos.length}</span>}
             </div>
             <button 
               onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
               className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shadow-md border border-white/10 text-white"
             >
                <XMarkIcon className="w-6 h-6" />
             </button>
          </div>

          {/* Main Visual Carousel Area */}
          <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden px-4 md:px-16 py-8">
              {/* Left Slider Arrow Button */}
              {entryPhotos.length > 1 && (
                  <button 
                     onClick={handlePrevLightboxPhoto}
                     className="absolute left-4 md:left-8 z-[120] p-3 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-white/10 shadow-2xl hover:scale-105 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                  >
                      <ChevronLeftIcon className="w-6 h-6" />
                  </button>
              )}

              {/* Central Img Box with subtle scale-up and fade transition */}
              <div 
                className="max-w-4xl max-h-[75vh] md:max-h-[80vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                  <img 
                    src={getAssetUrl(entryPhotos[lightboxPhotoIndex] || "/images/lg/coming_soon.png")}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = getAssetUrl("/images/lg/coming_soon.png");
                                   }} 
                    className="max-w-full max-h-[75vh] md:max-h-[80vh] rounded-lg shadow-2xl object-contain animate-lightbox-zoom"
                    alt={`${viewingEntry.name} full view - ${lightboxPhotoIndex + 1}`}
                  />
              </div>

              {/* Right Slider Arrow Button */}
              {entryPhotos.length > 1 && (
                  <button 
                     onClick={handleNextLightboxPhoto}
                     className="absolute right-4 md:right-8 z-[120] p-3 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-white/10 shadow-2xl hover:scale-105 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                  >
                      <ChevronRightIcon className="w-6 h-6" />
                  </button>
              )}
          </div>

          {/* Bottom Indicators Bar */}
          {entryPhotos.length > 1 && (
              <div className="pb-6 flex gap-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                  {entryPhotos.map((_, idx) => (
                      <button
                          key={idx}
                          onClick={() => setLightboxPhotoIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === lightboxPhotoIndex 
                                  ? "w-8 bg-white" 
                                  : "w-2 bg-white/30 hover:bg-white/60"
                          }`}
                      />
                  ))}
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;