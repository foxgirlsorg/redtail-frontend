import React from 'react';
import { notFound } from 'next/navigation';
import {getManga} from "@/lib/strapiClient";
import { ClientImage } from "@/components/ClientImage/ClientImage";
import styles from "./page.module.css"
import {IonIcon} from "@/components/IonIcon";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

interface PageProps {
    params: { slug: string };
}

export default async function MangaPage({ params }: PageProps) {
    const { slug } = await params;
    const title_data = await getManga(slug);
    if (title_data.length === 0) {
        notFound()
    }
    const title = title_data[0]
    return (
        <main>
            <div className={styles.container}>
                <div className={styles.infoBlock}>
                    <div className={styles.cover}>
                        <ClientImage
                            src={STRAPI_DOMAIN + title.cover?.url}
                            preview={STRAPI_DOMAIN + title.cover?.formats?.medium?.url}
                        />
                    </div>
                    <div className={styles.info}>
                        <h1>{title.name}</h1>

                        <div className={styles.links}>
                            {title.mangalib_url && (
                                <a href={title.mangalib_url} target="_blank">
                                    <IonIcon src="/icons/mangalib.svg"/>
                                </a>
                            )}
                            {title.readmanga_url && (
                                <a href={title.readmanga_url} target="_blank">
                                    <IonIcon src="/icons/readmanga.svg"/>
                                </a>
                            )}
                            {title.remanga_url && (
                                <a href={title.remanga_url} target="_blank">
                                    <IonIcon src="/icons/remanga.svg"/>
                                </a>
                            )}
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Год выпуска</span>
                            <br/>
                            <span className={styles.infoItemValue}>{title.release_year}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Статус</span>
                            <br/>
                            <span className={styles.infoItemValue}>{title.release_status}</span>
                        </div>
                        {title.authors && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Автор</span>
                                <br/>
                                {title.authors.map((author, i) => (
                                    <span key={i}>{author.name}</span>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
                <div className={styles.chaptersBlock}></div>
            </div>
        </main>
    );
}
