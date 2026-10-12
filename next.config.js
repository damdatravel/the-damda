/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { outputFileTracingIncludes: { '/api/discovery/company-seal': ['./private-assets/company-seal.png'], '/api/discovery/inquiries/*/contracts': ['./private-assets/company-seal.png','./public/images/damda-discovery-contract-logo.png'] } },
}

module.exports = nextConfig
