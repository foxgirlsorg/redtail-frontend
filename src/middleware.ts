import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const ua = request.headers.get('user-agent') ?? '';

    if (
        request.nextUrl.pathname.startsWith('/article/') &&
        ua.includes('TelegramBot')
    ) {
        const slug = request.nextUrl.pathname.split('/article/')[1];
        return NextResponse.rewrite(new URL(`/article-iv/${slug}`, request.url));
    }
}

export const config = {
    matcher: '/article/:slug*',
};