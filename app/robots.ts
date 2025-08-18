import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/auth/',
          '/settings/',
          '/admin/',
          '/api/',
          '/test-referrer/',
          '/welcome/'
        ],
      },
    ],
    sitemap: 'https://hectoranalytics.com/sitemap.xml',
  }
}