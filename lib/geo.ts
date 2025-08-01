import geoip from "geoip-lite";

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return null;
}

export function anonymizeIp(ip: string): string {
  if (!ip) return ip;
  if (ip.includes(".")) {
    return ip.replace(/\.\d+$/, ".0");
  }
  const parts = ip.split(":");
  if (parts.length >= 4) {
    return parts.slice(0, 4).join(":") + "::";
  }
  return ip;
}

export function lookupLocationFromIp(ip: string | null) {
  if (!ip) return { country: null, region: null, city: null };
  const anon = anonymizeIp(ip);
  const geo = geoip.lookup(anon);
  if (!geo) return { country: null, region: null, city: null };
  return {
    country: geo.country || null,
    region: geo.region || null,
    city: geo.city || null,
  };
}
