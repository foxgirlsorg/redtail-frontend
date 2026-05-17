import styles from "@/components/Footer/Footer.module.css"
import { IonIcon } from '../IonIcon';

type FooterProps = {
    footer: any;
};

export const Footer = ({ footer }: FooterProps) => {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.top}>
                <div className={styles.brand}>
                    <a href="/" className={styles.brandName}>REDTAIL</a>
                    {footer.warning && (
                        <p className={styles.warning}>{footer.warning}</p>
                    )}
                </div>

                <div className={styles.linkGroup}>
                    <span className={styles.groupLabel}>Ссылки</span>
                    <div className={styles.iconRow}>
                        {footer.mangalib_url && (
                            <a href={footer.mangalib_url} target="_blank" rel="noopener noreferrer"
                               className={styles.iconLink} title="Мы на MangaLIB">
                                <IonIcon src="/icons/mangalib.svg" />
                            </a>
                        )}
                        {footer.remanga_url && (
                            <a href={footer.remanga_url} target="_blank" rel="noopener noreferrer"
                               className={styles.iconLink} title="Мы на Remanga">
                                <IonIcon src="/icons/remanga.svg" />
                            </a>
                        )}
                        {footer.readmanga_url && (
                            <a href={footer.readmanga_url} target="_blank" rel="noopener noreferrer"
                               className={styles.iconLink} title="Мы на ReadManga">
                                <IonIcon src="/icons/readmanga.svg" />
                            </a>
                        )}
                        {footer.telegram_url && (
                            <a href={footer.telegram_url} target="_blank" rel="noopener noreferrer"
                               className={styles.iconLink} title="Наш Telegram канал">
                                <IonIcon src="/icons/telegram.svg" />
                            </a>
                        )}
                    </div>
                </div>

                <div className={styles.linkGroup}>
                    <span className={styles.groupLabel}>Контакты</span>
                    <div className={styles.iconRow}>
                        {footer.contact_email && (
                            <a href={`mailto:${footer.contact_email}`} target="_blank" rel="noopener noreferrer"
                               className={styles.iconLink} title={footer.contact_email}>
                                <IonIcon src="/icons/md-mail-filled.svg" />
                            </a>
                        )}
                        {footer.contact_telegram_url && (
                            <a href={footer.contact_telegram_url} target="_blank" rel="noopener noreferrer"
                               className={styles.iconLink} title="Написать нам">
                                <IonIcon src="/icons/telegram.svg" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.bottom}>
                <div className={styles.bottomLinks}>
                    <span className={styles.copy}>redtail © {year}</span>
                    <span className={styles.dot}>•</span>
                    <a
                        className={styles.foxLink}
                        href="https://github.com/foxgirlsorg/redtail-frontend"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Source code"
                        >
                        <IonIcon src="/icons/github.svg" />
                        source
                    </a>
                </div>

                <a className={styles.foxLink} href="https://foxgirls.org" target="_blank" rel="noopener noreferrer">
                    <IonIcon src="/icons/foxgirlsorg.svg" />
                    foxgirls.org
                </a>
            </div>
        </footer>
    );
};