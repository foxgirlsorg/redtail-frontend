import React from 'react';
import { notFound } from 'next/navigation';
import { getFooter, getAuthor as _getAuthor } from '@/lib/strapiClient';
import styles from './page.module.css';
import mainPageStyles from '@/app/page.module.css';
import { ClientImage } from '@/components/ClientImage/ClientImage';
import { TitleCard } from '@/components/TitleCard/TitleCard';
import { Footer } from '@/components/Footer/Footer';
import { GoBackBtn } from '@/components/TitlePage/GoBackBtn/GoBackBtn';
import { cache } from 'react';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

const getAuthor = cache(async (nickname: string) => {
    return await _getAuthor(nickname);
});

export async function generateMetadata(params:any) {
    const { nickname } = await params;
    const authors = await getAuthor(nickname);

    if (!authors || authors.length === 0) {
        notFound();
    }

    const author = authors[0];

    return {
        title: `Автор: ${author.name} | RedTail`,
        description: author.description?.slice(0, 150),
        openGraph: {
            title: `Автор: ${author.name} |`,
            description: author.description?.slice(0, 150),
            images: [
                {
                    url: STRAPI_DOMAIN + author.photo?.url,
                },
            ],
        },
    };
}

export default async function MangaPage(params:any) {
    const { nickname } = await params;
    const authors = await getAuthor(nickname);
    const footer = await getFooter();

    if (authors.length === 0) {
        notFound();
    }

    const author = authors[0];

    return (
        <main>
            <GoBackBtn />
            <div className={styles.container}>
                <div className={styles.card}>
                    <ClientImage
                        className={styles.photo}
                        src={STRAPI_DOMAIN + author.photo.url}
                        thumbnail={STRAPI_DOMAIN + author.photo.formats.small.url}
                    />
                    <div className={styles.description}>
                        <h1>{author.name}</h1>
                        <p>{author.description}</p>
                    </div>
                </div>
            </div>
            <div className={styles.section}>
                <h2 className={mainPageStyles.sectionTitle}>Манга</h2>
                <div className={mainPageStyles.cardListWrapper}>
                    <ul className={mainPageStyles.cardList}>
                        {author.manga_titles.map((manga: any) => (
                            <TitleCard
                                title={manga}
                                key={manga.id}
                                strDomain={STRAPI_DOMAIN}
                            />
                        ))}
                    </ul>
                </div>
            </div>
            <Footer footer={footer} />
        </main>
    );
}
