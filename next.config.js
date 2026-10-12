/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { outputFileTracingIncludes: { '/api/discovery/company-seal': ['./private-assets/company-seal.png'], '/api/discovery/inquiries/*/contracts': ['./private-assets/company-seal.png'] } },
}

module.exports = nextConfig
