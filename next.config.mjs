/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "reqres.in" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "rxehhovebdxudsoaeoxd.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
