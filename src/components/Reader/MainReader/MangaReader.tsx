'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Reader.module.css';
import { setCookie, getCookie } from '@/lib/cookies';
import Navbar, { type ReadingMode } from '@/components/Reader/Navbar/Navbar';
import {Comments} from "@/components/Comments";
import { StripReader } from '@/components/Reader/StripReader/StripReader';

type Page = {
    documentId: string;
    image: { url: string };
    number: number;
};

type Title = {
    slug: string;
    name: string;
    type: string;
};

export type Chapter = {
    documentId: string;
    number: number;
    name?: string;
    title: Title;
    pages: Page[];
};

type MangaReaderProps = {
    chapters: Chapter[];
    chapter: string;
    strDomain?: string;
};

const STRIP_MODE_TYPES = ['Манхва', 'Маньхуа'];

export function MangaReader({ chapters, chapter, strDomain }: MangaReaderProps) {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [chapterIndex, setChapterIndex] = useState(-1);
    const [pageIndex,    setPageIndex]    = useState(0);
    const [pageNumVisible, setPageNumVisible] = useState(true);
    const [imageWidth, setImageWidth] = useState<number>(() => {
        if (typeof window === 'undefined') return 40;
        const stored = getCookie('reader_width');
        return stored ? Number(stored) : 40;
    });
    const [hoveredControl, setHoveredControl] = useState<'prev' | 'next' | null>(null);
    const [readingMode, setReadingMode] = useState<ReadingMode>(() => {
        if (typeof window === 'undefined') return 'paged';
        const stored = getCookie('reader_mode');
        return stored === 'strip' ? 'strip' : 'paged';
    });

    const currentChapter = chapters[chapterIndex] as Chapter | undefined;
    const supportsStripMode = STRIP_MODE_TYPES.includes(currentChapter?.title.type ?? '');
    const effectiveMode: ReadingMode = supportsStripMode ? readingMode : 'paged';

    const currentPage = currentChapter?.pages?.find(
        page => page.number === pageIndex + 1
    );
    const hasPrevPage = pageIndex > 0 || chapterIndex > 0;
    const hasNextPage =
        currentChapter !== undefined &&
        (pageIndex + 1 < currentChapter.pages.length ||
            chapterIndex + 1 < chapters.length);

    useEffect(() => {
        setCookie('reader_width', imageWidth.toString());
    }, [imageWidth]);

    useEffect(() => {
        setCookie('reader_mode', readingMode);
    }, [readingMode]);

    useEffect(() => {
        if (window.innerWidth < 800) setImageWidth(100);

        const html = document.documentElement;
        const prev = html.style.scrollbarGutter;
        html.style.scrollbarGutter = 'stable';
        return () => { html.style.scrollbarGutter = prev; };
    }, []);

    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            setPageNumVisible(y < 100 || y < lastY);
            lastY = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navigateTo = useCallback((targetChapterIdx: number, targetPageIdx: number) => {
        setHoveredControl(null);

        const ch = chapters[targetChapterIdx];
        if (!ch) return;
        setCookie(`reader_progress_${ch.title.slug}`, JSON.stringify({
            chapter: ch.number,
            page:    targetPageIdx + 1,
        }));
        router.push(`/manga/${ch.title.slug}/reader/${ch.number}?p=${targetPageIdx + 1}`);
    }, [chapters, router]);

    useEffect(() => {
        if (!chapters.length) return;

        const nums    = chapters.map(c => c.number);
        const minNum  = Math.min(...nums);
        const maxNum  = Math.max(...nums);
        const numeric = Number(chapter);
        const actual  = isNaN(numeric) ? minNum : Math.min(Math.max(numeric, minNum), maxNum);
        const idx     = chapters.findIndex(c => c.number === actual);
        if (idx === -1) return;

        const pParam   = searchParams.get('p');
        const rawPage  = pParam !== null && !isNaN(Number(pParam)) ? Number(pParam) : 1;
        const total    = chapters[idx]?.pages?.length ?? 1;
        const safePage = Math.min(Math.max(1, rawPage), total);

        if (actual !== numeric || rawPage !== safePage) {
            navigateTo(idx, safePage - 1);
            return;
        }

        setChapterIndex(idx);
        setPageIndex(safePage - 1);
    }, [chapter, chapters, searchParams, navigateTo]);

    const goNext = useCallback(() => {
        if (!currentChapter) return;
        if (pageIndex + 1 < currentChapter.pages.length) {
            navigateTo(chapterIndex, pageIndex + 1);
        } else if (chapterIndex + 1 < chapters.length) {
            navigateTo(chapterIndex + 1, 0);
        } else {
            router.push(`/manga/${currentChapter.title.slug}/`);
        }
    }, [currentChapter, pageIndex, chapterIndex, chapters.length, navigateTo, router]);

    const goPrev = useCallback(() => {
        if (!currentChapter) return;
        if (pageIndex > 0) {
            navigateTo(chapterIndex, pageIndex - 1);
        } else if (chapterIndex > 0) {
            const prev = chapters[chapterIndex - 1];
            navigateTo(chapterIndex - 1, prev.pages.length - 1);
        } else {
            router.push(`/manga/${currentChapter.title.slug}/`);
        }
    }, [currentChapter, pageIndex, chapterIndex, chapters, navigateTo, router]);

    if (!currentChapter || !currentPage) {
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
                NavigateToAction={navigateTo}
                conetntWidth={imageWidth}
                setContentWidthAction={setImageWidth}
                readingMode={effectiveMode}
                setReadingModeAction={setReadingMode}
            />

            {effectiveMode === 'strip' ? (
                <div className={styles.pageContainer}>
                    <StripReader
                        chapter={currentChapter}
                        strDomain={strDomain}
                        width={imageWidth}
                    />
                </div>
            ) : (
                <>
                    <div className={styles.pageContainer}>
                        <div className={styles.page} style={{ maxWidth: `${imageWidth}vw` }}>
                            <div className={styles.pageImageWrap}>
                                <div className={styles.controls}>
                                    <div
                                        className={[
                                            styles.previousPageControl,
                                            !hasPrevPage ? styles.controlDisabled : '',
                                            hoveredControl === 'prev' ? styles.hovered : '',
                                        ].join(' ')}
                                        onMouseEnter={() => hasPrevPage && setHoveredControl('prev')}
                                        onMouseLeave={() => setHoveredControl(null)}
                                        onClick={hasPrevPage ? goPrev : undefined}
                                    />
                                    <div
                                        className={[
                                            styles.nextPageControl,
                                            !hasNextPage ? styles.controlDisabled : '',
                                            hoveredControl === 'next' ? styles.hovered : '',
                                        ].join(' ')}
                                        onMouseEnter={() => hasNextPage && setHoveredControl('next')}
                                        onMouseLeave={() => setHoveredControl(null)}
                                        onClick={hasNextPage ? goNext : undefined}
                                    />
                                </div>
                                <img
                                    src={strDomain + currentPage.image.url}
                                    className={styles.pageImage}
                                    alt={`Страница ${pageIndex + 1}`}
                                    draggable={false}
                                />
                            </div>
                            <div className={styles.pageComments}>
                                <Comments
                                    contentType="api::manga-page.manga-page"
                                    contentId={currentPage.documentId}
                                />
                            </div>
                        </div>




                    </div>

                    <div className={`${styles.pageNumber} ${pageNumVisible ? styles.visible : styles.hidden}`}>
                        <span>{pageIndex + 1} / {currentChapter.pages.length}</span>
                    </div>
                </>
            )}
        </div>
    );
}