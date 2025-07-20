'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Reader.module.css';
import { getCookie, setCookie } from '@/lib/cookies';
import Navbar from '@/components/Reader/Manga/Navbar/Navbar';
import CusdisComments from '@/components/CusdisComments';

type MangaReaderProps = {
    chapters: any[];
    chapter: string;
    cusdisHost: string;
    cusdisAppId: string;
    strDomain?: string;
};

export function MangaReader({ chapters, chapter, cusdisHost, cusdisAppId, strDomain }: MangaReaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [pageNumberVisible, setPageNumberVisible] = useState(true);
    const [chapterIndex, setChapterIndex] = useState(-1);
    const [pageIndex, setPageIndex] = useState(0);
    const [imageWidth, setImageWidth] = useState<number>(() => {
        try {
            const stored = getCookie('reader_width');
            return stored ? Number(stored) : 40;
        } catch {
            return 40;
        }
    });

    const currentChapter = chapters[chapterIndex];
    const currentPage = currentChapter?.pages?.[pageIndex];

    const hasPrev = pageIndex > 0 || (chapterIndex > 0 && chapters[chapterIndex - 1]?.pages?.length > 0);
    const hasNext = (
        currentChapter?.pages &&
        (pageIndex + 1 < currentChapter.pages.length ||
            (chapterIndex + 1 < chapters.length && chapters[chapterIndex + 1]?.pages?.length > 0))
    );

    useEffect(() => {
        if (window.innerWidth < 800) {
            setImageWidth(100);
        }

        const html = document.documentElement;
        const prevGutter = html.style.scrollbarGutter;
        html.style.scrollbarGutter = 'stable';

        return () => {
            html.style.scrollbarGutter = prevGutter;
        };
    }, []);

    useEffect(() => {
        setCookie('reader_width', imageWidth.toString());
    }, [imageWidth]);

    useEffect(() => {
        if (!chapters.length) return;

        const numericChapter = Number(chapter);
        const chapterNumbers = chapters.map(ch => ch.number);
        const min = Math.min(...chapterNumbers);
        const max = Math.max(...chapterNumbers);

        let actualChapter = isNaN(numericChapter)
            ? min
            : Math.min(Math.max(numericChapter, min), max);

        const chapterIdx = chapters.findIndex(ch => ch.number === actualChapter);
        if (chapterIdx === -1) return;

        const pParam = searchParams.get('p');
        const rawPageNum = pParam !== null && !isNaN(Number(pParam)) ? Number(pParam) : 1;

        const totalPages = chapters[chapterIdx]?.pages?.length || 1;
        const safePageNum = Math.min(Math.max(1, rawPageNum), totalPages);
        const safePageIndex = safePageNum - 1;

        const urlCorrect = actualChapter === numericChapter && rawPageNum === safePageNum;
        if (!urlCorrect) {
            navigateTo(chapterIdx, safePageIndex);
            return;
        }

        setChapterIndex(chapterIdx);
        setPageIndex(safePageIndex);
    }, [chapter, chapters, searchParams]);

    useEffect(() => {
        const onScroll = () => {
            const current = window.scrollY;
            setPageNumberVisible(current < 100 || current < window.scrollY);
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navigateTo = (targetChapterIdx: number, targetPageIdx: number) => {
        const ch = chapters[targetChapterIdx];
        const slug = ch.title.slug;
        const chapterNumber = ch.number;

        setCookie(`reader_progress_${slug}`, JSON.stringify({
            chapter: chapterNumber,
            page: targetPageIdx + 1
        }));

        router.push(`/manga/${slug}/reader/${chapterNumber}?p=${targetPageIdx + 1}`);
    };

    const goToNextPage = () => {
        if (!currentChapter) return;
        const next = pageIndex + 1;

        if (next < currentChapter.pages.length) {
            navigateTo(chapterIndex, next);
        } else if (chapterIndex + 1 < chapters.length) {
            navigateTo(chapterIndex + 1, 0);
        } else {
            router.push(`/manga/${currentChapter.title.slug}/`);
        }
    };

    const goToPrevPage = () => {
        if (!currentChapter) return;
        const prev = pageIndex - 1;

        if (prev >= 0) {
            navigateTo(chapterIndex, prev);
        } else if (chapterIndex > 0) {
            const prevChapter = chapters[chapterIndex - 1];
            const lastPage = prevChapter.pages.length - 1;
            navigateTo(chapterIndex - 1, lastPage);
        } else {
            router.push(`/manga/${currentChapter.title.slug}/`);
        }
    };

    if (!currentChapter || !currentPage) {
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
                NavigateToAction={navigateTo}
                conetntWidth={imageWidth}
                setContentWidthAction={setImageWidth}
            />

            <div className={styles.pageContainer}>
                <div className={styles.page} style={{ maxWidth: `${imageWidth}vw` }}>
                    <div className={styles.controls}>
                        <div
                            className={`${styles.previousPageControl} ${!hasPrev && styles.controlDisabled}`}
                            style={{ width: `${imageWidth / 2}vw` }}
                            onClick={hasPrev ? goToPrevPage : undefined}
                        ></div>
                        <div
                            className={`${styles.nextPageControl} ${!hasNext && styles.controlDisabled}`}
                            style={{ width: `${imageWidth / 2}vw` }}
                            onClick={hasNext ? goToNextPage : undefined}
                        ></div>
                    </div>
                    <img
                        src={strDomain + currentPage.image.url}
                        style={{ width: '100%' }}
                        className={styles.pageImage}
                    />
                </div>

                <div className={styles.comments}>
                    <CusdisComments
                        host={cusdisHost}
                        appId={cusdisAppId}
                        pageId={`manga_${currentChapter.documentId}`}
                        pageTitle={`${currentChapter.title.name} | Глава ${currentChapter.number} | Страница ${currentPage.number}`}
                        bgColor="#161616"
                    />
                </div>
            </div>

            <div className={`${styles.pageNumber} ${pageNumberVisible ? styles.visible : styles.hidden}`}>
                <span>{pageIndex + 1} / {currentChapter.pages.length}</span>
            </div>
        </div>
    );
}
