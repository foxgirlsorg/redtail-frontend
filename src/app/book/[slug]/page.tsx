import React from 'react';
import { notFound } from 'next/navigation';
import { getFooter } from '@/lib/strapiClient';
import { ClientImage } from '@/components/ClientImage/ClientImage';
import styles from './page.module.css';
import { InfoBox } from '@/components/TitlePage/InfoBox/InfoBox';
import { TitleTabBox } from '@/components/TitlePage/TitleTabBox/TitleTabBox';
import { Footer } from '@/components/Footer/Footer';
import { ReadButton } from '@/components/Button/ReadButton';
import { createScopedLoader } from '@/lib/createScopedLoader';
import { getBook as _getBook } from '@/lib/strapiClient';
import {Backdrop} from "@/components/TitlePage/Backdrop";
import {GoBackBtn} from "@/components/TitlePage/GoBackBtn/GoBackBtn";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

const getBook = createScopedLoader((slug: string) => _getBook(slug))

type pageProps = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: pageProps }) {
    const { slug } = await params;
    const title_data = await getBook(slug);
    if (!title_data || title_data.length === 0) {
        return {
            title: 'Книга не найдена | RedTail',
        };
    }

    const title = title_data[0];

    return {
        title: `${title.name} | RedTail`,
        description: title.description?.slice(0, 150),
        openGraph: {
            title: `${title.name} — Перевод от RedTail`,
            description: title.description?.slice(0, 150),
            images: [
                {
                    url: STRAPI_DOMAIN + title.cover?.url,
                },
            ],
        },
    };
}

export default async function BookPage({ params }:{ params: pageProps}) {
    const { slug } = await params;

    const title_data = await getBook(slug);
    const footer = await getFooter();

    if (title_data.length === 0) {
        notFound();
    }

    const title = title_data[0];

    return (
        <main>
            <GoBackBtn/>
            {title.backdrop && (
                <Backdrop
                    className={styles.backdrop}
                    backdrop={title.backdrop}
                    domain={STRAPI_DOMAIN}
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
                            <ReadButton title={title} />
                        </div>
                    </div>
                    <div className={styles.infoBox}>
                        <InfoBox title={title} />
                    </div>
                </div>
                <div className={styles.titleTabBox}>
                    <TitleTabBox title={title} strDomain={STRAPI_DOMAIN}/>
                </div>
            </div>
            <Footer footer={footer} />
        </main>
    );
}
