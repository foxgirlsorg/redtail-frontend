import styles from "@/components/MemberCard/MemberCard.module.css"
import { IonIcon } from '../IonIcon';

type MemberCardProps = {
    member: any;
    strDomain?: string;
    key?: number;
    hideIcons?: boolean;
};

export const MemberCard = ({ member, strDomain, hideIcons }: MemberCardProps) => {
    const thumbnail = member.image?.formats?.thumbnail?.url;
    return (
        <div className={styles.card}>
            <div className={styles.avatarWrapper}>
                <img
                    className={styles.photo}
                    src={strDomain + thumbnail}
                    alt={member.nickname}
                />
            </div>
            <div className={`${styles.info} ${hideIcons ? styles.noIcons : ''}`}>
                <div>

                    <div className={styles.toprow}>
                        <h5 className={styles.nickname}>{member.nickname}</h5>
                        {!hideIcons && (
                            <div className={styles.links}>
                                {member.telegram_url && (
                                    <a href={member.telegram_url} target="_blank" aria-label="Telegram">
                                        <IonIcon src="/icons/telegram.svg" />
                                    </a>
                                )}
                                {member.email && (
                                    <a href={"mailto:" + member.email} target="_blank" aria-label="Email">
                                        <IonIcon src="/icons/md-mail-filled.svg" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                    <span className={styles.role}>{member.role}</span>
                </div>

            </div>
        </div>
    );
};