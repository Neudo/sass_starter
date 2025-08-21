/**
 * Language code to language name mapping
 * Supports both ISO 639-1 (2-letter) and locale codes (e.g., en-US, fr-FR)
 */

const LANGUAGE_NAMES: Record<string, string> = {
  // Major languages
  'en': 'English',
  'fr': 'French',
  'es': 'Spanish',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'mk': 'Macedonian',
  'sq': 'Albanian',
  'mt': 'Maltese',
  'is': 'Icelandic',
  'ga': 'Irish',
  'cy': 'Welsh',
  'eu': 'Basque',
  'ca': 'Catalan',
  'gl': 'Galician',
  'fa': 'Persian',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ml': 'Malayalam',
  'kn': 'Kannada',
  'gu': 'Gujarati',
  'mr': 'Marathi',
  'ne': 'Nepali',
  'si': 'Sinhala',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'ka': 'Georgian',
  'am': 'Amharic',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'af': 'Afrikaans',
  'xh': 'Xhosa',
  'ig': 'Igbo',
  'yo': 'Yoruba',
  'ha': 'Hausa',
  'az': 'Azerbaijani',
  'kk': 'Kazakh',
  'ky': 'Kyrgyz',
  'uz': 'Uzbek',
  'tg': 'Tajik',
  'mn': 'Mongolian',
  'bo': 'Tibetan',
  'dz': 'Dzongkha',
  'ps': 'Pashto',
  'sd': 'Sindhi',
  'ckb': 'Sorani Kurdish',
  'ku': 'Kurdish',
  'hy': 'Armenian',
  'el': 'Greek',
  'mo': 'Moldovan',
  'bs': 'Bosnian',
  'me': 'Montenegrin',
  'lb': 'Luxembourgish',
  'rm': 'Romansh',
  'fur': 'Friulian',
  'sc': 'Sardinian',
  'co': 'Corsican',
  'br': 'Breton',
  'gd': 'Scottish Gaelic',
  'gv': 'Manx',
  'kw': 'Cornish',
  'fo': 'Faroese',
  'se': 'Northern Sami',
  'smj': 'Lule Sami',
  'sma': 'Southern Sami',
  'smn': 'Inari Sami',
  'sms': 'Skolt Sami',
};

/**
 * Regional variants and their display names
 */
const REGIONAL_VARIANTS: Record<string, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'en-CA': 'English (Canada)',
  'en-AU': 'English (Australia)',
  'en-NZ': 'English (New Zealand)',
  'en-ZA': 'English (South Africa)',
  'en-IN': 'English (India)',
  'fr-FR': 'French (France)',
  'fr-CA': 'French (Canada)',
  'fr-BE': 'French (Belgium)',
  'fr-CH': 'French (Switzerland)',
  'es-ES': 'Spanish (Spain)',
  'es-MX': 'Spanish (Mexico)',
  'es-AR': 'Spanish (Argentina)',
  'es-CO': 'Spanish (Colombia)',
  'es-CL': 'Spanish (Chile)',
  'es-PE': 'Spanish (Peru)',
  'es-VE': 'Spanish (Venezuela)',
  'es-US': 'Spanish (US)',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  'de-DE': 'German (Germany)',
  'de-AT': 'German (Austria)',
  'de-CH': 'German (Switzerland)',
  'it-IT': 'Italian (Italy)',
  'it-CH': 'Italian (Switzerland)',
  'nl-NL': 'Dutch (Netherlands)',
  'nl-BE': 'Dutch (Belgium)',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'zh-HK': 'Chinese (Hong Kong)',
  'zh-SG': 'Chinese (Singapore)',
  'ar-SA': 'Arabic (Saudi Arabia)',
  'ar-EG': 'Arabic (Egypt)',
  'ar-AE': 'Arabic (UAE)',
  'ar-MA': 'Arabic (Morocco)',
  'ar-DZ': 'Arabic (Algeria)',
  'ar-TN': 'Arabic (Tunisia)',
  'ar-LB': 'Arabic (Lebanon)',
  'ar-JO': 'Arabic (Jordan)',
  'ar-SY': 'Arabic (Syria)',
  'ar-IQ': 'Arabic (Iraq)',
  'ar-KW': 'Arabic (Kuwait)',
  'ar-QA': 'Arabic (Qatar)',
  'ar-BH': 'Arabic (Bahrain)',
  'ar-OM': 'Arabic (Oman)',
  'ar-YE': 'Arabic (Yemen)',
  'ar-LY': 'Arabic (Libya)',
  'ar-SD': 'Arabic (Sudan)',
  'ja-JP': 'Japanese (Japan)',
  'ko-KR': 'Korean (South Korea)',
  'ko-KP': 'Korean (North Korea)',
  'ru-RU': 'Russian (Russia)',
  'ru-BY': 'Russian (Belarus)',
  'ru-KZ': 'Russian (Kazakhstan)',
  'ru-KG': 'Russian (Kyrgyzstan)',
  'ru-UA': 'Russian (Ukraine)',
  'hi-IN': 'Hindi (India)',
  'bn-BD': 'Bengali (Bangladesh)',
  'bn-IN': 'Bengali (India)',
  'ur-PK': 'Urdu (Pakistan)',
  'ur-IN': 'Urdu (India)',
  'fa-IR': 'Persian (Iran)',
  'fa-AF': 'Persian (Afghanistan)',
  'fa-TJ': 'Persian (Tajikistan)',
  'tr-TR': 'Turkish (Turkey)',
  'tr-CY': 'Turkish (Cyprus)',
  'sv-SE': 'Swedish (Sweden)',
  'sv-FI': 'Swedish (Finland)',
  'da-DK': 'Danish (Denmark)',
  'no-NO': 'Norwegian (Norway)',
  'nb-NO': 'Norwegian Bokmål (Norway)',
  'nn-NO': 'Norwegian Nynorsk (Norway)',
  'fi-FI': 'Finnish (Finland)',
  'is-IS': 'Icelandic (Iceland)',
  'hu-HU': 'Hungarian (Hungary)',
  'cs-CZ': 'Czech (Czech Republic)',
  'sk-SK': 'Slovak (Slovakia)',
  'pl-PL': 'Polish (Poland)',
  'ro-RO': 'Romanian (Romania)',
  'ro-MD': 'Romanian (Moldova)',
  'bg-BG': 'Bulgarian (Bulgaria)',
  'hr-HR': 'Croatian (Croatia)',
  'sr-RS': 'Serbian (Serbia)',
  'sr-ME': 'Serbian (Montenegro)',
  'bs-BA': 'Bosnian (Bosnia and Herzegovina)',
  'sl-SI': 'Slovenian (Slovenia)',
  'mk-MK': 'Macedonian (North Macedonia)',
  'sq-AL': 'Albanian (Albania)',
  'sq-XK': 'Albanian (Kosovo)',
  'et-EE': 'Estonian (Estonia)',
  'lv-LV': 'Latvian (Latvia)',
  'lt-LT': 'Lithuanian (Lithuania)',
  'mt-MT': 'Maltese (Malta)',
  'ga-IE': 'Irish (Ireland)',
  'cy-GB': 'Welsh (Wales)',
  'gd-GB': 'Scottish Gaelic (Scotland)',
  'eu-ES': 'Basque (Spain)',
  'ca-ES': 'Catalan (Spain)',
  'ca-AD': 'Catalan (Andorra)',
  'gl-ES': 'Galician (Spain)',
  'th-TH': 'Thai (Thailand)',
  'vi-VN': 'Vietnamese (Vietnam)',
  'id-ID': 'Indonesian (Indonesia)',
  'ms-MY': 'Malay (Malaysia)',
  'ms-SG': 'Malay (Singapore)',
  'ms-BN': 'Malay (Brunei)',
  'tl-PH': 'Filipino (Philippines)',
  'my-MM': 'Burmese (Myanmar)',
  'km-KH': 'Khmer (Cambodia)',
  'lo-LA': 'Lao (Laos)',
  'ka-GE': 'Georgian (Georgia)',
  'hy-AM': 'Armenian (Armenia)',
  'az-AZ': 'Azerbaijani (Azerbaijan)',
  'kk-KZ': 'Kazakh (Kazakhstan)',
  'ky-KG': 'Kyrgyz (Kyrgyzstan)',
  'uz-UZ': 'Uzbek (Uzbekistan)',
  'tg-TJ': 'Tajik (Tajikistan)',
  'mn-MN': 'Mongolian (Mongolia)',
  'ne-NP': 'Nepali (Nepal)',
  'si-LK': 'Sinhala (Sri Lanka)',
  'ta-IN': 'Tamil (India)',
  'ta-LK': 'Tamil (Sri Lanka)',
  'ta-SG': 'Tamil (Singapore)',
  'te-IN': 'Telugu (India)',
  'ml-IN': 'Malayalam (India)',
  'kn-IN': 'Kannada (India)',
  'gu-IN': 'Gujarati (India)',
  'mr-IN': 'Marathi (India)',
  'he-IL': 'Hebrew (Israel)',
  'el-GR': 'Greek (Greece)',
  'el-CY': 'Greek (Cyprus)',
  'am-ET': 'Amharic (Ethiopia)',
  'sw-KE': 'Swahili (Kenya)',
  'sw-TZ': 'Swahili (Tanzania)',
  'sw-UG': 'Swahili (Uganda)',
  'zu-ZA': 'Zulu (South Africa)',
  'xh-ZA': 'Xhosa (South Africa)',
  'af-ZA': 'Afrikaans (South Africa)',
  'ig-NG': 'Igbo (Nigeria)',
  'yo-NG': 'Yoruba (Nigeria)',
  'ha-NG': 'Hausa (Nigeria)',
  'ha-NE': 'Hausa (Niger)',
};

/**
 * Convert language code to readable language name
 * @param languageCode - Language code (e.g., 'en', 'fr-FR', 'zh-CN')
 * @returns Readable language name (e.g., 'English', 'French (France)', 'Chinese (Simplified)')
 */
export function getLanguageName(languageCode: string): string {
  if (!languageCode) {
    return 'Unknown';
  }

  // Normalize the language code
  const normalizedCode = languageCode.toLowerCase().trim();

  // Check for exact regional variant match first
  if (REGIONAL_VARIANTS[normalizedCode]) {
    return REGIONAL_VARIANTS[normalizedCode];
  }

  // Extract base language code (e.g., 'en' from 'en-US')
  const baseLanguage = normalizedCode.split('-')[0];

  // Check for base language match
  if (LANGUAGE_NAMES[baseLanguage]) {
    // If we have a region but no specific variant, show base language with region
    if (normalizedCode.includes('-')) {
      const region = normalizedCode.split('-')[1].toUpperCase();
      return `${LANGUAGE_NAMES[baseLanguage]} (${region})`;
    }
    return LANGUAGE_NAMES[baseLanguage];
  }

  // Fallback: return the original code if no match found
  return languageCode;
}

/**
 * Get language flag emoji based on the primary country for that language
 * Note: This is approximate as languages don't have flags, only countries do
 */
export function getLanguageFlag(languageCode: string): string | null {
  if (!languageCode) return null;

  const normalizedCode = languageCode.toLowerCase().trim();
  
  // Handle regional variants first
  const regionCode = normalizedCode.split('-')[1];
  if (regionCode) {
    switch (regionCode) {
      case 'us': return '🇺🇸';
      case 'gb': return '🇬🇧';
      case 'ca': return '🇨🇦';
      case 'au': return '🇦🇺';
      case 'nz': return '🇳🇿';
      case 'za': return '🇿🇦';
      case 'in': return '🇮🇳';
      case 'fr': return '🇫🇷';
      case 'be': return '🇧🇪';
      case 'ch': return '🇨🇭';
      case 'es': return '🇪🇸';
      case 'mx': return '🇲🇽';
      case 'ar': return '🇦🇷';
      case 'co': return '🇨🇴';
      case 'cl': return '🇨🇱';
      case 'pe': return '🇵🇪';
      case 've': return '🇻🇪';
      case 'br': return '🇧🇷';
      case 'pt': return '🇵🇹';
      case 'de': return '🇩🇪';
      case 'at': return '🇦🇹';
      case 'it': return '🇮🇹';
      case 'nl': return '🇳🇱';
      case 'cn': return '🇨🇳';
      case 'tw': return '🇹🇼';
      case 'hk': return '🇭🇰';
      case 'sg': return '🇸🇬';
      case 'jp': return '🇯🇵';
      case 'kr': return '🇰🇷';
      case 'ru': return '🇷🇺';
      default: return null;
    }
  }

  // Handle base language codes
  const baseLanguage = normalizedCode.split('-')[0];
  switch (baseLanguage) {
    case 'en': return '🇺🇸'; // Default to US English
    case 'fr': return '🇫🇷';
    case 'es': return '🇪🇸';
    case 'de': return '🇩🇪';
    case 'it': return '🇮🇹';
    case 'pt': return '🇵🇹';
    case 'ru': return '🇷🇺';
    case 'ja': return '🇯🇵';
    case 'ko': return '🇰🇷';
    case 'zh': return '🇨🇳';
    case 'ar': return '🇸🇦';
    case 'hi': return '🇮🇳';
    case 'tr': return '🇹🇷';
    case 'pl': return '🇵🇱';
    case 'nl': return '🇳🇱';
    case 'sv': return '🇸🇪';
    case 'da': return '🇩🇰';
    case 'no': return '🇳🇴';
    case 'nb': return '🇳🇴';
    case 'nn': return '🇳🇴';
    case 'fi': return '🇫🇮';
    case 'he': return '🇮🇱';
    case 'th': return '🇹🇭';
    case 'vi': return '🇻🇳';
    case 'id': return '🇮🇩';
    case 'ms': return '🇲🇾';
    case 'tl': return '🇵🇭';
    case 'cs': return '🇨🇿';
    case 'sk': return '🇸🇰';
    case 'hu': return '🇭🇺';
    case 'ro': return '🇷🇴';
    case 'bg': return '🇧🇬';
    case 'hr': return '🇭🇷';
    case 'sr': return '🇷🇸';
    case 'sl': return '🇸🇮';
    case 'et': return '🇪🇪';
    case 'lv': return '🇱🇻';
    case 'lt': return '🇱🇹';
    case 'uk': return '🇺🇦';
    case 'be': return '🇧🇾';
    case 'mk': return '🇲🇰';
    case 'sq': return '🇦🇱';
    case 'mt': return '🇲🇹';
    case 'is': return '🇮🇸';
    case 'ga': return '🇮🇪';
    case 'cy': return '🏴󠁧󠁢󠁷󠁬󠁳󠁿'; // Wales flag
    case 'eu': return '🇪🇸'; // Basque (Spain)
    case 'ca': return '🇪🇸'; // Catalan (Spain)
    case 'gl': return '🇪🇸'; // Galician (Spain)
    case 'fa': return '🇮🇷';
    case 'ur': return '🇵🇰';
    case 'bn': return '🇧🇩';
    case 'ta': return '🇮🇳';
    case 'te': return '🇮🇳';
    case 'ml': return '🇮🇳';
    case 'kn': return '🇮🇳';
    case 'gu': return '🇮🇳';
    case 'mr': return '🇮🇳';
    case 'ne': return '🇳🇵';
    case 'si': return '🇱🇰';
    case 'my': return '🇲🇲';
    case 'km': return '🇰🇭';
    case 'lo': return '🇱🇦';
    case 'ka': return '🇬🇪';
    case 'am': return '🇪🇹';
    case 'sw': return '🇰🇪';
    case 'zu': return '🇿🇦';
    case 'af': return '🇿🇦';
    case 'xh': return '🇿🇦';
    case 'ig': return '🇳🇬';
    case 'yo': return '🇳🇬';
    case 'ha': return '🇳🇬';
    case 'az': return '🇦🇿';
    case 'kk': return '🇰🇿';
    case 'ky': return '🇰🇬';
    case 'uz': return '🇺🇿';
    case 'tg': return '🇹🇯';
    case 'mn': return '🇲🇳';
    case 'el': return '🇬🇷';
    case 'hy': return '🇦🇲';
    default: return null;
  }
}