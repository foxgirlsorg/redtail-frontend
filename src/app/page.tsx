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
                    <h1>foxgirls.org</h1>
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
