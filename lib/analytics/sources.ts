export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export interface TrafficSource {
  referrer: string | null;
  referrerDomain: string | null;
  utmParams: UTMParams;
}

export function parseTrafficSource(
  urlParams: string | null,
  referrer: string | null
): TrafficSource {
  // Extract UTM parameters and ref parameter
  let utm_source = null;
  let utm_medium = null;
  let utm_campaign = null;
  let utm_term = null;
  let utm_content = null;
  let ref_param = null;

  if (urlParams) {
    const params = new URLSearchParams(urlParams);
    utm_source = params.get("utm_source");
    utm_medium = params.get("utm_medium");
    utm_campaign = params.get("utm_campaign");
    utm_term = params.get("utm_term");
    utm_content = params.get("utm_content");
    ref_param = params.get("ref");
  }

  // Extract referrer domain
  let referrerDomain = null;
  let effectiveReferrer = referrer;

  // If we have a ref parameter and no utm_source, use ref as the referrer
  if (ref_param && !utm_source) {
    effectiveReferrer = ref_param;
    referrerDomain = ref_param;
    utm_source = ref_param; // Also set utm_source for easier tracking
  } else if (referrer) {
    try {
      const referrerUrl = new URL(referrer);
      referrerDomain = referrerUrl.hostname;
    } catch {
      // If referrer is not a valid URL, leave as null
    }
  }

  return {
    referrer: effectiveReferrer,
    referrerDomain,
    utmParams: {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
    },
  };
}