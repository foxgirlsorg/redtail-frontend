import { getChaptersFromSlug as _getChaptersFromSlug } from '@/lib/strapiClient';
import { MainReader } from '@/components/Reader/Manga/MainReader/MainReader';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

const getChaptersFromSlug = cache(async (slug: string) => {
    return await _getChaptersFromSlug(slug);
});

export async function generateMetadata(params:any) {
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

export default async function ReaderMangaPage(params:any) {
    const { slug, chapter } = await params;

    const chapters = await getChaptersFromSlug(slug);

    if (chapters.length === 0) {
        notFound();
    }

    return (
        <MainReader chapters={chapters} chapter={chapter} strDomain={STRAPI_DOMAIN} />
    );
}
