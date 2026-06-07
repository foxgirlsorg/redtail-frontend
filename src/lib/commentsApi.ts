const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_DOMAIN!;

export type CommentAuthor = {
    id: number | string;
    name: string;
    email?: string;
    avatar?: string | null;
    verified?: boolean;
};

export type Comment = {
    id: number;
    documentId?: string;
    content: string;
    blocked?: boolean | null;
    blockedThread?: boolean | null;
    blockReason?: string | null;
    isAdminComment?: boolean | null;
    removed?: boolean | null;
    approvalStatus?: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    author?: CommentAuthor;
    children?: Comment[];
    threadOf?: { id: number } | null;
};

async function readJsonSafe(res: Response) {
    return res.json().catch(() => ({}));
}

function unwrapComment(data: any): Comment {
    return data?.data ?? data;
}

function unwrapComments(data: any): Comment[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function collectAuthorIds(comments: Comment[]): Array<number | string> {
    return comments.flatMap(comment => [
        comment.author?.id,
        ...collectAuthorIds(comment.children ?? []),
    ]).filter((id): id is number | string => id !== undefined && id !== null);
}

async function fetchUsersByIds(
    ids: Array<number | string>,
    token?: string | null,
): Promise<Record<string, { verified?: boolean; avatar?: string | null }>> {
    const uniqueIds = [...new Set(ids.map(String))];

    if (uniqueIds.length === 0) return {};

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const params = new URLSearchParams();

    uniqueIds.forEach((id, index) => {
        params.set(`filters[id][$in][${index}]`, id);
    });

    params.set('fields[0]', 'id');
    params.set('fields[1]', 'verified');
    params.set('populate[avatar][fields][0]', 'url');

    const res = await fetch(`${STRAPI_URL}/api/users?${params.toString()}`, {
        headers,
        cache: 'no-store',
    });

    if (!res.ok) return {};

    const users = await res.json();

    if (!Array.isArray(users)) return {};

    return Object.fromEntries(
        users.map((u: any) => [
            String(u.id),
            {
                verified: u.verified === true,
                avatar: u.avatar?.url ?? null,
            },
        ]),
    );
}

function sanitizeAndMergeAuthors(
    comments: Comment[],
    usersById: Record<string, { verified?: boolean; avatar?: string | null }>,
): Comment[] {
    return comments.map(comment => {
        const author = comment.author;
        const currentUser = author ? usersById[String(author.id)] : undefined;

        return {
            ...comment,
            author: author
                ? {
                    id: author.id,
                    name: author.name,
                    avatar: currentUser ? currentUser.avatar : author.avatar,
                    verified: currentUser?.verified === true,
                }
                : author,
            children: sanitizeAndMergeAuthors(comment.children ?? [], usersById),
        };
    });
}

export async function fetchComments(
    contentType: string,
    contentId: string | number,
    token?: string | null,
): Promise<Comment[]> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
        `${STRAPI_URL}/api/comments/${contentType}:${contentId}`,
        { headers, cache: 'no-store' },
    );

    if (!res.ok) {
        const err = await readJsonSafe(res);
        throw new Error(err.error?.message ?? 'Не удалось загрузить комментарии');
    }

    const comments = unwrapComments(await res.json());
    const authorIds = collectAuthorIds(comments);
    const usersById = await fetchUsersByIds(authorIds, token);

    return sanitizeAndMergeAuthors(comments, usersById);
}

export async function postComment(
    contentType: string,
    contentId: string | number,
    content: string,
    threadOfId: number | null,
    token: string,
): Promise<Comment> {
    const body: Record<string, unknown> = { content };

    if (threadOfId) {
        body.threadOf = threadOfId;
    }

    const res = await fetch(
        `${STRAPI_URL}/api/comments/${contentType}:${contentId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        },
    );

    if (!res.ok) {
        const err = await readJsonSafe(res);
        throw new Error(err.error?.message ?? 'Не удалось добавить комментарий');
    }

    return unwrapComment(await res.json());
}

export async function updateComment(
    contentType: string,
    contentId: string | number,
    commentId: number,
    content: string,
    token: string,
): Promise<Comment> {
    const res = await fetch(
        `${STRAPI_URL}/api/comments/${contentType}:${contentId}/comment/${commentId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        },
    );

    if (!res.ok) {
        const err = await readJsonSafe(res);
        throw new Error(err.error?.message ?? 'Не удалось изменить комментарий');
    }

    return unwrapComment(await res.json());
}

export async function deleteComment(
    contentType: string,
    contentId: string | number,
    commentId: number,
    authorId: number | string,
    token: string,
): Promise<void> {
    const res = await fetch(
        `${STRAPI_URL}/api/comments/${contentType}:${contentId}/comment/${commentId}?authorId=${encodeURIComponent(String(authorId))}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!res.ok) {
        const err = await readJsonSafe(res);
        throw new Error(err.error?.message ?? 'Не удалось удалить комментарий');
    }
}

export async function reportComment(
    contentType: string,
    contentId: string | number,
    commentId: number,
    reason: string,
    token: string,
): Promise<void> {
    const res = await fetch(
        `${STRAPI_URL}/api/comments/${contentType}:${contentId}/comment/${commentId}/report-abuse`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                reason,
                content: reason,
            }),
        },
    );

    if (!res.ok) {
        const err = await readJsonSafe(res);
        throw new Error(err.error?.message ?? 'Не удалось пожаловаться');
    }
}
