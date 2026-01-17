import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      // Agrega tu IP local aquí (y localhost). 
      // Esto permite que tu celular hable con el servidor.
      allowedOrigins: ['localhost:3000', '192.168.1.4:3000', '*.ngrok-free.app'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;