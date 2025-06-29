import styles from "@/components/Footer/Footer.module.css"
import { IonIcon } from '../IonIcon';

type FooterProps = {
    footer: any;
};

export const Footer = ({footer}:FooterProps) => {
    const year = new Date().getFullYear()
    return (
        <div className={styles.footer}>
            <div className={styles.row}>
                <div className={styles.nameAndWarning}>
                    <span className={styles.teamname}>REDTAIL</span>
                    <br/>
                    <span className={styles.warning}>{footer.warning}</span>
                </div>
                <div className={styles.rowInner}>
                    <div className={styles.links}>
                        <span className={styles.sectionTitle}>Ссылки</span>
                        <div className={styles.linkIcons}>
                            {footer.mangalib_url && (
                                <a href={footer.mangalib_url} target="_blank" title="Мы на MangaLIB">
                                    <IonIcon src="/icons/mangalib.svg"/>
                                </a>
                            )}
                            {footer.remanga_url && (
                                <a href={footer.remanga_url} target="_blank" title="Мы на Remanga">
                                    <IonIcon src="/icons/remanga.svg"/>
                                </a>
                            )}
                            {footer.readmanga_url && (
                                <a href={footer.readmanga_url} target="_blank" title="Мы на ReadManga">
                                    <IonIcon src="/icons/readmanga.svg"/>
                                </a>
                            )}
                            {footer.telegram_url && (
                                <a href={footer.telegram_url} target="_blank" title="Наш Telegram канал">
                                    <IonIcon src="/icons/telegram.svg"/>
                                </a>
                            )}
                        </div>
                    </div>
                    <div className={styles.links}>
                        <span className={styles.sectionTitle}>Обратная связь</span>
                        <div className={styles.linkIcons}>
                            {footer.contact_email && (
                                <a href={`mailto:${footer.contact_email}`} target="_blank">
                                    <IonIcon src="/icons/md-mail-filled.svg"/>
                                </a>
                            )}
                            {footer.contact_telegram_url && (
                                <a href={footer.contact_telegram_url} target="_blank">
                                    <IonIcon src="/icons/telegram.svg"/>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div>

                <a className={styles.foxGirlsOrg} href="https://foxgirls.org" target={"_blank"}>
                    <span>{year} -</span>
                    <IonIcon src="/icons/foxgirlsorg.svg"/>
                    <span>foxgirls.org</span>
                </a>
            </div>
        </div>
    );
};


