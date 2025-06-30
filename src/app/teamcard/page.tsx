import {getTeamMembers} from '@/lib/strapiClient';
import styles from './page.module.css'
import {MemberCard} from "@/components/MemberCard/MemberCard";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

export default async function HomePage() {
    const team = await getTeamMembers();

    return (
        <main className={styles.main}>
            <div className={styles.leftSide}>
                <img src="/teamcard/cardlogo.png"/>
            </div>
                <ul className={styles.cardList}>
                    {team.map((member, i) => {
                        return (
                            <li className={styles.memberCard} key={i}>
                                <MemberCard member={member} key={member.id} strDomain={STRAPI_DOMAIN} hideIcons={true}></MemberCard>
                            </li>
                        );
                    })}
                </ul>

        </main>
    );
}
