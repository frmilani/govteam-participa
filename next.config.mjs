import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos absolutos para o Formbuilder
const formbuilderSrcPath = path.resolve(__dirname, '../formbuilder/src');
const formbuilderDistEntry = path.resolve(__dirname, '../formbuilder/dist-package/form-renderer-package-entry.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath removido — roteamento por path é feito pelo Traefik (StripPrefix)
    // Em produção: Traefik recebe /participa/* → strip → encaminha /* para este container
    // Em dev: acessa direto em localhost:3006/*
    allowedDevOrigins: ['prefeitura-espigao.govteam.com.br'],
    images: {

        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // Alias para o pacote do form-renderer (build do formbuilder)
        if (process.env.NODE_ENV === 'development') {
            config.resolve.alias['@frmilani/form-renderer'] = formbuilderDistEntry;
            // Aliases para imports internos do formbuilder
            config.resolve.alias['@formbuilder'] = formbuilderSrcPath;
            config.resolve.alias['@hub'] = formbuilderSrcPath;
        }

        config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', ...config.resolve.extensions];

        return config;
    },
    rewrites: async () => {
        const FORMBUILDER_URL = process.env.FORMBUILDER_URL || 'http://localhost:3005';
        return [
            {
                source: '/api/public/v1/analytics/:path*',
                destination: `${FORMBUILDER_URL}/api/public/v1/analytics/:path*`,
            },
        ];
    },
}

export default nextConfig
