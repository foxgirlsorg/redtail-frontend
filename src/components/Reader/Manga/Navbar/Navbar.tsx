'use client';

import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import stylesChapterButton from '@/components/TitlePage/TitleTabBox/ChapterButton/ChapterButton.module.css'
import {IonIcon} from "@/components/IonIcon";
import {useRouter} from "next/navigation";


type NavbarProps = {
    conetntWidth: number;
    setContentWidthAction: React.Dispatch<React.SetStateAction<number>>;
    chapters: any;
    chapterIndex: number;
    NavigateToAction: (chapterIndex: number, pageIndex: number) => void;
};

export default function Navbar({chapters, chapterIndex, NavigateToAction, setContentWidthAction, conetntWidth}: NavbarProps) {
    const [navbarVisible, setNavbarVisible] = useState(true);
    const [lastScroll, setLastScroll] = useState(0);
    const currentChapter = chapters[chapterIndex];
    const hasPrev = chapterIndex > 0;
    const hasNext = chapterIndex < chapters.length - 1;
    const router = useRouter();
    const [sidebarOpened, setSidebarOpened] = useState(false);
    const type = ["Книга", "Ранобэ", "Рассказ"].includes(currentChapter.title.type) ? "book" : "manga";
    const handleBackButton = () => {
        router.push(`/${type}/${currentChapter.title.slug}`);
    };

    useEffect(() => {
        const onScroll = () => {
            const current = window.scrollY;

            if (current > lastScroll && current > 100) {
                setNavbarVisible(false);
            } else {
                setNavbarVisible(true);
            }

            setLastScroll(current);
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [lastScroll, setNavbarVisible]);

    useEffect(() => {
        const body = document.body;

        if (sidebarOpened) {
            const scrollY = window.scrollY;
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.left = '0';
            body.style.right = '0';
            body.style.overflow = 'hidden';
            body.style.width = '100%';
            body.setAttribute('data-scroll-lock', scrollY.toString());
        } else {
            const scrollY = parseInt(body.getAttribute('data-scroll-lock') || '0');
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.overflow = '';
            body.style.width = '';
            body.removeAttribute('data-scroll-lock');

            window.scrollTo(0, scrollY);
        }
    }, [sidebarOpened]);

    const closeSidebarAndNavigate = (chapterIdx: number, pageIdx: number) => {
        setSidebarOpened(false);
        setTimeout(() => {
            NavigateToAction(chapterIdx, pageIdx);
        }, 300);
    };
    return (
        <div>
            <div className={`${styles.navbar} ${navbarVisible ? styles.visible : styles.hidden}`}>
                <div className={styles.leftSide}>
                    <div className={styles.backContainer}>
                        <IonIcon
                            src="/icons/arrow-back-outline.svg"
                            onClick={() => handleBackButton()}
                            className={styles.backButton}
                        />
                        <div onClick={() => {(window.innerWidth < 800) ? setSidebarOpened(!sidebarOpened) : handleBackButton()}}>
                            <h3 className={styles.titleName}>{currentChapter.title.name}</h3>
                            <span className={styles.chapterTitleMobile}>Глава {currentChapter.number} - {currentChapter.name}</span>
                        </div>
                    </div>

                    <div className={styles.chapterSwitch}>
                        <IonIcon
                            src="/icons/chevron-back-outline.svg"
                            className={`${styles.chapterSwitchIcon} ${!hasPrev ? styles.disabled : ''}`}
                            onClick={() => {
                                if (!hasPrev) return;
                                NavigateToAction(chapterIndex - 1, 0);
                            }}
                        />
                        <div className={styles.contentsSwitch} onClick={() => {setSidebarOpened(!sidebarOpened)}}>
                            <span className={styles.chapterSwitchContentsLabel}>Оглавление</span>
                            <h4>Глава {currentChapter.number}</h4>
                        </div>
                        <IonIcon
                            src="/icons/chevron-forward-outline.svg"
                            className={`${styles.chapterSwitchIcon} ${!hasNext ? styles.disabled : ''}`}
                            onClick={() => {
                                if (!hasNext) return;
                                NavigateToAction(chapterIndex + 1, 0);
                            }}
                        />
                    </div>

                </div>

                <div className={styles.rightSide}>
                    <div className={styles.slider}>
                        <span className={styles.widthSliderLabel}>Ширина: {conetntWidth}%</span>
                        <input
                            className={styles.widthSlider}
                            type="range"
                            min="20"
                            max="100"
                            value={conetntWidth}
                            onChange={(e) => setContentWidthAction(Number(e.target.value))}

                        />
                    </div>
                </div>
            </div>
            <div className={`${styles.contents} ${sidebarOpened ? styles.contentsVisible : styles.contentsHidden}`}>
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpened(false)}
                />
                <div className={`${styles.sidebar} ${sidebarOpened ? styles.sidebarVisible : styles.sidebarHidden}`}>
                    <div className={styles.sidebarTitleButton} onClick={() => {setSidebarOpened(!sidebarOpened)}}>
                        <IonIcon
                            src="/icons/arrow-back-outline.svg"
                            className={styles.backButton}
                        />
                        <h3>Список глав</h3>

                    </div>
                    <div className={styles.sidebarChapterList}>
                        {chapters
                            .slice()
                            .reverse()
                            .map((chapter: any, i: number) => {
                                const realIndex = chapters.length - 1 - i;

                                return (
                                    <div
                                        key={realIndex}
                                        className={`${stylesChapterButton.chapterButton} ${
                                            realIndex === chapterIndex ? stylesChapterButton.disabled : ""
                                        }`}
                                        onClick={() => closeSidebarAndNavigate(realIndex, 0)}
                                    >
                                        <span className={stylesChapterButton.chapterNumber}>
                                            Глава {chapter.number}
                                            {chapter.name && (
                                                <span className={stylesChapterButton.chapterName}> - {chapter.name}</span>
                                            )}
                                        </span>
                                        <IonIcon src="/icons/chevron-forward-outline.svg" />
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}
