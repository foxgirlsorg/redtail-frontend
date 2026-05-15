import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteNavbar } from "@/components/SiteNavbar/SiteNavbar";
import "./globals.css";
import { SmoothScroll } from '@/components/SmoothScroll/SmoothScroll';

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
        <SiteNavbar/>
        {children}
        </body>
        </html>
    );
}