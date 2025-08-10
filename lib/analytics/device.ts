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

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceCategory,
  };
}