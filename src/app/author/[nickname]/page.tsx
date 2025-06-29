import React from 'react';
import { notFound } from 'next/navigation';
import {getFooter, getAuthor} from "@/lib/strapiClient";
import styles from './page.module.css';
import mainPageStyles from '@/app/page.module.css'
import { ClientImage } from '@/components/ClientImage/ClientImage';
import {MemberCard} from "@/components/MemberCard/MemberCard";
import {TitleCard} from "@/components/TitleCard/TitleCard";
import {Footer} from "@/components/Footer/Footer";
import {GoBackBtn} from "@/components/TitlePage/GoBackBtn/GoBackBtn";

const STRAPI_DOMAIN= process.env.PUBLIC_STRAPI_DOMAIN;

interface PageProps {
    params: { nickname: string };
}

export default async function MangaPage(props: PageProps) {
    // noinspection ES6RedundantAwait
    const params = await Promise.resolve(props.params);
    const nickname = params.nickname;
    const authors = await getAuthor(nickname)
    const footer = await getFooter();
    if (authors.length === 0) {
        notFound()
    }
    const author = authors[0];
    return (
        <main>
           <GoBackBtn/>
           <div className={styles.container}>
               <div className={styles.card}>
                   <ClientImage className={styles.photo} src={STRAPI_DOMAIN + author.photo.url} thumbnail={STRAPI_DOMAIN + author.photo.formats.small.url} />
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
                        {author.manga_titles.map((manga:any) => {
                            return (
                                <TitleCard title={manga} key={manga.id} strDomain={STRAPI_DOMAIN}></TitleCard>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <Footer footer={footer}></Footer>
        </main>
    );
}
