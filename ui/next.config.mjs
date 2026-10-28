/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Proxy browser requests to the Python backend without exposing backend secrets.
  async rewrites() {
    return [
      {
        source: "/chat",
        destination: "http://127.0.0.1:8000/chat",
      },
      {
        source: "/chatkit",
        destination: "http://127.0.0.1:8000/chatkit",
      },
      {
        source: "/chatkit/:path*",
        destination: "http://127.0.0.1:8000/chatkit/:path*",
      },
      {
        source: "/personal-assistant/:path*",
        destination: "http://127.0.0.1:8000/personal-assistant/:path*",
      },
    ];
  },
};

export default nextConfig;
