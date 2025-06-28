import React from 'react';
import { notFound } from 'next/navigation';
import {getFooter, getManga} from "@/lib/strapiClient";
import { ClientImage } from "@/components/ClientImage/ClientImage";
import styles from "./page.module.css"
import {RouterButton} from "@/components/Button/RouterButton";
import {InfoBox} from "@/components/TitlePage/InfoBox/InfoBox";
import {TitleTabBox} from "@/components/TitlePage/TitleTabBox/TitleTabBox";
import {GoBackBtn} from "@/components/TitlePage/GoBackBtn/GoBackBtn";
import {Footer} from "@/components/Footer/Footer";

const STRAPI_DOMAIN= process.env.PUBLIC_STRAPI_DOMAIN;

interface PageProps {
    params: { slug: string };
}

export default async function MangaPage({ params }: PageProps) {
    const { slug } = await params;
    const title_data = await getManga(slug);
    const footer = await getFooter();
    if (title_data.length === 0) {
        notFound()
    }
    const title = title_data[0]
    return (
        <main>
            <GoBackBtn/>
            {title.backdrop && (
                <div
                    className={styles.backdrop}
                    style={{
                        backgroundImage: `url(${STRAPI_DOMAIN + title.backdrop.url})`,
                        aspectRatio: `${title.backdrop.width / title.backdrop.height}`,
                    }}
                />
            )}
            <div className={styles.container}>
                <div className={styles.infoBlock}>
                    <div className={styles.coverBlock}>
                        <div className={styles.cover}>
                            <ClientImage
                                src={STRAPI_DOMAIN + title.cover?.url}
                                thumbnail={STRAPI_DOMAIN + title.cover?.formats?.medium?.url}
                                className={styles.coverImg}
                            />
                        </div>
                        <div className={styles.bTitle}>
                            <h1 className={styles.title}>{title.name}</h1>
                            <RouterButton
                                text="Читать"
                                location={`/manga/${title.slug}/`}
                            />
                        </div>
                    </div>
                    <div className={styles.infoBox}>
                        <InfoBox title={title}/>
                    </div>
                </div>
                <div className={styles.titleTabBox}>
                    <TitleTabBox title={title} strDomain={STRAPI_DOMAIN} />
                </div>
            </div>

            <Footer footer={footer}></Footer>
        </main>
    );
}
