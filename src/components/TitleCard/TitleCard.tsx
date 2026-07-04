import styles from "@/components/TitleCard/TitleCard.module.css"
import { IonIcon } from '../IonIcon';
import { RouterButton } from '../Button/RouterButton';

type TitleCardProps = {
    title: any;
    strDomain?: string;
    key?: number;
};

export const TitleCard = ({ title, strDomain }: TitleCardProps) => {
    const thumbnail = title.cover?.formats?.medium?.url;
    const type = ["Книга", "Ранобэ", "Рассказ"].includes(title.type) ? "book" : "manga";

    return (
        <div className={styles.card}>
            <div
                className={styles.mirrorBg}
                style={{ backgroundImage: `url(${strDomain + thumbnail})` }}
            />
            <div className={styles.mirrorFade} />

            <div className={styles.info}>
                <h3 className={styles.name}>{title.name}</h3>
                <span className={styles.description}>{title.description}</span>
                {title.urls?.length > 0 && (
                    <div className={styles.links}>
                        {title.urls.map((u: any, i: number) => (
                            <a key={i} href={u.url} target="_blank">
                                <IonIcon src={u.icon_file?.mime === 'image/svg+xml' ? strDomain + u.icon_file.url : (u.icon || '/icons/link-outline-45.svg')} />
                            </a>
                        ))}
                    </div>
                )}
                <RouterButton
                    text="Читать у нас"
                    iconSrc="/icons/arrow-forward-outline.svg"
                    location={`/${type}/${title.slug}/`}
                />
            </div>

          
            <div className={styles.coverWrapper}>
                <div className={styles.typeBadge}>{title.type}</div>
                <img
                    className={styles.coverImg}
                    src={strDomain + thumbnail}
                    alt={title.name}
                />
            </div>
        </div>
    );
};