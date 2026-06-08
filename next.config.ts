import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PGlite ships its own WASM and must never be bundled for the server.
  // We only ever use it client-side, but this keeps the server build clean.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
