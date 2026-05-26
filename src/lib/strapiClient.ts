import { strapi } from '@strapi/client';
import { cache } from 'react';

const client = strapi({
    baseURL: process.env.PUBLIC_STRAPI_API_URL!,
});

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
    const chapters = await client.collection('manga-chapters').find({
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
    });
    return chapters.data;
});

export const getBookChaptersFromSlug = cache(async (slug: string) => {
    const chapters = await client.collection('book-chapters').find({
        filters: {
            title: { slug: { $eq: slug } },
            hidden: { $ne: true },
        },
        populate: { title: true },
        sort: 'number:asc',
    });
    return chapters.data;
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