'use client';
import { useRouter, usePathname } from 'next/navigation';
import styles from '@/components/TitlePage/ChapterButton/ChapterButton.module.css'
import React from "react";
import {IonIcon} from "@/components/IonIcon";

const NEW_CHAPTER_THRESHOLD_MS = 120 * 60 * 60 * 1000;

interface ChapterButtonProps {
    chapter: any;
    slug: string;
}

export const ChapterButton = ({chapter, slug}: ChapterButtonProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const isNew = React.useMemo(() => {
        const date = chapter.createdAt;
        if (!date) return false;
        return Date.now() - new Date(date).getTime() < NEW_CHAPTER_THRESHOLD_MS;
    }, [chapter.publishedAt, chapter.createdAt]);

    const handleClick = () => {
        router.push(`${pathname}/reader/${chapter.number}`);
    };

    return (
        <div className={styles.chapterButton} onClick={handleClick}>
            <span className={styles.chapterNumber}>Глава {chapter.number}
                {chapter.name && (
                    <span className={styles.chapterName}> - {chapter.name}</span>
                )}
            </span>
            <span className={styles.chapterRight}>
                {isNew && <span className={styles.newBadge}>Новое</span>}
                <IonIcon src="/icons/chevron-forward-outline.svg" />
            </span>
        </div>
    );
}