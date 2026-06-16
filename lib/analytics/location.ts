import { Reader } from "@maxmind/geoip2-node";
import type ReaderModel from "@maxmind/geoip2-node/dist/src/readerModel";
import path from "path";

export interface LocationData {
  country: string | null;
  region: string | null;
  city: string | null;
}

let cityReaderPromise: Promise<ReaderModel> | null = null;
let geoipUnavailableLogged = false;

async function getCityReader() {
  if (!cityReaderPromise) {
    const dbPath = path.join(process.cwd(), "data", "GeoLite2-City.mmdb");
    cityReaderPromise = Reader.open(dbPath);
  }

  return cityReaderPromise;
}

export async function getLocationFromIP(ip: string): Promise<LocationData> {
  let country = null;
  let region = null;
  let city = null;

  try {
    const reader = await getCityReader();
    const response = reader.city(ip);

    country = response?.country?.names.en || null;
    region = response?.subdivisions?.[0].names.en || null;
    city = response?.city?.names.en || null;
  } catch (geoError) {
    if (!geoipUnavailableLogged) {
      console.error("Geolocation lookup failed:", geoError);
      geoipUnavailableLogged = true;
    }
  }

  return { country, region, city };
}

export function extractClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  let ip = forwarded ? forwarded.split(",")[0].trim() : null;
  
  // Fallback IP for local development
  if (ip === "::1" || ip === null) {
    ip = "83.114.15.244";
  }
  
  return ip;
}
