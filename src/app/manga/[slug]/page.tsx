import React from 'react';
import { notFound } from 'next/navigation';
import {getManga} from "@/lib/strapiClient";
import { ClientImage } from "@/components/ClientImage/ClientImage";
import styles from "./page.module.css"
import {IonIcon} from "@/components/IonIcon";
import {RouterButton} from "@/components/Button/RouterButton";
import {InfoBox} from "@/components/TitlePage/InfoBox";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

interface PageProps {
    params: { slug: string };
}

export default async function MangaPage({ params }: PageProps) {
    const { slug } = params;
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
                            thumbnail={STRAPI_DOMAIN + title.cover?.formats?.medium?.url}
                            className={styles.coverImg}
                        />
                    </div>
                    <div className={styles.info}>
                        <h1 className={styles.title}>{title.name}</h1>
                        <RouterButton
                            text="Читать"
                            iconSrc="/icons/arrow-forward-outline.svg"
                            location={`/manga/${title.slug}/`}
                        />

                    <InfoBox title={title}/>
                    </div>
                </div>
                <div className={styles.chaptersBlock}>

                </div>
            </div>
        </main>
    );
}
