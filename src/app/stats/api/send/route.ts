import { NextRequest } from 'next/server';

const umamiServer = (process.env.NEXT_PUBLIC_UMAMI_SERVER_URL ?? 'https://cloud.umami.is').replace(/\/$/, '');

export async function POST(request: NextRequest) {
    const body = await request.text();

    const response = await fetch(`${umamiServer}/api/send`, {
        method: 'POST',
        headers: {
            'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
            'User-Agent': request.headers.get('User-Agent') ?? '',
            'X-Forwarded-For':
                request.headers.get('cf-connecting-ip') ||
                request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                '',
        },
        body,
    });

    return new Response(response.body, {
        status: response.status,
        headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
    });
}