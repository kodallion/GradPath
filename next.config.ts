import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@anthropic-ai/sdk"],
  // Lets phones on the same WiFi load dev JS/CSS chunks when testing via LAN IP.
  allowedDevOrigins: ["192.168.1.135"],
};

export default nextConfig;
