/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Set this to the deployed Python API origin in the frontend hosting environment.
  // Keep the localhost default for local development.
  personalAssistantApiUrl: process.env.PERSONAL_ASSISTANT_API_URL || "http://127.0.0.1:8000",
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
        destination: `${nextConfig.personalAssistantApiUrl}/personal-assistant/:path*`,
      },
    ];
  },
};

export default nextConfig;
