import { notFound } from 'next/navigation';
import { getFooter, getBook} from '@/lib/strapiClient';

import { TitlePage } from '@/components/TitlePage/TitlePage';
import {Metadata} from "next";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

type pageProps = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: pageProps })  : Promise<Metadata> {
    const { slug } = await params;
    const title_data = await getBook(slug);
    if (!title_data || title_data.length === 0) {
        return {
            title: 'Книга не найдена | RedTail',
        };
    }

    const title = title_data[0];

    return {
        title: `${title.name} | RedTail`,
        description: title.description?.slice(0, 150),
        openGraph: {
            title: `${title.name} — Перевод от RedTail`,
            description: title.description?.slice(0, 150),
            images: [
                {
                    url: STRAPI_DOMAIN + title.cover?.url,
                },
            ],
        },
    };
}

export default async function BookPage({ params }: { params: pageProps }) {
    const { slug } = await params;
    const data = await getBook(slug);
    const footer = await getFooter();
    if (!data || data.length === 0) notFound();

    return <TitlePage title={data[0]} footer={footer} strDomain={STRAPI_DOMAIN} />;
}