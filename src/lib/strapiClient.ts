import { strapi } from '@strapi/client';

const client = strapi({
    baseURL: process.env.PUBLIC_STRAPI_API_URL!,
});

export async function getMangaList() {
    const manga = await client.collection('manga-titles').find({
        populate: ['cover'],
        sort: "createdAt",
    });

    return manga.data;
}

export async function getTeamMembers() {
    const members = await client.collection('team-members').find({
        populate: ['image'],
        sort: "createdAt",
        filters: {
            hidden: {
                $ne: true
            }
        }
    });

    return members.data;
}