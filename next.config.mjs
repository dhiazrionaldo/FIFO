/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)', // Apply to all routes
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store',  // Disable caching for all routes
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  
// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
