import styles from './ArticleCard.module.css';
import { RouterButton } from '@/components/Button/RouterButton';
import { SmallMemberCard } from '@/components/SmallMemberCard/SmallMemberCard';

type ArticleCardProps = {
    article: any;
    strDomain?: string;
};

export const ArticleCard = ({ article, strDomain }: ArticleCardProps) => {
    const published = new Date(article.publishedAt).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(',', '');

    const bgUrl = article.card_bg?.formats?.medium?.url ?? article.card_bg?.url;

    // Merge authors and related_authors into one deduplicated list,
    // tagging each so SmallMemberCard knows which field to pull the image from
    const authors = (article.authors ?? []).map((a: any) => ({
        nickname: a.name,
        imgUrl: a.photo?.formats?.thumbnail?.url,
        isAuthor: true,
    }));
    const related = (article.related_authors ?? []).map((a: any) => ({
        nickname: a.name,
        imgUrl: a.photo?.formats?.thumbnail?.url,
        isAuthor: true,
    }));

    const allPeople = [...authors, ...related];

    return (
        <div className={styles.card}>
            {/* Background image */}
            {bgUrl && (
                <>
                    <div
                        className={styles.bgImage}
                        style={{ backgroundImage: `url(${strDomain + bgUrl})` }}
                    />
                    <div className={styles.bgOverlay} />
                </>
            )}

            {/* Content */}
            <div className={styles.content}>
                <span className={styles.date}>{published}</span>
                <h3 className={styles.name}>{article.name}</h3>

                {article.description && (
                    <p className={styles.description}>{article.description}</p>
                )}

                <div className={styles.footer}>
                    {allPeople.length > 0 && (
                        <div className={styles.people}>
                            {allPeople.map((person, i) => (
                                <SmallMemberCard
                                    key={i}
                                    strDomain={strDomain}
                                    nickname={person.nickname}
                                    imgUrl={person.imgUrl}
                                />
                            ))}
                        </div>
                    )}
                    <RouterButton
                        text="Читать"
                        iconSrc="/icons/arrow-forward-outline.svg"
                        location={`/article/${article.slug}/`}
                    />
                </div>
            </div>
        </div>
    );
};