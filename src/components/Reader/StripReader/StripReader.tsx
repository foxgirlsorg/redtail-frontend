'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IonIcon } from '@/components/IonIcon';
import { Comments } from '@/components/Comments';
import { fetchComments } from '@/lib/commentsApi';
import styles from './StripReader.module.css';

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

function countComments(items: any[] = []): number {
    return items.reduce((sum: number, item: any) => sum + 1 + countComments(item.children ?? []), 0);
}

type StripPageProps = {
    page: Page;
    strDomain?: string;
    width: number;
    registerRefAction: (page: Page, el: HTMLDivElement | null) => void;
};

function StripPage({ page, strDomain, width, registerRefAction }: StripPageProps) {
    return (
        <div
            ref={el => registerRefAction(page, el)}
            data-page-number={page.number}
            className={styles.pageWrapper}
            style={{ maxWidth: `${width}vw` }}
        >
            <img
                src={strDomain + page.image.url}
                alt={`Страница ${page.number}`}
                className={styles.pageImage}
                loading="lazy"
                decoding="async"
                draggable={false}
            />
        </div>
    );
}

type StripReaderProps = {
    chapter: Chapter;
    strDomain?: string;
    width: number;
    scrollTarget?: { pageNumber: number; ratio?: number } | null;
    onActivePageChangeAction?: (pageNumber: number) => void;
};

export function StripReader({
                                chapter,
                                strDomain,
                                width,
                                scrollTarget,
                                onActivePageChangeAction,
                            }: StripReaderProps) {
    const sortedPages = React.useMemo(
        () => [...chapter.pages].sort((a, b) => a.number - b.number),
        [chapter.pages],
    );

    const [activePageDocId, setActivePageDocId] = useState<string | null>(sortedPages[0]?.documentId ?? null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

    const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const loadedCounts = useRef<Set<string>>(new Set());

    const activePage = sortedPages.find(p => p.documentId === activePageDocId) ?? null;

    const registerRef = useCallback((page: Page, el: HTMLDivElement | null) => {
        if (el) pageRefs.current.set(page.documentId, el);
        else pageRefs.current.delete(page.documentId);
    }, []);

    // Track which page currently occupies most of the viewport, so the floating
    // button knows which page's comments to open.
    useEffect(() => {
        const elements = sortedPages
            .map(page => ({ page, el: pageRefs.current.get(page.documentId) }))
            .filter((entry): entry is { page: Page; el: HTMLDivElement } => !!entry.el);

        if (elements.length === 0) return;

        const visibleRatios = new Map<string, number>();

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const docId = (entry.target as HTMLElement).getAttribute('data-doc-id');
                    if (!docId) continue;
                    visibleRatios.set(docId, entry.isIntersecting ? entry.intersectionRatio : 0);
                }

                let bestDocId: string | null = null;
                let bestRatio = 0;
                for (const [docId, ratio] of visibleRatios) {
                    if (ratio > bestRatio) {
                        bestRatio = ratio;
                        bestDocId = docId;
                    }
                }

                if (bestDocId) setActivePageDocId(bestDocId);
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1] },
        );

        elements.forEach(({ page, el }) => {
            el.setAttribute('data-doc-id', page.documentId);
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sortedPages]);

    // Prefetch the comment count for whichever page is currently active.
    useEffect(() => {
        if (!activePage || loadedCounts.current.has(activePage.documentId)) return;
        loadedCounts.current.add(activePage.documentId);

        fetchComments('api::manga-page.manga-page', activePage.documentId, null)
            .then(data => setCommentCounts(prev => ({ ...prev, [activePage.documentId]: countComments(data) })))
            .catch(() => setCommentCounts(prev => ({ ...prev, [activePage.documentId]: 0 })));
    }, [activePage]);

    useEffect(() => {
        if (activePage) onActivePageChangeAction?.(activePage.number);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePage?.documentId]);

    useEffect(() => {
        // Close the panel and reset tracking whenever the chapter changes.
        setPanelOpen(false);
        setActivePageDocId(sortedPages[0]?.documentId ?? null);
        loadedCounts.current.clear();
        setCommentCounts({});
    }, [chapter.documentId, sortedPages]);

    useEffect(() => {
        if (!scrollTarget) return;

        const targetPage = sortedPages.find(p => p.number === scrollTarget.pageNumber);
        if (!targetPage) return;

        let cancelled = false;

        const scrollToTarget = () => {
            if (cancelled) return;
            const el = pageRefs.current.get(targetPage.documentId);
            if (!el) return;

            const rect  = el.getBoundingClientRect();
            const ratio = scrollTarget.ratio ?? 0;
            const top   = window.scrollY + rect.top + rect.height * ratio;

            window.scrollTo(0, Math.max(0, top));
        };

        scrollToTarget();
        const raf1 = requestAnimationFrame(scrollToTarget);
        const timeout1 = setTimeout(scrollToTarget, 150);
        const timeout2 = setTimeout(scrollToTarget, 500);

        const imgEl = pageRefs.current.get(targetPage.documentId)?.querySelector('img');
        const handleImgLoad = () => scrollToTarget();
        imgEl?.addEventListener('load', handleImgLoad);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf1);
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            imgEl?.removeEventListener('load', handleImgLoad);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollTarget?.pageNumber, scrollTarget?.ratio, chapter.documentId, sortedPages]);

    const handleClosePanel = useCallback(() => setPanelOpen(false), []);

    useEffect(() => {
        if (!panelOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClosePanel(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [panelOpen, handleClosePanel]);

    useEffect(() => {
        const body = document.body;

        if (panelOpen) {
            const scrollY = window.scrollY;
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            body.dataset.stripScrollLock = String(scrollY);
            body.style.overflow     = 'hidden';
            body.style.paddingRight = `${scrollbarWidth}px`;
            return;
        }

        const lockedScrollY = body.dataset.stripScrollLock;
        body.style.overflow     = '';
        body.style.paddingRight = '';
        delete body.dataset.stripScrollLock;

        if (lockedScrollY !== undefined) {
            window.scrollTo(0, parseInt(lockedScrollY, 10) || 0);
        }
    }, [panelOpen]);

      useEffect(() => {
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            delete document.body.dataset.stripScrollLock;
        };
    }, []);

    const activeCount = activePage ? commentCounts[activePage.documentId] : undefined;

    return (
        <div className={styles.stripContainer}>
            <div className={styles.stripPages}>
                {sortedPages.map(page => (
                    <StripPage
                        key={page.documentId}
                        page={page}
                        strDomain={strDomain}
                        width={width}
                        registerRefAction={registerRef}
                    />
                ))}
            </div>

            <button
                type="button"
                className={`${styles.commentsFab} ${panelOpen ? styles.commentsFabActive : ''}`}
                onClick={() => setPanelOpen(open => !open)}
                aria-label={activePage ? `Комментарии к странице ${activePage.number}` : 'Комментарии'}
                title={activePage ? `Комментарии к странице ${activePage.number}` : 'Комментарии'}
            >
                <IonIcon src="/icons/chatbubbles-outline.svg" />
                {!!activeCount && activeCount > 0 && (
                    <span className={styles.commentsFabBadge}>
                        {activeCount > 99 ? '99+' : activeCount}
                    </span>
                )}
            </button>

            <div className={`${styles.commentsOverlay} ${panelOpen ? styles.commentsOverlayVisible : ''}`}>
                <div className={styles.commentsOverlayBackdrop} onClick={handleClosePanel} />
                <div className={`${styles.commentsSidebar} ${panelOpen ? styles.commentsSidebarVisible : ''}`}>
                    <div className={styles.commentsSidebarHeader}>
                        <span className={styles.commentsSidebarTitle}>
                            {activePage ? `Страница ${activePage.number}` : ''}
                        </span>
                        <button
                            type="button"
                            className={styles.commentsSidebarCloseBtn}
                            onClick={handleClosePanel}
                            aria-label="Закрыть комментарии"
                        >
                            <IonIcon src="/icons/close-outline.svg" />
                        </button>
                    </div>
                    <div className={styles.commentsSidebarBody}>
                        {activePage && (
                            <Comments
                                key={activePage.documentId}
                                contentType="api::manga-page.manga-page"
                                contentId={activePage.documentId}
                                embedded
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}