export interface CheapSharkDeal {
  internalName: string;
  title: string;
  metacriticLink: string | null;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

export interface CheapSharkGameSearch {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
}

export interface CheapSharkGameDetail {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    date: number;
  };
  deals: {
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }[];
}

export interface CheapSharkStore {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

export interface SteamAppDetails {
  success: boolean;
  data: {
    type: string;
    name: string;
    steam_appid: number;
    required_age: number;
    is_free: boolean;
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    header_image: string;
    capsule_image: string;
    website: string | null;
    developers: string[];
    publishers: string[];
    price_overview?: {
      currency: string;
      initial: number;
      final: number;
      discount_percent: number;
      initial_formatted: string;
      final_formatted: string;
    };
    platforms: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    metacritic?: {
      score: number;
      url: string;
    };
    categories?: { id: number; description: string }[];
    genres?: { id: string; description: string }[];
    screenshots?: { id: number; path_thumbnail: string; path_full: string }[];
    movies?: {
      id: number;
      name: string;
      thumbnail: string;
      webm: { 480: string; max: string };
      mp4: { 480: string; max: string };
    }[];
    release_date?: {
      coming_soon: boolean;
      date: string;
    };
    pc_requirements?: {
      minimum?: string;
      recommended?: string;
    };
  };
}

export interface SteamFeaturedCategory {
  id: string;
  name: string;
  items: SteamSpecialItem[];
}

export interface SteamSpecialItem {
  id: number;
  type: number;
  name: string;
  discounted: boolean;
  discount_percent: number;
  original_price: number | null;
  final_price: number;
  currency: string;
  large_capsule_image: string;
  small_capsule_image: string;
  discount_expiration?: number;
  header_image: string;
}

export interface SaleEvent {
  name: string;
  startDate: string;
  endDate: string;
  type: 'seasonal' | 'fest';
  description: string;
}

export interface SalesCalendar {
  sales: SaleEvent[];
}
