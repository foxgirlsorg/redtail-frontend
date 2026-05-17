import type { NextConfig } from "next";

const umamiServer = process.env.NEXT_PUBLIC_UMAMI_SERVER_URL ?? "https://cloud.umami.is";

const nextConfig: NextConfig = {
    async rewrites() {
        if (!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) return [];
        return [
            {
                source: "/stats/script.js",
                destination: `${umamiServer}/script.js`,
            },
            {
                source: "/stats/api/send",
                destination: `${umamiServer}/api/send`,
            },
        ];
    },
};

export default nextConfig;