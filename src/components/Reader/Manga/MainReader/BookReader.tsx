'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import styles from './Reader.module.css';
import { getCookie, setCookie } from '@/lib/cookies';
import Navbar from '@/components/Reader/Manga/Navbar/Navbar';
import { IonIcon } from '@/components/IonIcon';
import '@/styles/markdown.css';
import {Comments} from "@/components/Comments";

type Title = {
    slug: string;
    name: string;
    type: string;
};

export type Chapter = {
    documentId: string;
    number: number;
    name?: string;
    content: string;
    title: Title;
};

type BookReaderProps = {
    chapters: Chapter[];
    chapter: string;
    strDomain?: string;
};
function ChapterControls({
                             hasPrev,
                             hasNext,
                             onPrev,
                             onNext,
                         }: {
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
}) {
    return (
        <div className={styles.chapterControls}>
            <div
                className={`${styles.previousChapterControl} ${!hasPrev ? styles.controlDisabled : ''}`}
                onClick={hasPrev ? onPrev : undefined}
            >
                <IonIcon src="/icons/chevron-back-outline.svg" />
                <span>Назад</span>
            </div>
            <div
                className={`${styles.nextChapterControl} ${!hasNext ? styles.controlDisabled : ''}`}
                onClick={hasNext ? onNext : undefined}
            >
                <span>Вперёд</span>
                <IonIcon src="/icons/chevron-forward-outline.svg" />
            </div>
        </div>
    );
}

export function BookReader({ chapters, chapter }: BookReaderProps) {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [chapterIndex, setChapterIndex] = useState(-1);
    const [textWidth, setTextWidth] = useState<number>(() => {
        if (typeof window === 'undefined') return 40;
        const stored = getCookie('reader_text_width');
        return stored ? Number(stored) : 40;
    });

    const currentChapter = chapters[chapterIndex] as Chapter | undefined;
    const hasPrev = chapterIndex > 0;
    const hasNext = chapterIndex + 1 < chapters.length;
    useEffect(() => {
        setCookie('reader_text_width', textWidth.toString());
    }, [textWidth]);
    useEffect(() => {
        if (window.innerWidth < 800) setTextWidth(90);

        const html = document.documentElement;
        const prev = html.style.scrollbarGutter;
        html.style.scrollbarGutter = 'stable';
        return () => { html.style.scrollbarGutter = prev; };
    }, []);
    const navigateTo = useCallback((targetChapterIdx: number) => {
        const ch = chapters[targetChapterIdx];
        if (!ch) return;
        setCookie(`reader_progress_${ch.title.slug}`, JSON.stringify({
            chapter: ch.number,
            page:    1,
        }));
        router.push(`/book/${ch.title.slug}/reader/${ch.number}`);
    }, [chapters, router]);
    const navigateToForNavbar = useCallback(
        (chapterIdx: number, _pageIdx: number) => navigateTo(chapterIdx),
        [navigateTo],
    );
    useEffect(() => {
        if (!chapters.length) return;

        const nums   = chapters.map(c => c.number);
        const minNum = Math.min(...nums);
        const maxNum = Math.max(...nums);
        const numeric = Number(chapter);
        const actual  = isNaN(numeric) ? minNum : Math.min(Math.max(numeric, minNum), maxNum);
        const idx     = chapters.findIndex(c => c.number === actual);
        if (idx !== -1) setChapterIndex(idx);
    }, [chapter, chapters, searchParams]);
    if (!currentChapter) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader} />
            </div>
        );
    }

    return (
        <div className={styles.mainReader}>
            <Navbar
                chapters={chapters}
                chapterIndex={chapterIndex}
                conetntWidth={textWidth}
                setContentWidthAction={setTextWidth}
                NavigateToAction={navigateToForNavbar}
            />

            <div className={styles.pageContainer}>
                <div className={styles.textChapter} style={{ maxWidth: `${textWidth}vw` }}>
                    <ChapterControls
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                        onPrev={() => navigateTo(chapterIndex - 1)}
                        onNext={() => navigateTo(chapterIndex + 1)}
                    />

                    <div className={`markdown-body ${styles.markdown}`}>
                        <ReactMarkdown>{currentChapter.content}</ReactMarkdown>
                    </div>

                    <ChapterControls
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                        onPrev={() => navigateTo(chapterIndex - 1)}
                        onNext={() => navigateTo(chapterIndex + 1)}
                    />
                    <Comments
                        contentType="api::book-chapter.book-chapter"
                        contentId={currentChapter.documentId}
                    />
                </div>
            </div>
        </div>
    );
}
