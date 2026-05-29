'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import stylesChapterButton from '@/components/TitlePage/ChapterButton/ChapterButton.module.css';
import { IonIcon } from '@/components/IonIcon';

type Title = { slug: string; name: string; type: string };
type Chapter = { number: number; name?: string; title: Title };

type NavbarProps = {
    chapters: Chapter[];
    chapterIndex: number;
    conetntWidth: number;
    setContentWidthAction: React.Dispatch<React.SetStateAction<number>>;
    NavigateToAction: (chapterIndex: number, pageIndex: number) => void;
};

export default function Navbar({
                                   chapters,
                                   chapterIndex,
                                   NavigateToAction,
                                   setContentWidthAction,
                                   conetntWidth,
                               }: NavbarProps) {
    const router = useRouter();
    const [navbarVisible,  setNavbarVisible]  = useState(true);
    const [sidebarOpened, setSidebarOpened] = useState(false);
    const [lastScroll,     setLastScroll]     = useState(0);

    const currentChapter = chapters[chapterIndex];
    const hasPrev = chapterIndex > 0;
    const hasNext = chapterIndex < chapters.length - 1;
    const type    = ['Книга', 'Ранобэ', 'Рассказ'].includes(currentChapter?.title.type)
        ? 'book'
        : 'manga';
    const sortedChapters = React.useMemo(
        () => [...chapters].sort((a, b) => b.number - a.number),
        [chapters],
    );
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setNavbarVisible(y < 100 || y < lastScroll);
            setLastScroll(y);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [lastScroll]);
    useEffect(() => {
        const body = document.body;
        if (sidebarOpened) {
            const scrollY = window.scrollY;
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            body.style.overflow     = 'hidden';
            body.style.paddingRight = `${scrollbarWidth}px`;
            body.setAttribute('data-scroll-lock', scrollY.toString());
        } else {
            const scrollY = parseInt(body.getAttribute('data-scroll-lock') ?? '0');
            body.style.overflow     = '';
            body.style.paddingRight = '';
            body.removeAttribute('data-scroll-lock');
            window.scrollTo(0, scrollY);
        }
    }, [sidebarOpened]);

    const handleBack = () => router.push(`/${type}/${currentChapter.title.slug}`);

    const closeSidebarAndNavigate = (realIndex: number) => {
        setSidebarOpened(false);
        setTimeout(() => NavigateToAction(realIndex, 0), 300);
    };

    if (!currentChapter) return null;

    return (
        <>
            {}
            <div className={`${styles.navbar} ${navbarVisible ? styles.visible : styles.hidden}`}>

                {}
                <div className={styles.leftSide}>
                    <div className={styles.backContainer} onClick={handleBack}>
                        <IonIcon src="/icons/arrow-back-outline.svg" className={styles.backButton} />
                        <div>
                            <h3 className={styles.titleName}>{currentChapter.title.name}</h3>
                            <span className={styles.chapterTitleMobile}>Глава {currentChapter.number} - {currentChapter.name}</span>
                        </div>
                    </div>

                    {}
                    <div className={styles.chapterSwitch}>
                        <IonIcon
                            src="/icons/chevron-back-outline.svg"
                            className={`${styles.chapterSwitchIcon} ${!hasPrev ? styles.disabled : ''}`}
                            onClick={() => hasPrev && NavigateToAction(chapterIndex - 1, 0)}
                        />
                        <div
                            className={styles.contentsSwitch}
                            onClick={() => setSidebarOpened(true)}
                        >
                            <span className={styles.chapterSwitchContentsLabel}>Оглавление</span>
                            <h4>Глава {currentChapter.number}</h4>
                        </div>
                        <IonIcon
                            src="/icons/chevron-forward-outline.svg"
                            className={`${styles.chapterSwitchIcon} ${!hasNext ? styles.disabled : ''}`}
                            onClick={() => hasNext && NavigateToAction(chapterIndex + 1, 0)}
                        />
                    </div>
                </div>

                {}
                <div className={styles.rightSide}>
                    <div className={styles.slider}>
                        <span className={styles.widthSliderLabel}>
                            Ширина: {conetntWidth}%
                        </span>
                        <input
                            className={styles.widthSlider}
                            type="range"
                            min="20"
                            max="100"
                            value={conetntWidth}
                            onChange={e => setContentWidthAction(Number(e.target.value))}
                        />
                    </div>
                </div>

                {}
                <div
                    className={styles.burgerButton}
                    onClick={() => setSidebarOpened(true)}
                    aria-label="Оглавление"
                >
                    <IonIcon src="/icons/menu-outline.svg" />
                </div>
            </div>

            {}
            <div className={`${styles.contents} ${sidebarOpened ? styles.contentsVisible : ''}`}>
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpened(false)}
                />
                <div className={`${styles.sidebar} ${sidebarOpened ? styles.sidebarVisible : styles.sidebarHidden}`}>
                    <div className={styles.sidebarHeader}>
                        <span className={styles.sidebarTitle}>Список глав</span>
                        <div
                            className={styles.sidebarCloseButton}
                            onClick={() => setSidebarOpened(false)}
                        >
                            <IonIcon src="/icons/close-outline.svg" />
                        </div>
                    </div>

                    <div className={styles.sidebarChapterList}>
                        {sortedChapters.map((chapter) => {
                            const realIndex = chapters.findIndex(c => c.number === chapter.number);
                            return (
                                <div
                                    key={chapter.number}
                                    className={`${stylesChapterButton.chapterButton} ${
                                        realIndex === chapterIndex ? stylesChapterButton.disabled : ''
                                    }`}
                                    onClick={() => realIndex !== chapterIndex && closeSidebarAndNavigate(realIndex)}
                                >
                                    <span className={stylesChapterButton.chapterNumber}>
                                        Глава {chapter.number}
                                        {chapter.name && (
                                            <span className={stylesChapterButton.chapterName}>
                                                {' '}- {chapter.name}
                                            </span>
                                        )}
                                    </span>
                                    <IonIcon src="/icons/chevron-forward-outline.svg" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}