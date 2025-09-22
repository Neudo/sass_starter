import Image from "next/image";
import { Monitor, Tablet, Smartphone, MonitorSmartphone, Globe } from "lucide-react";

/**
 * Get browser icon component based on browser name
 */
export const getBrowserIcon = (browserName: string) => {
  const name = browserName?.toLowerCase() || "";

  // Check for Chrome Headless first (specific case)
  if (name.includes("chrome") && name.includes("headless")) {
    return (
      <Image
        src="/images/browser/chromium-webview.png"
        alt={browserName}
        width={16}
        height={16}
        className="w-4 h-4"
      />
    );
  }

  // Map browser names to image filenames
  const browserImageMap: Record<string, string> = {
    chrome: "chrome.png",
    firefox: "firefox.png",
    safari: "safari.png",
    edge: "edge.png",
    "edge chromium": "edge-chromium.png",
    opera: "opera.png",
    "opera mini": "opera-mini.png",
    brave: "brave.png",
    samsung: "samsung.png",
    "internet explorer": "ie.png",
    ie: "ie.png",
    facebook: "facebook.png",
    instagram: "instagram.png",
    silk: "silk.png",
    yandex: "yandexbrowser.png",
    "yandex browser": "yandexbrowser.png",
    miui: "miui.png",
    kakaotalk: "kakaotalk.png",
    crios: "crios.png",
    fxios: "fxios.png",
    "android webview": "android-webview.png",
    "chromium webview": "chromium-webview.png",
    "ios webview": "ios-webview.png",
    aol: "aol.png",
    beaker: "beaker.png",
    blackberry: "blackberry.png",
    curl: "curl.png",
    searchbot: "searchbot.png",
  };

  // Find matching browser
  for (const [browser, filename] of Object.entries(browserImageMap)) {
    if (name.includes(browser)) {
      return (
        <Image
          src={`/images/browser/${filename}`}
          alt={browserName}
          width={16}
          height={16}
          className="w-4 h-4"
        />
      );
    }
  }

  // Default fallback
  return (
    <Image
      src="/images/browser/unknown.png"
      alt={browserName}
      width={16}
      height={16}
      className="w-4 h-4"
    />
  );
};

/**
 * Get OS icon component based on OS name
 */
export const getOSIcon = (osName: string) => {
  const name = osName?.toLowerCase() || "";

  // Map OS names to image filenames
  const osImageMap: Record<string, string> = {
    windows: "windows-11.png",
    "windows 11": "windows-11.png",
    "windows 10": "windows-10.png",
    "windows 8.1": "windows-8-1.png",
    "windows 8": "windows-8.png",
    "windows 7": "windows-7.png",
    "windows vista": "windows-vista.png",
    "windows xp": "windows-xp.png",
    "windows 2000": "windows-2000.png",
    "windows 98": "windows-98.png",
    "windows 95": "windows-95.png",
    "windows me": "windows-me.png",
    "windows mobile": "windows-mobile.png",
    "windows server 2003": "windows-server-2003.png",
    "windows 3.11": "windows-3-11.png",
    mac: "mac-os.png",
    macos: "mac-os.png",
    "mac os": "mac-os.png",
    ios: "ios.png",
    iphone: "ios.png",
    ipad: "ios.png",
    android: "android-os.png",
    "android os": "android-os.png",
    linux: "linux.png",
    ubuntu: "linux.png",
    debian: "linux.png",
    "red hat": "linux.png",
    centos: "linux.png",
    fedora: "linux.png",
    "chrome os": "chrome-os.png",
    chromeos: "chrome-os.png",
    blackberry: "blackberry-os.png",
    "blackberry os": "blackberry-os.png",
    beos: "beos.png",
    "be os": "beos.png",
    "amazon os": "amazon-os.png",
    "fire os": "amazon-os.png",
    qnx: "qnx.png",
    "sun os": "sun-os.png",
    sunos: "sun-os.png",
    solaris: "sun-os.png",
    "open bsd": "open-bsd.png",
    openbsd: "open-bsd.png",
    "os/2": "os-2.png",
    "os 2": "os-2.png",
  };

  // Find matching OS
  for (const [os, filename] of Object.entries(osImageMap)) {
    if (name.includes(os)) {
      return (
        <Image
          src={`/images/os/${filename}`}
          alt={osName}
          width={16}
          height={16}
          className="w-4 h-4"
        />
      );
    }
  }

  // Default fallback
  return (
    <Image
      src="/images/os/unknown.png"
      alt={osName}
      width={16}
      height={16}
      className="w-4 h-4"
    />
  );
};

/**
 * Get device icon component based on screen size
 */
export const getDeviceIcon = (screenSize: string) => {
  const size = screenSize?.toLowerCase() || "";

  if (size.includes("mobile") || size.includes("phone")) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (size.includes("tablet") || size.includes("ipad")) {
    return <Tablet className="h-4 w-4" />;
  }
  if (size.includes("desktop")) {
    return <Monitor className="h-4 w-4" />;
  }
  return <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />;
};

/**
 * Get source icon URL or null for direct traffic
 */
export const getSourceIcon = (channel: string, referrerDomain?: string): string | null => {
  const channelLower = channel?.toLowerCase() || "";
  const lowerName = referrerDomain?.toLowerCase() || "";

  // Check if it's "direct" traffic (no favicon needed)
  if (channelLower === "direct" || channelLower === "direct traffic" || !channel) {
    return null;
  }

  // Extract domain for Google Favicon API
  let domain = referrerDomain || channel;

  // Clean up the source name to extract domain
  if (domain && domain.includes(".")) {
    // It's likely a domain - clean it up
    domain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    // Special handling for Twitter/X domains
    if (domain === "t.co") {
      domain = "x.com"; // Use X.com for Twitter's URL shortener
    }
  } else {
    // Map common source names to their domains
    const domainMappings: Record<string, string> = {
      google: "google.com",
      facebook: "facebook.com",
      instagram: "instagram.com",
      youtube: "youtube.com",
      linkedin: "linkedin.com",
      reddit: "reddit.com",
      github: "github.com",
      stackoverflow: "stackoverflow.com",
      twitter: "x.com",
      x: "x.com",
      "x (twitter)": "x.com",
      "hacker news": "news.ycombinator.com",
      hackernews: "news.ycombinator.com",
      "product hunt": "producthunt.com",
      producthunt: "producthunt.com",
    };

    domain =
      domainMappings[lowerName] ||
      `${(referrerDomain || channel).toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  }

  // Return Google Favicon API URL if we have a valid domain
  if (domain && domain.includes(".")) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  }

  return null;
};

/**
 * Render source icon with Image component and fallback
 */
export const renderSourceIcon = (channel: string, referrerDomain?: string) => {
  const iconUrl = getSourceIcon(channel, referrerDomain);

  if (!iconUrl) {
    return <Globe className="w-4 h-4 flex-shrink-0 text-muted-foreground" />;
  }

  return (
    <Image
      src={iconUrl}
      alt={channel || "Direct"}
      width={16}
      height={16}
      className="flex-shrink-0"
      onError={() => {}}
    />
  );
};