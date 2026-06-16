import { createAdminClient } from "@/lib/supabase/admin";

const SITE_CACHE_TTL_MS = 5 * 60 * 1000;

interface SiteData {
  id: string;
  domain: string;
  public_enabled?: boolean | null;
}

interface CachedSite {
  site: SiteData | null;
  expiresAt: number;
}

const siteByDomainCache = new Map<string, CachedSite>();

export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];
}

export function domainVariants(domain: string): string[] {
  const normalized = normalizeDomain(domain);
  return normalized ? [normalized, `www.${normalized}`] : [];
}

export function sameRegistrableHost(a: string, b: string): boolean {
  return normalizeDomain(a) === normalizeDomain(b);
}

export async function getSiteByDomain(
  domain: string,
  options: { publicOnly?: boolean } = {}
): Promise<SiteData | null> {
  const normalized = normalizeDomain(domain);
  const cacheKey = `${normalized}:${options.publicOnly ? "public" : "any"}`;
  const cached = siteByDomainCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.site;
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("sites")
    .select("id, domain, public_enabled")
    .in("domain", domainVariants(normalized))
    .limit(1);

  if (options.publicOnly) {
    query = query.eq("public_enabled", true);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    siteByDomainCache.set(cacheKey, {
      site: null,
      expiresAt: Date.now() + SITE_CACHE_TTL_MS,
    });
    return null;
  }

  const site = {
    id: data[0].id,
    domain: data[0].domain,
    public_enabled: data[0].public_enabled,
  };

  siteByDomainCache.set(cacheKey, {
    site,
    expiresAt: Date.now() + SITE_CACHE_TTL_MS,
  });
  return site;
}

export function clearSiteCache() {
  siteByDomainCache.clear();
}
