import { getChaptersFromSlug as _getChaptersFromSlug } from '@/lib/strapiClient';
import { MainReader } from '@/components/Reader/Manga/MainReader/MainReader';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import {createScopedLoader} from "@/lib/createScopedLoader";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

const getChaptersFromSlug = createScopedLoader((slug: string) => _getChaptersFromSlug(slug));

type pageProps = Promise<{ slug: string, chapter: string }>;

export async function generateMetadata({ params }: { params: pageProps }) {
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

    const chapters = await getChaptersFromSlug(slug);

    if (chapters.length === 0) {
        notFound();
    }

    return (
        <MainReader chapters={chapters} chapter={chapter} strDomain={STRAPI_DOMAIN} />
    );
}
