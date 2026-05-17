import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteNavbar } from "@/components/SiteNavbar/SiteNavbar";
import "./globals.css";
import { SmoothScroll } from '@/lib/SmoothScroll';
import {NavigationLoader} from "@/lib/NavigationLoader";
import { Suspense } from "react";
import UmamiProvider from "next-umami";

export const metadata: Metadata = {
    title: "RedTail",
    description: "Команда переводчиков RedTail",
};


export default async function RootLayout({
                                             children,
                                         }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru">
        <head />
        <body>
        <SmoothScroll />
        <Suspense fallback={null}>
            <NavigationLoader />
        </Suspense>
        <SiteNavbar />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
            <UmamiProvider
                websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                src="/stats/script.js"
                hostUrl="/stats"
            >
                {children}
            </UmamiProvider>
        ) : (
            children
        )}
        </body>
        </html>
    );
}