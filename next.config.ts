import type { NextConfig } from "next";
import path from "path";

// Derive the R2 hostname from R2_PUBLIC_URL so the allowlist follows the env.
// Falls back to the *.r2.dev wildcard so the public-bucket URL works during
// initial setup even before R2_PUBLIC_URL is set.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "**.r2.dev" },
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
];

const publicUrl = process.env.R2_PUBLIC_URL;
if (publicUrl) {
  try {
    const u = new URL(publicUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
    });
  } catch {
    // Ignore malformed env value — the wildcards above still cover r2.dev.
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Local placeholder art is SVG; safe because we control the files in /public.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns,
  },
};

export default nextConfig;
