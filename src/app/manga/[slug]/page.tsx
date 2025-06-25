import React from 'react';
import { notFound } from 'next/navigation';
import {getManga} from "@/lib/strapiClient";
import { ClientImage } from "@/components/ClientImage/ClientImage";
import styles from "./page.module.css"

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

interface PageProps {
    params: { slug: string };
}

export default async function MangaPage({ params }: PageProps) {
    const { slug } = await params;
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
                            preview={STRAPI_DOMAIN + title.cover?.formats?.medium?.url}
                        />
                    </div>
                    <div className={styles.info}>
                        <h1>{title.name}</h1>
                    </div>
                </div>
            </div>
        </main>
    );
}
