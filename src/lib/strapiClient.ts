import { strapi } from '@strapi/client';

const client = strapi({
    baseURL: process.env.PUBLIC_STRAPI_API_URL!,
});

export async function getTitleList() {
    const [manga, books] = await Promise.all([
        client.collection('manga-titles').find({
            populate: ['cover'],
            filters: { hidden: { $ne: true } }
        }),
        client.collection('book-titles').find({
            populate: ['cover'],
            filters: { hidden: { $ne: true } }
        })
    ]);

    const allTitles = [...manga.data, ...books.data].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return allTitles;
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


export async function getBook(slug: string) {
    const book = await client.collection('book-titles').find({
        filters: {
            slug: {
                $eq: slug,
            },
        },
        populate: {
            cover: true,
            backdrop: true,
            authors: true,
            members_worked_on: {
                populate: {
                    image: true,
                },
            },
            chapters: {
                sort: [{ number: 'desc' }],
            },
        },
    });

    return book.data;
}


export async function getMangaChaptersFromSlug(slug: string) {
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

export async function getBookChaptersFromSlug(slug: string) {
    const chapters = await client.collection('book-chapters').find({
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
            book_titles: {
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



export async function getArticle(slug: string) {
    const article = await client.collection('articles').find({
        filters: {
            slug: {
                $eq: slug,
            },
        },
        populate: {
            authors: {
                populate: {
                    photo: true,
                },
            },
            related_authors: {
                populate: {
                    photo: true,
                },
            },
            members_worked_on: {
                populate: {
                    image: true,
                },
            }
        },
    });

    return article.data;
}

export async function getArticleList() {
    const articles = await client.collection('articles').find({
        filters: { hidden: { $ne: true } },
        sort: 'publishedAt:desc',
        populate: {
            card_bg: true,
            authors: {
                populate: { photo: true },
            },
            related_authors: {
                populate: { photo: true },
            }
        },
    });
    return articles.data;
}
