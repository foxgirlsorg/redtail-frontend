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
            {/* Blurred mirror cover — bleeds from left, fades into card bg */}
            <div
                className={styles.mirrorBg}
                style={{ backgroundImage: `url(${strDomain + thumbnail})` }}
            />
            {/* Gradient overlay that fades mirror into card bg */}
            <div className={styles.mirrorFade} />

            {/* Info — left side */}
            <div className={styles.info}>
                <h3 className={styles.name}>{title.name}</h3>
                <span className={styles.description}>{title.description}</span>
                <div className={styles.links}>
                    {title.mangalib_url && (
                        <a href={title.mangalib_url} target="_blank">
                            <IonIcon src="/icons/mangalib.svg" />
                        </a>
                    )}
                    {title.readmanga_url && (
                        <a href={title.readmanga_url} target="_blank">
                            <IonIcon src="/icons/readmanga.svg" />
                        </a>
                    )}
                    {title.remanga_url && (
                        <a href={title.remanga_url} target="_blank">
                            <IonIcon src="/icons/remanga.svg" />
                        </a>
                    )}
                    {title.senkuro_url && (
                        <a href={title.senkuro_url} target="_blank">
                            <IonIcon src="/icons/senkuro.svg" />
                        </a>
                    )}
                </div>
                <RouterButton
                    text="Читать у нас"
                    iconSrc="/icons/arrow-forward-outline.svg"
                    location={`/${type}/${title.slug}/`}
                />
            </div>

            {/* Cover — right side, same crop as before */}
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