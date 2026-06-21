import { getBookChaptersFromSlug as getChaptersFromSlug } from '@/lib/strapiClient';
import { notFound } from 'next/navigation';

import {BookReader} from "@/components/Reader/MainReader/BookReader";
import {Metadata} from "next";
import type { Chapter } from '@/components/Reader/MainReader/BookReader';

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN;

type pageProps = Promise<{ slug: string, chapter: string }>;

export async function generateMetadata({ params }: { params: pageProps }) : Promise<Metadata> {
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
        <BookReader chapters={chapters} chapter={chapter} strDomain={STRAPI_DOMAIN} />
    );
}
