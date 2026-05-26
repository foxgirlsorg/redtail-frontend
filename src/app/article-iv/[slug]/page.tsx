import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/strapiClient';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN!;
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL!;

type pageProps = Promise<{ slug: string }>;

export default async function ArticleIVPage({ params }: { params: pageProps }) {
    const { slug } = await params;
    const article_data = await getArticle(slug);
    if (article_data.length === 0) notFound();

    const article = article_data[0];

    const authors = [
        ...(article.authors?.map((a: any) => a.name) ?? []),
        ...(article.related_authors?.map((a: any) => a.name) ?? []),
        ...(article.members_worked_on?.map((m: any) => m.nickname) ?? []),
    ].join(', ');

    return (
        <html>
        <head>
            <title>{article.name} | RedTail</title>
            <meta property="og:site_name" content="RedTail" />
            <meta property="og:description" content={article.description?.slice(0, 150)} />
            <meta property="og:image" content={article.card_bg?.url ? `${STRAPI_DOMAIN}${article.card_bg.url}` : ''} />
            <meta property="article:author" content={authors} />
            <meta property="article:published_time" content={article.publishedAt} />
            <meta property="telegram:channel" content={TELEGRAM_CHANNEL} />
            <meta property="tg:site_verification" content="" />
        </head>
        <body>
        <div className="article">
            <article className="article__content">

                {article.card_bg?.url && (
                    <figure>
                        <img src={`${STRAPI_DOMAIN}${article.card_bg.url}`} alt={article.name} />
                    </figure>
                )}

                <h1>{article.name}</h1>

                <div className="markdown-body">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {article.content}
                    </ReactMarkdown>
                </div>

                <section>
                    {article.source_url && (
                        <p><strong>Источник:</strong> <a href={article.source_url}>{article.source_url}</a></p>
                    )}
                    {article.authors && (
                        <p>
                            <strong>{article.authors.length > 1 ? 'Авторы' : 'Автор'}:</strong>{' '}
                            {article.authors.map((a: any) => a.name).join(', ')}
                        </p>
                    )}
                    {article.related_authors && (
                        <p>
                            <strong>Связано с:</strong>{' '}
                            {article.related_authors.map((a: any) => a.name).join(', ')}
                        </p>
                    )}
                    {article.members_worked_on && (
                        <p>
                            <strong>{article.members_worked_on.length > 1 ? 'Переводчики' : 'Переводчик'}:</strong>{' '}
                            {article.members_worked_on.map((m: any) => m.nickname).join(', ')}
                        </p>
                    )}
                </section>

            </article>
        </div>
        </body>
        </html>
    );
}