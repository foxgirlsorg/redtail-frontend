import styles from "@/components/TitlePage/InfoBox/InfoBox.module.css"

type InfoBoxProps = {
    title: any;
};

export const InfoBox = ({title}:InfoBoxProps) => {
    return (
        <div className={styles.infoBox}>
            <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Тип</span>
                <span className={styles.infoItemValue}>{title.type}</span>
            </div>
            <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Год выпуска</span>
                <span className={styles.infoItemValue}>{title.release_year}</span>
            </div>
            <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Статус</span>
                <span className={styles.infoItemValue}>{title.release_status}</span>
            </div>
                {title.authors && (
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Автор</span>
                        <span>
                            {title.authors.map((author:any, i:number) => (

                                    <a className={styles.authorUrl} key={i} href={'/author/' + author.name}>{author.name}</a>

                            ))}
                        </span>
                    </div>
                )}
                {title.alternative_names && (
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Альтернативные названия</span>
                        <span className={styles.infoItemValue}>{title.alternative_names}</span>
                    </div>
                )}
        </div>
    );
};

