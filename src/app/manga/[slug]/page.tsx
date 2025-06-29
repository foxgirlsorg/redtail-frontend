import React from 'react';
import { notFound } from 'next/navigation';
import { getFooter } from '@/lib/strapiClient';
import { ClientImage } from '@/components/ClientImage/ClientImage';
import styles from './page.module.css';
import { InfoBox } from '@/components/TitlePage/InfoBox/InfoBox';
import { TitleTabBox } from '@/components/TitlePage/TitleTabBox/TitleTabBox';
import { GoBackBtn } from '@/components/TitlePage/GoBackBtn/GoBackBtn';
import { Footer } from '@/components/Footer/Footer';
import { ReadButton } from '@/components/Button/ReadButton';

import { cache } from 'react';
import { getManga as _getManga } from '@/lib/strapiClient';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

const getManga = cache(async (slug: string) => {
    return await _getManga(slug);
});

export async function generateMetadata(
    { params }: { params: { slug: string } }
) {
    const title_data = await getManga(params.slug);

    if (!title_data || title_data.length === 0) {
        return {
            title: 'Манга не найдена | RedTail',
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

export default async function MangaPage(
    { params }: { params: { slug: string } }
) {
    const { slug } = params;

    const title_data = await getManga(slug);
    const footer = await getFooter();

    if (title_data.length === 0) {
        notFound();
    }

    const title = title_data[0];

    return (
        <main>
            <GoBackBtn />
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
                            <ReadButton title={title} />
                        </div>
                    </div>
                    <div className={styles.infoBox}>
                        <InfoBox title={title} />
                    </div>
                </div>
                <div className={styles.titleTabBox}>
                    <TitleTabBox title={title} strDomain={STRAPI_DOMAIN} />
                </div>
            </div>
            <Footer footer={footer} />
        </main>
    );
}
