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
                sort: [{ number: 'desc' }],
            },
        },
    });

    return manga.data;
}



export async function getChaptersFromSlug(slug: string) {
    const chapters = await client.collection('manga-chapters').find({
        filters: {
            title: {
                slug: {
                    $eq: slug,
                },
            },
            hidden: {
                $ne: true
            }
        },
        populate: {
            title: true,
            pages: {
                populate: {
                    image: true,
                },
                sort: [{ number: 'asc' }],
                filters: {
                    hidden: {
                        $ne: true
                    }
                }
            },
        },
        sort: "number:asc",
    });

    return chapters.data;
}


export async function getAuthor(nickname: string) {
    const authors = await client.collection('authors').find({
        filters: {
            name: {
                $eq: nickname,
            },
            hidden: {
                $ne: true,
            },
        },
        populate: {
            photo: true,
            manga_titles: {
                filters: {
                    hidden: {
                        $ne: true,
                    },
                },
                sort: [{ createdAt: 'asc' }],
                populate: {
                    cover: true,
                },
            },
        },
    });

    return authors.data;
}
