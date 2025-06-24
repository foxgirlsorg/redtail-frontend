import styles from "@/components/MemberCard/MemberCard.module.css"
import { IonIcon } from '../IonIcon';
import { RouterButton } from '../Button/RouterButton';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;
type MemberCardProps = {
    member: any;
    key?: number;
};

export const MemberCard = ({member}:MemberCardProps) => {
    const thumbnail = member.image?.formats?.thumbnail?.url;
    return (
        <div className={styles.card}>
            <img className={styles.photo} src={STRAPI_DOMAIN + thumbnail} alt={member.nickname}/>
            <div className={styles.info}>
                <h5 className={styles.nickname}>{member.nickname}</h5>
                <span className={styles.role}>{member.role}</span>
            </div>
        </div>
    );
};


