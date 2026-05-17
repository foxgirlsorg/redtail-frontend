import React from 'react';
import { notFound } from 'next/navigation';
import { getFooter, getAuthor } from '@/lib/strapiClient';

import { ClientImage } from '@/components/ClientImage/ClientImage';
import { TitleCard } from '@/components/TitleCard/TitleCard';
import { ArticleCard } from '@/components/ArticleCard/ArticleCard';
import { Footer } from '@/components/Footer/Footer';
import styles from './page.module.css';
import {Metadata} from "next";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

type pageProps = Promise<{ nickname: string }>;

export async function generateMetadata({ params }: { params: pageProps })  : Promise<Metadata> {
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

export default async function AuthorPage({ params }: { params: pageProps }) {
    const { nickname } = await params;
    const authors = await getAuthor(decodeURI(nickname));
    const footer = await getFooter();

    if (!authors || authors.length === 0) notFound();

    const author = authors[0];
    const hasManga    = author.manga_titles?.length > 0;
    const hasBooks    = author.book_titles?.length > 0;
    const hasArticles = author.articles?.length > 0;
    const hasRelatedArticles = author.related_articles?.length > 0;

    return (
        <main className={styles.page}>


            <div className={styles.backdrop}>
                <div
                    className={styles.backdropImage}
                    style={{ backgroundImage: `url(${STRAPI_DOMAIN + author.photo?.url})` }}
                />
                <div className={styles.backdropVignette} />
                <div className={styles.backdropNoise} />
            </div>


            <div className={styles.container}>
                <div className={styles.hero}>
                    <div className={styles.avatarWrapper}>
                        <ClientImage
                            src={STRAPI_DOMAIN + author.photo?.url}
                            thumbnail={STRAPI_DOMAIN + (author.photo?.formats?.small?.url ?? author.photo?.url)}
                            className={styles.avatar}
                        />
                    </div>

                    <div className={styles.authorMeta}>
                        <h1 className={styles.authorName}>{author.name}</h1>
                        {author.description && (
                            <p className={styles.authorBio}>{author.description}</p>
                        )}
                    </div>
                </div>

              
                <div className={styles.body}>

                    {(hasManga || hasBooks) && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    тайтлы <span>автора</span>
                                </h2>
                            </div>
                            <ul className={styles.titleGrid}>
                                {author.manga_titles.map((manga: any) => (
                                    <TitleCard title={manga} key={manga.id} strDomain={STRAPI_DOMAIN} />
                                ))}
                                {author.book_titles.map((book: any) => (
                                    <TitleCard title={book} key={book.id} strDomain={STRAPI_DOMAIN} />
                                ))}
                            </ul>
                        </section>
                    )}

                    {(hasArticles || hasRelatedArticles) && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    статьи <span>&amp; другое</span>
                                </h2>
                            </div>
                            <ul className={styles.articleGrid}>
                                {author.articles.map((article: any) => (
                                    <ArticleCard article={article} key={article.id} strDomain={STRAPI_DOMAIN} />
                                ))}
                                {author.related_articles.map((article: any) => (
                                    <ArticleCard article={article} key={article.id} strDomain={STRAPI_DOMAIN} />
                                ))}
                            </ul>
                        </section>
                    )}

                </div>
            </div>

            <Footer footer={footer} />
        </main>
    );
}