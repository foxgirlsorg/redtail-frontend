import { getTeamMembers } from '@/lib/strapiClient';
import styles from './page.module.css';
import { IonIcon } from '@/components/IonIcon';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

export default async function TeamCardPage() {
    const team = await getTeamMembers();

    return (
        <main className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <a href="https://redtail.foxgirls.org" className={styles.brandUrl}>
                        redtail.foxgirls.org
                    </a>
                    <span className={styles.brandName}>REDTAIL</span>
                    <span className={styles.brandSub}>Команда переводчиков</span>
                </div>
                <IonIcon src="/icons/redtail.svg" className={styles.headerIcon} />
            </div>

            <div className={styles.divider} />

            <ul className={styles.grid}>
                {team.map((member) => {
                    const thumb = member.image?.formats?.thumbnail?.url;
                    return (
                        <li key={member.id} className={styles.member}>
                            <div className={styles.avatar}>
                                {thumb && (
                                    <img
                                        src={STRAPI_DOMAIN + thumb}
                                        alt={member.nickname}
                                        className={styles.avatarImg}
                                    />
                                )}
                            </div>
                            <div className={styles.info}>
                                <span className={styles.nickname}>{member.nickname}</span>
                                <span className={styles.role}>{member.role}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </main>
    );
}