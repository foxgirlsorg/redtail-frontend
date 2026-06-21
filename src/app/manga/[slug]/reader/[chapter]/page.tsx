import { getMangaChaptersFromSlug as getChaptersFromSlug } from '@/lib/strapiClient';
import { MangaReader } from '@/components/Reader/MainReader/MangaReader';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import {Metadata} from "next";
import type { Chapter } from '@/components/Reader/MainReader/MangaReader';

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN;

type pageProps = Promise<{ slug: string, chapter: string }>;

export async function generateMetadata({ params }: { params: pageProps })  : Promise<Metadata> {
    const { slug, chapter } = await params;
    const chapters = await getChaptersFromSlug(slug);

    if (!chapters || chapters.length === 0) {
        return {
            title: 'Глава не найдена',
        };
    }

    const currentChapter = chapters.find((c: any) => c.number.toString() === chapter);

    return {
        title: currentChapter
            ? `${currentChapter.title.name} | Глава ${currentChapter.number} | RedTail`
            : `Глава ${chapter} | RedTail`,
        description: currentChapter ? ` Читать ${currentChapter.title.name} в переводе от RedTail` : `Глава ${chapter} | RedTail`,
    };
}

export default async function ReaderMangaPage({ params }: { params: pageProps }) {
    const { slug, chapter } = await params;

    const chapters = await getChaptersFromSlug(slug) as any as Chapter[]

    if (chapters.length === 0) {
        notFound();
    }

    return (
        <MangaReader chapters={chapters} chapter={chapter} strDomain={STRAPI_DOMAIN}/>
    );
}
