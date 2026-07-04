import styles from "@/components/Footer/Footer.module.css"
import { IonIcon } from '../IonIcon';

type FooterProps = {
    footer: any;
    strDomain?: string;
};

export const Footer = ({ footer, strDomain }: FooterProps) => {
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

                {footer.urls?.length > 0 && (
                    <div className={styles.linkGroup}>
                        <span className={styles.groupLabel}>Ссылки</span>
                        <div className={styles.iconRow}>
                            {footer.urls.map((u: any, i: number) => (
                                <a key={i} href={u.url} target="_blank" rel="noopener noreferrer"
                                   className={styles.iconLink} title={u.label}>
                                    <IonIcon src={u.icon_file?.mime === 'image/svg+xml' ? (strDomain ?? '') + u.icon_file.url : (u.icon || '/icons/link-outline-45.svg')} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

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