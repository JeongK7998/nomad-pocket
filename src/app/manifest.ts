import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nomad Pocket',
    short_name: 'Nomad Pocket',
    description: 'Financial Precision — 노마드 라이프스타일 개인 가계부',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f4f7',
    theme_color: '#004ea7',
    orientation: 'landscape',
    lang: 'ko',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
