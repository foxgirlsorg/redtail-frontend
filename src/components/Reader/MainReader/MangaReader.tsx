'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Reader.module.css';
import { setCookie, getCookie } from '@/lib/cookies';
import { suppressNextNavigationLoader } from '@/lib/NavigationLoader';
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
    const [stripScrollTarget, setStripScrollTarget] = useState<{ pageNumber: number; ratio?: number } | null>(null);
    const pagedImageWrapRef = useRef<HTMLDivElement>(null);
    const stripTargetChapterRef = useRef<string | null>(null);
    const stripActivePageRef = useRef<number>(1);

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

    const handleSetReadingMode = useCallback<React.Dispatch<React.SetStateAction<ReadingMode>>>((update) => {
        let didSwitch = false;

        setReadingMode(prevMode => {
            const nextMode = typeof update === 'function' ? (update as (m: ReadingMode) => ReadingMode)(prevMode) : update;

            if (prevMode === nextMode) return nextMode;
            didSwitch = true;

            if (prevMode !== 'strip' && nextMode === 'strip') {
                const wrap = pagedImageWrapRef.current;
                let ratio = 0;
                if (wrap) {
                    const rect = wrap.getBoundingClientRect();
                    if (rect.height > 0) {
                        ratio = Math.min(1, Math.max(0, -rect.top / rect.height));
                    }
                }
                if (currentChapter) stripTargetChapterRef.current = currentChapter.documentId;
                stripActivePageRef.current = pageIndex + 1;
                setStripScrollTarget({ pageNumber: pageIndex + 1, ratio });
            }

            if (prevMode === 'strip' && nextMode !== 'strip' && currentChapter) {
                const targetPageNumber = stripActivePageRef.current;
                const targetIndex = currentChapter.pages.findIndex(p => p.number === targetPageNumber);
                if (targetIndex !== -1) {
                    setPageIndex(targetIndex);
                    suppressNextNavigationLoader();
                    const url = new URL(window.location.href);
                    url.searchParams.set('p', String(targetPageNumber));
                    window.history.replaceState(window.history.state, '', url);
                }
            }

            return nextMode;
        });

    }, [pageIndex, currentChapter]);

    const handleStripActivePageChange = useCallback((pageNumber: number) => {
        if (stripActivePageRef.current === pageNumber) return;
        stripActivePageRef.current = pageNumber;

        if (!currentChapter) return;
        suppressNextNavigationLoader();
        const url = new URL(window.location.href);
        url.searchParams.set('p', String(pageNumber));
        window.history.replaceState(window.history.state, '', url);
    }, [currentChapter]);

    useEffect(() => {
        setCookie('reader_width', imageWidth.toString());
    }, [imageWidth]);

    useEffect(() => {
        setCookie('reader_mode', readingMode);
    }, [readingMode]);


    useEffect(() => {
        if (effectiveMode !== 'strip' || !currentChapter) {
            stripTargetChapterRef.current = null;
            if (stripScrollTarget !== null) setStripScrollTarget(null);
            return;
        }

        if (stripTargetChapterRef.current !== currentChapter.documentId) {
            stripTargetChapterRef.current = currentChapter.documentId;
            stripActivePageRef.current = pageIndex + 1;
            setStripScrollTarget({ pageNumber: pageIndex + 1, ratio: 0 });

        }
    }, [effectiveMode, currentChapter?.documentId, pageIndex]);

    useEffect(() => {
        if (window.innerWidth < 800) setImageWidth(100);

        const html = document.documentElement;
        const prev = html.style.scrollbarGutter;
        html.style.scrollbarGutter = 'stable';
        return () => { html.style.scrollbarGutter = prev; };
    }, []);

    useEffect(() => {
        let lastY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                setPageNumVisible(y < 100 || y < lastY);
                lastY = y;
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);


    useEffect(() => {
        if (!currentChapter || effectiveMode !== 'strip') return;

        const SCROLL_END_THRESHOLD_PX = 24;
        let alreadySaved = false;
        let ticking = false;

        const checkScrollEnd = () => {
            const scrollBottom = window.scrollY + window.innerHeight;
            const docHeight    = document.documentElement.scrollHeight;

            if (docHeight - scrollBottom > SCROLL_END_THRESHOLD_PX) {
                alreadySaved = false;
                return;
            }

            if (alreadySaved) return;
            alreadySaved = true;

            const lastPageNumber = currentChapter.pages.length || 1;
            setCookie(`reader_progress_${currentChapter.title.slug}`, JSON.stringify({
                chapter: currentChapter.number,
                page:    lastPageNumber,
            }));
        };

        const onScrollOrResize = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                checkScrollEnd();
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize);
        checkScrollEnd();

        return () => {
            window.removeEventListener('scroll', onScrollOrResize);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [currentChapter, effectiveMode]);

    useEffect(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.removeAttribute('data-strip-scroll-lock');
    }, [currentChapter?.documentId, effectiveMode]);

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
                setReadingModeAction={handleSetReadingMode}
            />

            <div className={styles.pageContainer}>
                <div className={effectiveMode === 'strip' ? styles.stripPage : styles.page} style={{ maxWidth: `${imageWidth}vw` }}>
                    <div className={styles.pageImageWrap} ref={pagedImageWrapRef}>
                        <div className={styles.controls}>
                            <div
                                className={[
                                    styles.previousPageControl,
                                    !(effectiveMode === 'strip' ? chapterIndex > 0 : hasPrevPage) ? styles.controlDisabled : '',
                                    hoveredControl === 'prev' ? styles.hovered : '',
                                ].join(' ')}
                                onMouseEnter={() => (effectiveMode === 'strip' ? chapterIndex > 0 : hasPrevPage) && setHoveredControl('prev')}
                                onMouseLeave={() => setHoveredControl(null)}
                                onClick={
                                    effectiveMode === 'strip'
                                        ? (chapterIndex > 0 ? () => navigateTo(chapterIndex - 1, 0) : undefined)
                                        : (hasPrevPage ? goPrev : undefined)
                                }
                            />
                            <div
                                className={[
                                    styles.nextPageControl,
                                    !(effectiveMode === 'strip' ? chapterIndex + 1 < chapters.length : hasNextPage) ? styles.controlDisabled : '',
                                    hoveredControl === 'next' ? styles.hovered : '',
                                ].join(' ')}
                                onMouseEnter={() => (effectiveMode === 'strip' ? chapterIndex + 1 < chapters.length : hasNextPage) && setHoveredControl('next')}
                                onMouseLeave={() => setHoveredControl(null)}
                                onClick={
                                    effectiveMode === 'strip'
                                        ? (chapterIndex + 1 < chapters.length ? () => navigateTo(chapterIndex + 1, 0) : undefined)
                                        : (hasNextPage ? goNext : undefined)
                                }
                            />
                        </div>

                        {effectiveMode === 'strip' ? (
                            <StripReader
                                chapter={currentChapter}
                                strDomain={strDomain}
                                width={imageWidth}
                                scrollTarget={stripScrollTarget}
                                onActivePageChangeAction={handleStripActivePageChange}
                            />
                        ) : (
                            <img
                                src={strDomain + currentPage.image.url}
                                className={styles.pageImage}
                                alt={`Страница ${pageIndex + 1}`}
                                draggable={false}
                            />
                        )}
                    </div>

                    {effectiveMode === 'paged' && (
                        <div className={styles.pageComments}>
                            <Comments
                                contentType="api::manga-page.manga-page"
                                contentId={currentPage.documentId}
                            />
                        </div>
                    )}
                </div>
            </div>

            {effectiveMode === 'paged' && (
                <div className={`${styles.pageNumber} ${pageNumVisible ? styles.visible : styles.hidden}`}>
                    <span>{pageIndex + 1} / {currentChapter.pages.length}</span>
                </div>
            )}
        </div>
    );
}