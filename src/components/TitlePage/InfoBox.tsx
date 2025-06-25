import styles from "@/components/TitlePage/InfoBox.module.css"
import { IonIcon } from '../IonIcon';

type InfoBoxProps = {
    title: any;
};

export const InfoBox = ({title}:InfoBoxProps) => {
    return (
        <div className="infobox">
            <div className={styles.links}>
                {/*{title.mangalib_url && (*/}
                {/*    <a href={title.mangalib_url} target="_blank">*/}
                {/*        <IonIcon src="/icons/mangalib.svg"/>*/}
                {/*    </a>*/}
                {/*)}*/}
                {/*{title.readmanga_url && (*/}
                {/*    <a href={title.readmanga_url} target="_blank">*/}
                {/*        <IonIcon src="/icons/readmanga.svg"/>*/}
                {/*    </a>*/}
                {/*)}*/}
                {/*{title.remanga_url && (*/}
                {/*    <a href={title.remanga_url} target="_blank">*/}
                {/*        <IonIcon src="/icons/remanga.svg"/>*/}
                {/*    </a>*/}
                {/*)}*/}
            </div>
            <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Год выпуска</span>
                <br/>
                <span className={styles.infoItemValue}>{title.release_year}</span>
            </div>
            <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Статус</span>
                <br/>
                <span className={styles.infoItemValue}>{title.release_status}</span>
            </div>
                {title.authors && (
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Автор</span>
                        <br/>
                        {title.authors.map((author:any, i:number) => (
                            <span key={i}>{author.name}</span>
                    ))}
                    </div>
                )}
        </div>
    );
};


