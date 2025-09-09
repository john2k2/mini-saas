import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nueva sintaxis para Next.js 15
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  
  // Optimizaciones de build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir Prisma del bundle del cliente
      config.externals.push('@prisma/client')
    }
    return config
  },

  // Configuración de transpilación
  transpilePackages: [],
  
  // Configuración de producción
  output: 'standalone',
  
  // Variables de entorno que necesitan estar disponibles
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

export default nextConfig;
