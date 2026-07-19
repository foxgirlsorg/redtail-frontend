import { getFooter } from '@/lib/strapiClient';
import { Footer } from '@/components/Footer/Footer';
import { BrandingClient } from './BrandingClient';
import styles from './page.module.css';

export const metadata = { title: 'branding — adm — RedTail' };

const STRAPI_DOMAIN = process.env.NEXT_PUBLIC_STRAPI_DOMAIN;

export default async function BrandingPage() {
    const footer = await getFooter();
    return (
        <>
            <div className={styles.backdrop}>
                <div className={styles.backdropImage} />
                <div className={styles.backdropVignette} />
                <div className={styles.backdropNoise} />
            </div>

            <div className={styles.page}>
                <h1 className={styles.title}>Брендинг</h1>
                <BrandingClient />
            </div>

            <Footer footer={footer} strDomain={STRAPI_DOMAIN} />
        </>
    );
}
