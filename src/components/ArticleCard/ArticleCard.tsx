import styles from './ArticleCard.module.css';
import { RouterButton } from '@/components/Button/RouterButton';
import { MemberPill } from '@/components/MemberPill/MemberPill';

type ArticleCardProps = {
    article: any;
    strDomain?: string;
};

export const ArticleCard = ({ article, strDomain }: ArticleCardProps) => {
    const published = new Date(article.publishedAt).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(',', '');

    const bgUrl = article.card_bg?.formats?.medium?.url ?? article.card_bg?.url;
    console.log(article)
    console.log(bgUrl)
    const authors = (article.authors ?? []).map((a: any) => ({
        nickname: a.name,
        imgUrl: a.photo?.formats?.thumbnail?.url,
        isAuthor: true,
        hidden: a.hidden,
    }));
    const related = (article.related_authors ?? []).map((a: any) => ({
        nickname: a.name,
        imgUrl: a.photo?.formats?.thumbnail?.url,
        isAuthor: true,
    }));

    const allPeople = [...authors, ...related];

    return (
        <div className={styles.card}>
          
            {bgUrl && (
                <>
                    <div
                        className={styles.bgImage}
                        style={{ backgroundImage: `url(${strDomain + bgUrl})` }}
                    />
                    <div className={styles.bgOverlay} />
                </>
            )}

          
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
                                <MemberPill
                                    key={i}
                                    strDomain={strDomain}
                                    nickname={person.nickname}
                                    imgUrl={person.imgUrl}
                                    url={!person.hidden ? `/author/${person.nickname}` : undefined}
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