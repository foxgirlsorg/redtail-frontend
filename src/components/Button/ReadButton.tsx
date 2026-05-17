'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Btn } from './Button';
import React, { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookies";

interface rBtnProps {
    title: any;
}

export const ReadButton = ({ title }: rBtnProps) => {
    const [location, setLocation] = useState<string | null>(null);
    const [hasProgress, setHasProgress] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (title.chapters.length === 0) return;

        const getLastReadPosition = (slug: string) => {
            const raw = getCookie(`reader_progress_${slug}`);
            if (!raw) return null;

            try {
                const parsed = JSON.parse(raw);
                if (
                    typeof parsed.chapter === 'number' &&
                    typeof parsed.page === 'number'
                ) {
                    return parsed;
                }
            } catch (e) {
                return null;
            }
            return null;
        };

        const cookies = getLastReadPosition(title.slug);

        if (cookies) {
            setLocation(`${pathname}/reader/${cookies.chapter}/?p=${cookies.page}`);
            setHasProgress(true);
        } else {
            const lastChapter = title.chapters[0];
            setLocation(`${pathname}/reader/${lastChapter.number}/`);
            setHasProgress(false);
        }

    }, [title]);

    const handleClick = () => {
        if (location) {
            router.push(location);
        }
    };

    if (title.chapters.length === 0) {
        return (
            <Btn iconSrc="/icons/arrow-forward-outline.svg" text="Читать" disabled={true} />
        );
    }

    return (
        <Btn
            onClickAction={handleClick}
            iconSrc="/icons/arrow-forward-outline.svg"
            text={hasProgress ? "Продолжить" : "Читать"}
        />
    );
};
