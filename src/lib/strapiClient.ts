import { strapi } from '@strapi/client';
import { cache } from 'react';

const STRAPI_API_URL = process.env.PUBLIC_STRAPI_API_URL!;

function installStrapiRequestLogger() {
    if (typeof globalThis.fetch !== 'function' || !STRAPI_API_URL) return;

    const apiBase = STRAPI_API_URL.replace(/\/$/, '');
    const apiOrigin = new URL(STRAPI_API_URL).origin;
    const nativeFetch = globalThis.fetch.bind(globalThis);

    if ((globalThis as typeof globalThis & { __strapiFetchLoggerInstalled?: boolean }).__strapiFetchLoggerInstalled) {
        return;
    }

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const request = input instanceof Request ? input : null;
        const url = typeof input === 'string'
            ? input
            : input instanceof URL
                ? input.href
                : request!.url;
        const method = init?.method ?? request?.method ?? 'GET';
        const resolvedUrl = url.startsWith('/') ? `${apiOrigin}${url}` : url;
        const isStrapiRequest = resolvedUrl.startsWith(apiBase) || resolvedUrl.startsWith(`${apiOrigin}/api`);

        if (!isStrapiRequest) {
            return nativeFetch(input, init);
        }

        const started = Date.now();
        console.log(`[Strapi] → ${method} ${resolvedUrl}`);

        try {
            const response = await nativeFetch(input, init);
            console.log(`[Strapi] ← ${response.status} ${method} ${resolvedUrl} (${Date.now() - started}ms)`);
            return response;
        } catch (error) {
            console.error(`[Strapi] ✗ ${method} ${resolvedUrl} (${Date.now() - started}ms)`, error);
            throw error;
        }
    };

    (globalThis as typeof globalThis & { __strapiFetchLoggerInstalled?: boolean }).__strapiFetchLoggerInstalled = true;
}

installStrapiRequestLogger();

const client = strapi({
    baseURL: STRAPI_API_URL,
});

const PAGE_SIZE = 100;
const MAX_PAGES_SAFETY = 1000;

async function fetchAllPages<T>(
    fetchPage: (page: number, pageSize: number) => Promise<{
        data: T[];
        meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
    }>,
): Promise<T[]> {
    const all: T[] = [];
    let page = 1;

    while (page <= MAX_PAGES_SAFETY) {
        const res = await fetchPage(page, PAGE_SIZE);
        const batch = res.data ?? [];
        all.push(...batch);

        const pagination = res.meta?.pagination;

        if (!pagination) break;

        if (page >= pagination.pageCount) break;

        if (batch.length === 0) break;

        page++;
    }

    if (page > MAX_PAGES_SAFETY) {
        console.warn(
            `[Strapi] fetchAllPages hit the safety cap of ${MAX_PAGES_SAFETY} pages ` +
            `(${MAX_PAGES_SAFETY * PAGE_SIZE} items). Data may be incomplete — raise MAX_PAGES_SAFETY if this is legitimate.`,
        );
    }

    return all;
}

export const getTitleList = cache(async () => {
    const [manga, books] = await Promise.all([
        client.collection('manga-titles').find({
            populate: ['cover'],
            filters: { hidden: { $ne: true } },
        }),
        client.collection('book-titles').find({
            populate: ['cover'],
            filters: { hidden: { $ne: true } },
        }),
    ]);

    return [...manga.data, ...books.data].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
});

export const getTeamMembers = cache(async () => {
    const members = await client.collection('team-members').find({
        populate: ['image'],
        sort: 'createdAt',
        filters: { hidden: { $ne: true } },
    });
    return members.data;
});

export const getTeamMembersAll = cache(async () => {
    const members = await client.collection('team-members').find({
        populate: ['image'],
        sort: 'createdAt',
    });
    return members.data;
});

export const getFooter = cache(async () => {
    const footer = await client.single('Footer').find();
    return footer.data;
});

export const getManga = cache(async (slug: string) => {
    const manga = await client.collection('manga-titles').find({
        filters: { slug: { $eq: slug } },
        populate: {
            cover: true,
            backdrop: true,
            authors: true,
            members_worked_ons: {
                populate: { image: true },
            },
            chapters: {
                sort: [{ number: 'desc' }],
            },
        },
    });
    return manga.data;
});

export const getBook = cache(async (slug: string) => {
    const book = await client.collection('book-titles').find({
        filters: { slug: { $eq: slug } },
        populate: {
            cover: true,
            backdrop: true,
            authors: true,
            members_worked_on: {
                populate: { image: true },
            },
            chapters: {
                sort: [{ number: 'desc' }],
            },
            book_files: {
                filters: { hidden: { $ne: true } },
                populate: { file: true },
            },
        },
    });
    return book.data;
});

export const getMangaChaptersFromSlug = cache(async (slug: string) => {
    const chapters = await fetchAllPages<any>((page, pageSize) =>
        client.collection('manga-chapters').find({
            filters: {
                title: { slug: { $eq: slug } },
                hidden: { $ne: true },
            },
            populate: {
                title: true,
                pages: {
                    populate: { image: true },
                    sort: [{ number: 'asc' }],
                    filters: { hidden: { $ne: true } },
                },
            },
            sort: 'number:asc',
            pagination: { page, pageSize },
        }),
    );

    return chapters.sort((a, b) => a.number - b.number);
});

export const getBookChaptersFromSlug = cache(async (slug: string) => {
    const chapters = await fetchAllPages<any>((page, pageSize) =>
        client.collection('book-chapters').find({
            filters: {
                title: { slug: { $eq: slug } },
                hidden: { $ne: true },
            },
            populate: { title: true },
            sort: 'number:asc',
            pagination: { page, pageSize },
        }),
    );

    return chapters.sort((a, b) => a.number - b.number);
});

export const getAuthor = cache(async (nickname: string) => {
    const authors = await client.collection('authors').find({
        filters: {
            name: { $eq: nickname },
            hidden: { $ne: true },
        },
        populate: {
            photo: true,
            manga_titles: {
                filters: { hidden: { $ne: true } },
                sort: [{ createdAt: 'asc' }],
                populate: { cover: true },
            },
            book_titles: {
                filters: { hidden: { $ne: true } },
                sort: [{ createdAt: 'asc' }],
                populate: { cover: true },
            },
            articles: {
                filters: { hidden: { $ne: true } },
                sort: [{ publishedAt: 'desc' }],
                populate: {
                    card_bg: true,
                    authors:         { populate: { photo: true } },
                    related_authors: { populate: { photo: true } },
                },
            },
            related_articles: {
                filters: { hidden: { $ne: true } },
                sort: [{ publishedAt: 'desc' }],
                populate: {
                    card_bg: true,
                    authors:         { populate: { photo: true } },
                    related_authors: { populate: { photo: true } },
                },
            },
        },
    });
    return authors.data;
});

export const getArticle = cache(async (slug: string) => {
    const article = await client.collection('articles').find({
        filters: { slug: { $eq: slug } },
        populate: {
            card_bg: true,
            authors:         { populate: { photo: true } },
            related_authors: { populate: { photo: true } },
            members_worked_on: { populate: { image: true } },
        },
    });
    return article.data;
});

export const getArticleList = cache(async () => {
    const articles = await client.collection('articles').find({
        filters: { hidden: { $ne: true } },
        sort: 'publishedAt:desc',
        populate: {
            card_bg: true,
            authors:         { populate: { photo: true } },
            related_authors: { populate: { photo: true } },
        },
    });
    return articles.data;
});