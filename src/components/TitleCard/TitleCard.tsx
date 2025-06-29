import styles from "@/components/TitleCard/TitleCard.module.css"
import { IonIcon } from '../IonIcon';
import { RouterButton } from '../Button/RouterButton';

type TitleCardProps = {
    title: any;
    strDomain?: string;
    key?: number;
};

export const TitleCard = ({title, strDomain}:TitleCardProps) => {
    const thumbnail = title.cover?.formats?.small?.url;
    return (
    <div className={styles.card}>
        <img className={styles.cover} src={strDomain + thumbnail} alt={title.name}/>
        <div className={styles.info}>
            <h3 className={styles.name}>
                {title.name}
            </h3>
            <span className={styles.description}>
                {title.description}
            </span>
            <div className={styles.links}>
                {title.mangalib_url && (
                    <a href={title.mangalib_url} target="_blank">
                        <IonIcon src="/icons/mangalib.svg"/>
                    </a>
                )}
                {title.readmanga_url && (
                    <a href={title.readmanga_url} target="_blank">
                        <IonIcon src="/icons/readmanga.svg"/>
                    </a>
                )}
                {title.remanga_url && (
                    <a href={title.remanga_url} target="_blank">
                        <IonIcon src="/icons/remanga.svg"/>
                    </a>
                )}
            </div>
            <RouterButton
                text="Читать у нас"
                iconSrc="/icons/arrow-forward-outline.svg"
                location={`/manga/${title.slug}/`}
            />
        </div>
    </div>
    );
};


