import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFooter } from '@/lib/strapiClient';
import { Footer } from '@/components/Footer/Footer';

import { getArticle } from '@/lib/strapiClient';
import styles from './page.module.css'
import {IonIcon} from "@/components/IonIcon";
import '@/styles/markdown.css';
import { Comments } from '@/components/Comments';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {MemberPill} from "@/components/MemberPill/MemberPill";

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN!;

type pageProps = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: pageProps }) : Promise<Metadata> {
    const { slug } = await params;
    const article_data = await getArticle(slug);
    if (!article_data || article_data.length === 0) {
        return {
            title: 'Статья не найдена| RedTail',
        };
    }

    const article = article_data[0];


    return {
        title: `${article.name} | RedTail`,
        description: article.description?.slice(0, 150),
        openGraph: {
            title: `${article.name} — Перевод от RedTail`,
            description: article.description?.slice(0, 150),
        },
    };
}

export default async function MangaPage({ params }:{ params: pageProps}) {
    const { slug } = await params;

    const article_data = await getArticle(slug);
    const footer = await getFooter();
    if (article_data.length === 0) {
        notFound();
    }

    const article = article_data[0];
    const published_at = new Date(article.publishedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric'}).replace(',', '');

    return (
        <main>
            <div className={styles.header}>
                <a className={styles.left} href="/">
                    <IonIcon src="/icons/redtail.svg"></IonIcon>
                    <span className={styles.teamname}>REDTAIL</span>
                </a>
                <div className={styles.right}>
                    <span className={styles.publishedAt}>Опубликовано </span>
                    <span>{published_at}</span>
                </div>
            </div>

            <div className={styles.container}>
                <div className={`markdown-body ${styles.markdown}`}>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {article.content}
                    </ReactMarkdown>
                </div>


                <div className={styles.info}>
                    {article.source_url && (
                        <div className={styles.infoItem}>
                            <h3 className={styles.title}>Источник</h3>
                            <a href={article.source_url}>{article.source_url}</a>
                        </div>
                    )}

                    {article.authors && (
                        <div className={styles.infoItem}>
                            <h3 className={styles.title}>{article.authors.length > 1 ? "Авторы" : "Автор"}</h3>
                            <div className={styles.smallCards}>
                                {article.authors.map((author: any, i: number) => (
                                    <MemberPill
                                        key={i}
                                        strDomain={STRAPI_DOMAIN}
                                        nickname={author.name}
                                        imgUrl={author.photo?.formats?.thumbnail?.url}
                                        url={!author.hidden ? `/author/${author.name}` : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {article.related_authors && (
                        <div className={styles.infoItem}>
                            <h3 className={styles.title}>Связано с</h3>
                            <div className={styles.smallCards}>
                                {article.related_authors.map((author: any, i: number) => (
                                    <MemberPill
                                        key={i}
                                        strDomain={STRAPI_DOMAIN}
                                        nickname={author.name}
                                        imgUrl={author.photo?.formats?.thumbnail?.url}
                                        url={!author.hidden ? `/author/${author.name}` : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}


                    {article.members_worked_on && (
                        <div className={styles.infoItem}>
                            <h3 className={styles.title}>{article.members_worked_on.length > 1 ? "Переводчики" : "Переводчик"}</h3>
                            <div className={styles.smallCards}>
                                {article.members_worked_on.map((member: any, i: number) => (
                                    <MemberPill
                                        key={i}
                                        strDomain={STRAPI_DOMAIN}
                                        nickname={member.nickname}
                                        imgUrl={member.image?.formats?.thumbnail?.url}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
                <div className={styles.markdown} style={{ marginTop: 0, paddingTop: 0 }}>
                    <Comments
                        contentType="api::article.article"
                        contentId={article.documentId}
                    />
                </div>
            </div>
            <Footer footer={footer} />
        </main>
    );
}
