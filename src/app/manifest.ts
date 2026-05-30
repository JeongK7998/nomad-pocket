import type { MetadataRoute } from 'next'
import { APP_ICON_VERSION } from '@/app/iconVersion'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nomad Pocket',
    short_name: 'Nomad Pocket',
    description: 'Financial Precision — 노마드 라이프스타일 개인 가계부',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f4f7',
    theme_color: '#004ea7',
    orientation: 'any',
    lang: 'ko',
    icons: [
      {
        src: `/icon?v=${APP_ICON_VERSION}`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `/icon?v=${APP_ICON_VERSION}`,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: `/apple-icon?v=${APP_ICON_VERSION}`,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
