'use client';

import React from 'react';
import { ClientImage } from '@/components/ClientImage/ClientImage';
import { ReadButton } from '@/components/Button/ReadButton';
import { MemberPill } from '@/components/MemberPill/MemberPill';
import { ChapterButton } from '@/components/TitlePage/ChapterButton/ChapterButton';
import { Footer } from '@/components/Footer/Footer';
import { IonIcon } from '@/components/IonIcon';
import { DownloadCard } from '@/components/DownloadCard/DownloadCard';
import { Comments } from '@/components/Comments';
import { fetchComments } from '@/lib/commentsApi';
import styles from './TitlePage.module.css';


type TitlePageProps = {
    title: any;
    footer: any;
    strDomain?: string;
};

const GAP = 5;

type Member = { nickname: string; image?: { formats?: { thumbnail?: { url?: string } } } };

const bitCount = (n: number) => {
    let count = 0;
    while (n) { count += n & 1; n >>>= 1; }
    return count;
};

function optimalPack(
    members: Member[],
    widths: Map<string, number>,
    containerWidth: number,
): Member[] {
    if (!containerWidth || widths.size === 0) return members;
    const known   = members.filter(m => widths.has(m.nickname));
    const unknown = members.filter(m => !widths.has(m.nickname));

    if (known.length === 0) return members;

    const n = known.length;
    const INF = Infinity;
    const dp: number[] = new Array(1 << n).fill(INF);
    const from: number[] = new Array(1 << n).fill(-1);
    dp[0] = 0;
    const sorted = [...known].sort(
        (a, b) => (widths.get(b.nickname) ?? 0) - (widths.get(a.nickname) ?? 0),
    );
    const sw = sorted.map(m => widths.get(m.nickname)!);
    const rowWaste = new Array(1 << n).fill(INF);
    for (let mask = 1; mask < (1 << n); mask++) {
        let total = 0;
        let count = 0;
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                total += sw[i] + (count > 0 ? GAP : 0);
                count++;
            }
        }
        if (total <= containerWidth) rowWaste[mask] = containerWidth - total;
    }
    for (let placed = 0; placed < (1 << n); placed++) {
        if (dp[placed] === INF) continue;
        const remaining = ((1 << n) - 1) & ~placed;
        for (let row = remaining; row > 0; row = (row - 1) & remaining) {
            if (rowWaste[row] === INF) continue;
            const next = placed | row;
            const cost = dp[placed] + rowWaste[row];
            if (cost < dp[next]) {
                dp[next] = cost;
                from[next] = placed;
            }
        }
    }
    const full = (1 << n) - 1;
    if (dp[full] === INF) return members;

    const rowMasks: number[] = [];
    let cur = full;
    while (cur !== 0) {
        const prev = from[cur];
        rowMasks.unshift(cur & ~prev);
        cur = prev;
    }
    rowMasks.sort((a, b) => bitCount(b) - bitCount(a));
    const result: Member[] = [];
    for (const mask of rowMasks) {
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) result.push(sorted[i]);
        }
    }

    return [...result, ...unknown];
}

type MemberPillsProps = {
    members: Member[];
    strDomain?: string;
};

export const MemberPills = ({ members, strDomain }: MemberPillsProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = React.useState(0);
    const [memberWidths, setMemberWidths]     = React.useState<Map<string, number>>(new Map());
    React.useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);
    const measureRef = React.useCallback(
        (nickname: string) => (el: HTMLSpanElement | null) => {
            if (!el) return;
            const width = el.offsetWidth;
            setMemberWidths(prev => {
                if (prev.get(nickname) === width) return prev;
                const next = new Map(prev);
                next.set(nickname, width);
                return next;
            });
        },
        [],
    );

    const packed = React.useMemo(
        () => optimalPack(members, memberWidths, containerWidth),
        [members, memberWidths, containerWidth],
    );

    return (
        <div ref={containerRef} className={styles.memberPills}>
            {packed.map(member => (
                <span
                    key={member.nickname}
                    className={styles.memberPillMeasure}
                    ref={measureRef(member.nickname)}
                >
                    <MemberPill
                        strDomain={strDomain}
                        nickname={member.nickname}
                        imgUrl={member.image?.formats?.thumbnail?.url}
                    />
                </span>
            ))}
        </div>
    );
};

function contentTypeFromTitle(title: any): string {
    const bookTypes = ['Книга', 'Ранобэ', 'Рассказ'];
    return bookTypes.includes(title.type)
        ? 'api::book-title.book-title'
        : 'api::manga-title.manga-title';
}

function countComments(items: any[] = []): number {
    return items.reduce(
        (sum: number, item: any) => sum + 1 + countComments(item.children ?? []),
        0,
    );
}

type Tab = 'chapters' | 'comments';

export const TitlePage = ({ title, footer, strDomain }: TitlePageProps) => {
    const thumbnail       = title.cover?.formats?.medium?.url;
    const backdropUrl     = title.backdrop?.url ?? title.cover?.url;
    const membersWorkedOn = title.members_worked_ons ?? title.members_worked_on ?? [];
    const bookFiles       = title.book_files ?? [];

    const sortedChapters = [...(title.chapters ?? [])].sort(
        (a: any, b: any) => b.number - a.number,
    );

    const contentType = contentTypeFromTitle(title);
    const contentId   = title.documentId as string;

    const [activeTab, setActiveTab]       = React.useState<Tab>('chapters');
    const [commentCount, setCommentCount] = React.useState<number | null>(null);

    React.useEffect(() => {
        fetchComments(contentType, contentId, null)
            .then(data => setCommentCount(countComments(data)))
            .catch(() => setCommentCount(0));
    }, [contentType, contentId]);

    return (
        <main className={styles.container}>
            <div className={styles.backdrop}>
                {backdropUrl && (
                    <div
                        className={styles.backdropImage}
                        style={{ backgroundImage: `url(${strDomain + backdropUrl})` }}
                    />
                )}
                <div className={styles.backdropVignette} />
                <div className={styles.backdropNoise} />
            </div>

            <div className={styles.mainbody}>
                <div className={styles.sidebar}>
                    <div className={styles.coverWrapper}>
                        <div className={styles.coverShine} />
                        <ClientImage
                            src={strDomain + title.cover?.url}
                            thumbnail={strDomain + thumbnail}
                            className={styles.coverImg}
                        />
                    </div>

                    {bookFiles.length > 0 && (
                        <div className={styles.sideCard}>
                            <span className={styles.sideCardTitle}>Скачать</span>
                            <DownloadCard files={bookFiles} strDomain={strDomain} />
                        </div>

                    )}

                    {membersWorkedOn.length > 0 && (
                        <div className={styles.sideCard}>
                            <span className={styles.sideCardTitle}>Над переводом работали</span>
                            <MemberPills members={membersWorkedOn} strDomain={strDomain} />
                        </div>
                    )}
                </div>

                <div className={styles.body}>
                    <div className={styles.hero}>
                        <span className={styles.typeBadge}>{title.type}</span>
                        <h1 className={styles.titleText}>{title.name}</h1>

                        {title.alternative_names && (
                            <p className={styles.altNames}>{title.alternative_names}</p>
                        )}

                        <div className={styles.quickInfo}>
                            {title.release_year && (
                                <div className={styles.quickItem}>
                                    <span className={styles.quickLabel}>Год</span>
                                    <span className={styles.quickValue}>{title.release_year}</span>
                                </div>
                            )}

                            {title.release_status && (
                                <div className={styles.quickItem}>
                                    <span className={styles.quickLabel}>Статус</span>
                                    <span className={styles.quickValue}>{title.release_status}</span>
                                </div>
                            )}

                            {title.authors?.length > 0 && (
                                <div className={styles.quickItem}>
                                    <span className={styles.quickLabel}>Автор</span>
                                    <span className={styles.quickValue}>
                                        {title.authors.map((a: any) => (
                                            <a key={a.name} href={`/author/${a.name}`}>
                                                {a.name}
                                            </a>
                                        ))}
                                    </span>
                                </div>
                            )}

                            {sortedChapters.length > 0 && (
                                <div className={styles.quickItem}>
                                    <span className={styles.quickLabel}>Глав</span>
                                    <span className={styles.quickValue}>{sortedChapters.length}</span>
                                </div>
                            )}
                        </div>

                        {(title.mangalib_url ||
                            title.readmanga_url ||
                            title.remanga_url ||
                            title.senkuro_url) && (
                            <div className={styles.externalLinks}>
                                {title.mangalib_url && (
                                    <a href={title.mangalib_url} target="_blank" className={styles.externalLink}>
                                        <IonIcon src="/icons/mangalib.svg" />MangaLIB
                                    </a>
                                )}
                                {title.readmanga_url && (
                                    <a href={title.readmanga_url} target="_blank" className={styles.externalLink}>
                                        <IonIcon src="/icons/readmanga.svg" />ReadManga
                                    </a>
                                )}
                                {title.remanga_url && (
                                    <a href={title.remanga_url} target="_blank" className={styles.externalLink}>
                                        <IonIcon src="/icons/remanga.svg" />Remanga
                                    </a>
                                )}
                                {title.senkuro_url && (
                                    <a href={title.senkuro_url} target="_blank" className={styles.externalLink}>
                                        <IonIcon src="/icons/senkuro.svg" />Senkuro
                                    </a>
                                )}
                            </div>
                        )}

                        <div className={styles.readBtnWrap}>
                            <ReadButton title={title} />
                        </div>
                    </div>

                    <div className={styles.panel}>
                        {title.description && (
                            <p className={styles.description}>{title.description}</p>
                        )}

                        {bookFiles.length > 0 && (
                            <div className={styles.mobileDownloads}>
                                <span className={styles.sideCardTitle}>Скачать</span>
                                <DownloadCard files={bookFiles} strDomain={strDomain} />
                            </div>
                        )}

                        {membersWorkedOn.length > 0 && (
                            <div className={styles.mobileCredits}>
                                <span className={styles.sideCardTitle}>Над переводом работали</span>
                                <MemberPills members={membersWorkedOn} strDomain={strDomain} />
                            </div>
                        )}

                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'chapters' ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab('chapters')}
                            >
                                Главы
                                {sortedChapters.length > 0 && (
                                    <span className={styles.tabBadge}>{sortedChapters.length}</span>
                                )}
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'comments' ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                Комментарии
                                {commentCount !== null && commentCount > 0 && (
                                    <span className={styles.tabBadge}>{commentCount}</span>
                                )}
                            </button>
                        </div>

                        {activeTab === 'chapters' && (
                            sortedChapters.length > 0 ? (
                                <div className={styles.chapterList}>
                                    {sortedChapters.map((chapter: any, i: number) => (
                                        <ChapterButton chapter={chapter} key={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyChapters}>
                                    Главы пока не добавлены.
                                </div>
                            )
                        )}

                        {activeTab === 'comments' && (
                            <div className={styles.commentsPanel}>
                                <Comments
                                    contentType={contentType}
                                    contentId={contentId}
                                    embedded
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer footer={footer} />
        </main>
    );
};
