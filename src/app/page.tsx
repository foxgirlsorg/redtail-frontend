import { getFooter, getTitleList, getTeamMembers, getArticleList } from '@/lib/strapiClient';
import { TitleCard } from '@/components/TitleCard/TitleCard';
import { MemberCard } from '@/components/MemberCard/MemberCard';
import { Footer } from '@/components/Footer/Footer';
import styles from './page.module.css';
import { IonIcon } from '@/components/IonIcon';
import {BgVideo} from "@/components/BgVideo/BgVIdeo";
import { ArticleCard } from '@/components/ArticleCard/ArticleCard';

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

export const dynamic = 'force-dynamic';


export default async function HomePage() {
    const mangas = await getTitleList();
    const articles = await getArticleList();
    const team = await getTeamMembers();
    const footer = await getFooter();


    return (
        <main>
            <div className={styles.bg}>
                <BgVideo
                    className={styles.bgVideo}
                    src="/bg.webm"
                    poster="/bg-poster.jpg"
                />
                <div className={styles.videoOverlay} />
                <div className={styles.bgNoise} />
            </div>


            <section className={styles.hero} id="home">
                <div className={styles.heroContent}>
                    <img src="/redtail.svg" alt="REDTAIL" className={styles.heroLogo} />
                </div>
                <a href="#titles" className={styles.scrollIndicator} aria-label="Прокрутить вниз">
                    <IonIcon src="/icons/arrow-down-outline.svg" />
                </a>
            </section>


            <section className={styles.section} id="titles">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        переводы <span className={styles.highlight}>тайтлов</span>
                    </h2>
                </div>
                <div className={styles.cardListWrapper}>
                    <ul className={styles.cardList}>
                        {mangas.map((manga, key) => (
                            <TitleCard title={manga} key={key} strDomain={STRAPI_DOMAIN} />
                        ))}
                    </ul>
                </div>
            </section>



            {articles.length > 0 && (
                <section className={styles.section} id="articles">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            другие <span className={styles.highlight}>переводы</span>
                        </h2>
                    </div>
                    <div className={styles.cardListWrapper}>
                        <ul className={styles.cardList}>
                            {articles.map((article) => (
                                <ArticleCard article={article} key={article.id} strDomain={STRAPI_DOMAIN} />
                            ))}
                        </ul>
                    </div>
                </section>
            )}


            <section className={styles.section} id="team">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        наша <span className={styles.highlight}>команда</span>
                    </h2>
                </div>
                <div className={styles.cardListWrapper}>
                    <ul className={`${styles.cardList} ${styles.cardListMembers}`}>
                        {team.map((member) => (
                            <MemberCard member={member} key={member.id} strDomain={STRAPI_DOMAIN} />
                        ))}
                    </ul>
                </div>
            </section>

            <Footer footer={footer} />
        </main>
    );
}