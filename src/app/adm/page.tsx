import Link from 'next/link';
import { getFooter } from '@/lib/strapiClient';
import { Footer } from '@/components/Footer/Footer';
import styles from './page.module.css';

export const metadata = { title: 'adm — RedTail' };

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN;

const HIDDEN: { name: string; description: string; href: string }[] = [
    { name: 'Teamcard', description: 'Генератор карточек команды', href: '/adm/teamcard' },
];

export default async function AdmPage() {
    const footer = await getFooter();
    return (
        <>
            <div className={styles.backdrop}>
                <div className={styles.backdropImage} />
                <div className={styles.backdropVignette} />
                <div className={styles.backdropNoise} />
            </div>

            <div className={styles.page}>
                <p className={styles.suspicion}>Как ты вообще сюда попал?</p>

                <div className={styles.hiddenList}>
                    {HIDDEN.map((item) => (
                        <div key={item.href} className={styles.hiddenItem}>
                            <div className={styles.hiddenItemInfo}>
                                <span className={styles.hiddenItemName}>{item.name}</span>
                                <span className={styles.hiddenItemDesc}>{item.description}</span>
                            </div>
                            <Link href={item.href} className={styles.hiddenItemLink}>
                                открыть
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <Footer footer={footer} strDomain={STRAPI_DOMAIN} />
        </>
    );
}
