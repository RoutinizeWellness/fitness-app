/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'www.inspireusafoundation.org',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
  // Redirecciones para unificar rutas
  async redirects() {
    return [
      // Redirecciones de rutas antiguas a las nuevas unificadas
      {
        source: '/habit-dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/routinize',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/workout/:path*',
        destination: '/training/:path*',
        permanent: true,
      },
      {
        source: '/ejercicios/:path*',
        destination: '/training/exercises/:path*',
        permanent: true,
      },
      {
        source: '/rutinas/:path*',
        destination: '/training/routines/:path*',
        permanent: true,
      },
      {
        source: '/nutricion/:path*',
        destination: '/nutrition/:path*',
        permanent: true,
      },
      {
        source: '/settings/:path*',
        destination: '/profile/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
