'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Reader.module.css';
import { getCookie, setCookie } from '@/lib/cookies';
import Navbar from '@/components/Reader/Manga/Navbar/Navbar';
import CusdisComments from '@/components/CusdisComments';
import ReactMarkdown from 'react-markdown';
import '@/styles/markdown.css';
import { IonIcon } from '@/components/IonIcon';

type BookReaderProps = {
    chapters: any[];
    chapter: string;
    cusdisHost: string;
    cusdisAppId: string;
    strDomain?: string;
};

const ChapterControls = ({
                             hasPrev,
                             hasNext,
                             onPrev,
                             onNext,
                         }: {
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
}) => (
    <div className={styles.chapterControls}>
        <div
            className={`${styles.previousChapterControl} ${!hasPrev && styles.controlDisabled}`}
            onClick={hasPrev ? onPrev : undefined}
        >
            <IonIcon src="/icons/chevron-back-outline.svg" />
            <span>Назад</span>
        </div>
        <div
            className={`${styles.nextChapterControl} ${!hasNext && styles.controlDisabled}`}
            onClick={hasNext ? onNext : undefined}
        >
            <span>Вперёд</span>
            <IonIcon src="/icons/chevron-forward-outline.svg" />
        </div>
    </div>
);

export function BookReader({
                               chapters,
                               chapter,
                               cusdisHost,
                               cusdisAppId,
                           }: BookReaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [chapterIndex, setChapterIndex] = useState<number>(-1);
    const [textWidth, setTextWidth] = useState<number>(() => {
        try {
            const stored = getCookie('reader_text_width');
            return stored ? Number(stored) : 40;
        } catch {
            return 40;
        }
    });

    const currentChapter = chapters[chapterIndex];
    const hasPrev = chapterIndex > 0;
    const hasNext = chapterIndex + 1 < chapters.length;

    useEffect(() => {
        if (window.innerWidth < 800) {
            setTextWidth(90);
        }

        const html = document.documentElement;
        const prevGutter = html.style.scrollbarGutter;
        html.style.scrollbarGutter = 'stable';

        return () => {
            html.style.scrollbarGutter = prevGutter;
        };
    }, []);

    useEffect(() => {
        setCookie('reader_text_width', textWidth.toString());
    }, [textWidth]);

    useEffect(() => {
        if (!chapters.length) return;

        const numeric = Number(chapter);
        const chapterNumbers = chapters.map(ch => ch.number);
        const min = Math.min(...chapterNumbers);
        const max = Math.max(...chapterNumbers);

        let actual = isNaN(numeric) ? min : Math.min(Math.max(numeric, min), max);
        const idx = chapters.findIndex(ch => ch.number === actual);
        if (idx !== -1) {
            setChapterIndex(idx);
        }
    }, [chapter, chapters, searchParams]);

    const navigateTo = (targetChapterIdx: number) => {
        const ch = chapters[targetChapterIdx];
        const { slug } = ch.title;
        const chapterNumber = ch.number;

        setCookie(`reader_progress_${slug}`, JSON.stringify({
            chapter: chapterNumber,
            page: 1,
        }));

        router.push(`/book/${slug}/reader/${chapterNumber}`);
    };

    if (!currentChapter) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader}></div>
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
                NavigateToAction={navigateTo}
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
                </div>

                <div className={styles.comments}>
                    <CusdisComments
                        host={cusdisHost}
                        appId={cusdisAppId}
                        pageId={`book_${currentChapter.documentId}`}
                        pageTitle={`${currentChapter.title.name} | Глава ${currentChapter.number}`}
                        bgColor="#161616"
                    />
                </div>
            </div>
        </div>
    );
}
