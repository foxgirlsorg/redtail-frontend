import React from 'react';
import { notFound } from 'next/navigation';
import { getFooter, getAuthor as _getAuthor } from '@/lib/strapiClient';
import styles from './page.module.css';
import mainPageStyles from '@/app/page.module.css';
import { ClientImage } from '@/components/ClientImage/ClientImage';
import { TitleCard } from '@/components/TitleCard/TitleCard';
import { Footer } from '@/components/Footer/Footer';
import {createScopedLoader} from "@/lib/createScopedLoader";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

const getAuthor = createScopedLoader((nickname: string) => _getAuthor(nickname))

type pageProps = Promise<{ nickname: string }>;

export async function generateMetadata({ params }: { params: pageProps }) {
    const { nickname } = await params;
    const nickname_decoded = decodeURI(nickname);
    const authors = await getAuthor(nickname_decoded);
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

export default async function MangaPage({ params }: { params: pageProps }) {
    const { nickname } = await params;
    const nickname_decoded = decodeURI(nickname);
    const authors = await getAuthor(nickname_decoded);
    const footer = await getFooter();
    console.log(authors.length);
    if (authors.length === 0) {
        notFound();
    }

    const author = authors[0];

    return (
        <main>
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
            {author.manga_titles.length > 0 && (
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
            )}
            {author.book_titles.length > 0 && (
                <div className={styles.section}>
                    <h2 className={mainPageStyles.sectionTitle}>Книги</h2>
                    <div className={mainPageStyles.cardListWrapper}>
                        <ul className={mainPageStyles.cardList}>
                            {author.book_titles.map((book: any) => (
                                <TitleCard
                                    title={book}
                                    key={book.id}
                                    strDomain={STRAPI_DOMAIN}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <Footer footer={footer} />
        </main>
    );
}
