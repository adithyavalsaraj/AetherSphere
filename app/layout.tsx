import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://aethersphere-studio.vercel.app'),
  title: 'AetherSphere Studio - Interactive 3D Particle Physics Sandbox',
  description: 'Explore stunning 3D particle physics, cursor gravity deflection fields, orbital inertia, and cosmic supernova bursts in a premium glassmorphic sandbox.',
  generator: 'next.js',
  keywords: [
    '3D Particle System',
    'Mathematical Physics',
    'Interactive SVG Canvas',
    'Fibonacci Sphere',
    'Cursor Gravity',
    'Next.js 15',
    'React 19 Sandbox',
    'Creative Coding',
    'WebGL alternative',
    'Generative Art'
  ],
  authors: [{ name: 'Adithya Valsaraj', url: 'https://adithyavalsaraj.com' }],
  creator: 'Adithya Valsaraj',
  publisher: 'Adithya Valsaraj',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aethersphere-studio.vercel.app',
    title: 'AetherSphere Studio - Interactive 3D Particle Physics Sandbox',
    description: 'Explore stunning 3D particle physics, cursor gravity deflection fields, orbital inertia, and cosmic supernova bursts in a premium glassmorphic sandbox.',
    siteName: 'AetherSphere Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AetherSphere Studio - Interactive 3D Particle Physics Sandbox',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AetherSphere Studio - Interactive 3D Particle Physics Sandbox',
    description: 'Explore stunning 3D particle physics, cursor gravity deflection fields, orbital inertia, and cosmic supernova bursts in a premium glassmorphic sandbox.',
    creator: '@adithyavalsaraj',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
