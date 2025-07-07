import styles from "@/components/MemberCard/MemberCard.module.css"
import { IonIcon } from '../IonIcon';
import { RouterButton } from '../Button/RouterButton';


type MemberCardProps = {
    member: any;
    strDomain?: string;
    key?: number;
    hideIcons?: boolean;
};

export const MemberCard = ({member, strDomain, hideIcons}:MemberCardProps) => {
    const thumbnail = member.image?.formats?.thumbnail?.url;
    return (
        <div className={styles.card}>
            <img className={styles.photo} src={strDomain + thumbnail} alt={member.nickname}/>
            <div className={`${styles.info} ${hideIcons && styles.noIcons}`}>
                <div>
                    <h5 className={styles.nickname}>{member.nickname}</h5>
                    <span className={styles.role}>{member.role}</span>
                </div>
                <div className={styles.links}>
                    {(member.telegram_url && !hideIcons) && (
                        <a href={member.telegram_url} target="_blank">
                            <IonIcon src="/icons/telegram.svg"/>
                        </a>
                    )}
                    {(member.email && !hideIcons)  && (
                        <a href={"mailto:" + member.email} target="_blank">
                            <IonIcon src="/icons/md-mail-filled.svg"/>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};


