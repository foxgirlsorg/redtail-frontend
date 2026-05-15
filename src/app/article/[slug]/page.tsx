import React from 'react';
import { notFound } from 'next/navigation';
import { getFooter } from '@/lib/strapiClient';
import { Footer } from '@/components/Footer/Footer';
import { createScopedLoader } from '@/lib/createScopedLoader';
import { getArticle as _getArticle } from '@/lib/strapiClient';
import styles from './page.module.css'
import {IonIcon} from "@/components/IonIcon";
import '@/styles/markdown.css';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {SmallMemberCard} from "@/components/SmallMemberCard/SmallMemberCard";
import CusdisComments from "@/components/CusdisComments";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN!;
const CUSDIS_HOST = process.env.CUSDIS_HOST!;
const CUSDIS_APP_ID = process.env.CUSDIS_APP_ID!;


const getArticle = createScopedLoader((slug: string) => _getArticle(slug))

type pageProps = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: pageProps }) {
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
                                    <SmallMemberCard
                                        key={i}
                                        strDomain={STRAPI_DOMAIN}
                                        nickname={author.name}
                                        imgUrl={author.photo?.formats?.thumbnail?.url}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {article.members_worked_on && (
                        <div className={styles.infoItem}>
                            <h3 className={styles.title}>Над переводом работали</h3>
                            <div className={styles.smallCards}>
                                {article.members_worked_on.map((member: any, i: number) => (
                                    <SmallMemberCard
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
                <div className={styles.comments}>
                    <CusdisComments
                        host={CUSDIS_HOST}
                        appId={CUSDIS_APP_ID}
                        pageId={article.documentId}
                        pageTitle={`Article |  ${article.name}`}
                        bgColor="#161616"
                    />
                </div>

            </div>
            <Footer footer={footer} />
        </main>
    );
}
