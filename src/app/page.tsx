import {getFooter, getTitleList, getTeamMembers} from '@/lib/strapiClient';
import { IntroSection } from '@/components/Intro/IndexIntro';
import {TitleCard as TitleCard} from '@/components/TitleCard/TitleCard';
import styles from './page.module.css'
import {MemberCard} from "@/components/MemberCard/MemberCard";
import {Footer} from "@/components/Footer/Footer";

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

export default async function HomePage() {
    const mangas = await getTitleList();
    const team = await getTeamMembers();
    const footer = await getFooter();

    return (
        <main>
            <IntroSection/>
            <div className={`${styles.section} ${styles.sectionbg}`}>
                <h2 className={styles.sectionTitle}>Наши переводы</h2>
                <div className={styles.cardListWrapper}>
                    <ul className={styles.cardList}>
                        {mangas.map((manga) => {
                            return (
                                <TitleCard title={manga} key={manga.id} strDomain={STRAPI_DOMAIN}></TitleCard>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <div className={`${styles.section} ${styles.sectionbg}`}>
                <h2 className={styles.sectionTitle}>Команда</h2>
                <div className={styles.cardListWrapper}>
                    <ul className={styles.cardList}>
                        {team.map((member) => {
                            return (
                                <MemberCard member={member} key={member.id} strDomain={STRAPI_DOMAIN}></MemberCard>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className={styles.sectionbg}>
                <Footer footer={footer}/>
            </div>

        </main>
    );
}
