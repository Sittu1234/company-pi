import type { NextConfig } from "next";

const liveApi = "https://backend-f870.onrender.com";
const envApi = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const onVercel = process.env.VERCEL === "1";
const apiUrl =
  envApi && !envApi.includes("localhost")
    ? envApi
    : onVercel
      ? liveApi
      : envApi || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
