export interface ResizeObserverPolyfill {
  new (callback: ResizeObserverCallback): ResizeObserver;
}

export interface DebounceSettings {
  /** Child render updates upon resize are delayed until `debounceTime` milliseconds _after_ the last resize event is observed. Defaults to `300`. */
  debounceTime?: number;
  /** Optional flag to toggle leading debounce calls. When set to true this will ensure that the component always renders immediately. Defaults to `true`. */
  enableDebounceLeadingCall?: boolean;
}

export interface PrivateWindow {
  ResizeObserver: ResizeObserverPolyfill;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
  status: "draft" | "published" | "scheduled";
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  featured_image?: string;
}
