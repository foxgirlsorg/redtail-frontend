import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
    title: "RedTail",
    description: "Команда переводчиков RedTail",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <head />
        <body>
        <Script
            async
            defer
            data-website-id={process.env.PUBLIC_UMAMI_ID}
            src="/umami.js"
            strategy="afterInteractive"
        />
        {children}
        </body>
        </html>
    );
}
