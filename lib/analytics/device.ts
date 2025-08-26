import { UAParser } from "ua-parser-js";

export interface DeviceData {
  browser: string | undefined;
  browserVersion: string | undefined;
  os: string | undefined;
  osVersion: string | undefined;
  deviceCategory: "mobile" | "tablet" | "desktop";
}

export function parseUserAgent(userAgent: string | null): DeviceData {
  const parser = new UAParser(userAgent as string);
  const { name: browser, version: browserVersion } = parser.getBrowser();
  const { name: os, version: osVersion } = parser.getOS();
  const { type: deviceType } = parser.getDevice();

  let deviceCategory: "mobile" | "tablet" | "desktop";
  if (deviceType === "mobile") {
    deviceCategory = "mobile";
  } else if (deviceType === "tablet") {
    deviceCategory = "tablet";
  } else {
    deviceCategory = "desktop";
  }

  // Normalize browser names for in-app WebViews
  let normalizedBrowser = browser;
  if (browser?.toLowerCase() === "instagram") {
    normalizedBrowser = "Instagram WebView";
  } else if (browser?.toLowerCase() === "facebook") {
    normalizedBrowser = "Facebook WebView";
  } else if (browser?.toLowerCase() === "twitter") {
    normalizedBrowser = "Twitter/X WebView";
  } else if (browser?.toLowerCase() === "linkedin") {
    normalizedBrowser = "LinkedIn WebView";
  }

  return {
    browser: normalizedBrowser,
    browserVersion,
    os,
    osVersion,
    deviceCategory,
  };
}
