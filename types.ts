export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export type ContentBlock = 
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'image'; url: string; caption?: string };

export interface GuideEntry {
  id: number;
  name: string;
  mapLink: string;
  guideRating: number; // 1-3 stars
  // guideReview can be string (legacy) or ContentBlock[] (new)
  guideReview: string | ContentBlock[]; 
  photoUrl: string;
  photos?: string[];
  timestamp: number;
  updatedAt?: number; // Last edited time
  coordinates?: { lat: number, lng: number };
  country?: string;
  city?: string;
  address?: string;
  cuisine?: string;
  category: 'dining' | 'travel' | 'story'; // New field for categorization
}

export interface LinkItem {
  id: number;
  label: string;
  url: string;
}

export interface AppSettings {
  coverImageUrl?: string;
  aboutCoverImageUrl?: string; // New independent cover for About page
  authorIntro?: string; // Legacy simple string, kept for fallback
  aboutContent?: ContentBlock[]; // New rich text content
  socialLinks?: LinkItem[];
}

export interface GeminiResponse {
  text: string;
  groundingMetadata?: any;
}