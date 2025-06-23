// app/page.tsx
import { getMangaList } from '@/lib/strapiClient';
import styles from "./page.module.css"

const STRAPI_DOMAIN = process.env.PUBLIC_STRAPI_DOMAIN;

export default async function HomePage() {
    const mangas = await getMangaList();

    return (
        <div>
            <div className={styles.intro}>
                <div className={styles.introbg}></div>
                <div className={styles.introinner}>
                    <div className={styles.introtitle}>
                        <h1 className={styles.title}>REDTAIL</h1>
                        <h3 className={styles.subtitle}>Просто команда переводчиков</h3>
                    </div>
                </div>
            </div>
            <ul>
                {mangas.map((manga) => {
                    const thumbnail = manga.cover?.formats?.small?.url;
                    const imageUrl = thumbnail ? `${STRAPI_DOMAIN}${thumbnail}` : null;

                    return (
                        <li key={manga.id}>
                            <strong>{manga.title}</strong>
                            {imageUrl && <img src={imageUrl} alt="cover" />}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
