import { getChaptersFromSlug as _getChaptersFromSlug } from '@/lib/strapiClient';
import { MainReader } from '@/components/Reader/Manga/MainReader/MainReader';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

// ✅ Кэшируем загрузку
const getChaptersFromSlug = cache(async (slug: string) => {
    return await _getChaptersFromSlug(slug);
});

export async function generateMetadata(
    { params }: { params: { slug: string; chapter: string } }
) {
    const chapters = await getChaptersFromSlug(params.slug);

    if (!chapters || chapters.length === 0) {
        return {
            title: 'Глава не найдена',
        };
    }

    const currentChapter = chapters.find((c: any) => c.number.toString() === params.chapter);

    return {
        title: currentChapter
            ? `${currentChapter.title.name} | Глава ${currentChapter.number} | RedTail`
            : `Глава ${params.chapter} | RedTail`,
        description: currentChapter ? ` Читать ${currentChapter.title.name} в переводе от RedTail` : `Глава ${params.chapter} | RedTail`,
    };
}

export default async function ReaderMangaPage(
    { params }: { params: { slug: string; chapter: string } }
) {
    const { slug, chapter } = params;

    const chapters = await getChaptersFromSlug(slug);

    if (chapters.length === 0) {
        notFound();
    }

    return (
        <MainReader chapters={chapters} chapter={chapter} strDomain={STRAPI_DOMAIN} />
    );
}
