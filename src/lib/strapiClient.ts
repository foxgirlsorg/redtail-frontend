import { strapi } from '@strapi/client';

const client = strapi({
    baseURL: process.env.PUBLIC_STRAPI_API_URL!,
});

export async function getMangaList() {
    const manga = await client.collection('manga-titles').find({
        populate: ['cover'],
    });

    return manga.data;
}