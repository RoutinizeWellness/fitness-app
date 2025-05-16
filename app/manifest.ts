import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Routinize Wellness',
    short_name: 'Routinize',
    description: 'Plataforma integral para gestionar tu bienestar físico y mental',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/mobile-dashboard.jpg',
        sizes: '1080x1920',
        type: 'image/jpeg',
        form_factor: 'narrow',
      },
      {
        src: '/screenshots/desktop-dashboard.jpg',
        sizes: '1920x1080',
        type: 'image/jpeg',
        form_factor: 'wide',
      },
    ],
    orientation: 'portrait',
    categories: ['fitness', 'health', 'lifestyle'],
    prefer_related_applications: false,
  }
}
