import {getChaptersFromSlug} from "@/lib/strapiClient";
import {MainReader} from "@/components/Reader/Manga/MainReader/MainReader";

const STRAPI_DOMAIN= process.env.PUBLIC_STRAPI_DOMAIN;

interface PageProps {
    params: { slug: string; chapter: string };
}

export default async function ReaderMangaPage(props: PageProps) {
    // noinspection ES6RedundantAwait
    const params = await Promise.resolve(props.params);
    const slug = params.slug;
    const chapter = params.chapter;

    const chapters = await getChaptersFromSlug(slug);
    return (
        <MainReader chapters={chapters} chapter={chapter} strDomain={STRAPI_DOMAIN} />
    )
}