'use client';
import { useRouter } from 'next/navigation';
import styles from '@/components/TitlePage/TitleTabBox/ChapterButton/ChapterButton.module.css'
import React from "react";
import {IonIcon} from "@/components/IonIcon";

interface ChapterButtonProps {
    chapter: any;
    slug: string;
}

export const ChapterButton = ({chapter, slug}: ChapterButtonProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/manga/${slug}/reader/${chapter.number}`);
    };

    return (
        <div className={styles.chapterButton} onClick={handleClick}>
            <span className={styles.chapterNumber}>Глава {chapter.number}
                <span className={styles.chapterName}> - {chapter.name}</span>
            </span>
            <IonIcon src="/icons/chevron-forward-outline.svg"></IonIcon>
        </div>
    );
}
