'use client';

import { useRouter } from 'next/navigation';
import { Btn } from './Button';
import React, {useEffect} from "react";
import {getCookie} from "@/lib/cookies";

interface rBtnProps {
    title:any;
}



export const ReadButton = ({title}: rBtnProps) => {
    if (title.chapters.length > 0) {
        const router = useRouter();

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
        }
        let location = `/manga/${title.slug}/reader/${title.chapters[title.chapters.length -1].number}/`;

        const cookies = getLastReadPosition(title.slug);
        if (cookies) {
            location = `/manga/${title.slug}/reader/${cookies.chapter}/?p=${cookies.page}`;
        }
        const handleClick = () => {
            router.push(location);
        };
        return (
            <Btn onClickAction={handleClick} iconSrc="/icons/arrow-forward-outline.svg" text={cookies ? "Продолжить" : "Читать"} />
        );
    } else {
        return (
            <Btn iconSrc="/icons/arrow-forward-outline.svg" text="Читать" disabled={true} />
        );
    }


}
