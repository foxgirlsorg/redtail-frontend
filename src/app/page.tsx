import { getMangaList, getTeamMembers } from '@/lib/strapiClient';
import { IntroSection } from '@/components/IndexIntro';
import {TitleCard as TitleCard} from '@/components/TitleCard';
import styles from './page.module.css'

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

export default async function HomePage() {
    const mangas = await getMangaList();
    const team = await getTeamMembers();

    return (
        <div>
            <IntroSection/>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Наши переводы</h2>
                <ul className={styles.cardList}>
                    {mangas.map((manga) => {
                        return (
                            <TitleCard title={manga} key={manga.id}></TitleCard>
                        );
                    })}
                </ul>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Команда</h2>
                <ul className={styles.cardList}>
                    {mangas.map((manga) => {
                        return (
                            <TitleCard title={manga} key={manga.id}></TitleCard>
                        );
                    })}
                </ul>
            </div>

        </div>
    );
}
