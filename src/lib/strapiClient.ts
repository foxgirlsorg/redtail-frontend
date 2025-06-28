import { strapi } from '@strapi/client';

const client = strapi({
    baseURL: process.env.PUBLIC_STRAPI_API_URL!,
});

export async function getMangaList() {
    const manga = await client.collection('manga-titles').find({
        populate: ['cover'],
        sort: "createdAt",
        filters: {
            hidden: {
                $ne: true
            }
        }
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

export async function getFooter() {
    const footer = await client.single('Footer').find();
    return footer.data;
}



export async function getManga(slug: string) {
    const manga = await client.collection('manga-titles').find({
        filters: {
            slug: {
                $eq: slug,
            },
        },
        populate: {
            cover: true,
            backdrop: true,
            authors: true,
            members_worked_ons: {
                populate: {
                    image: true,
                },
            },
            chapters: {
                sort: ['number:asc']
            },
        },
    });

    return manga.data;
}