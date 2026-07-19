'use client';

import styles from './IndexIntro.module.css';
import { IonIcon } from '../IonIcon';

export const IntroSection = () => {
    return (
        <div className={styles.intro}>
            <div className={styles.introbg}></div>
            <div className={styles.introinner}>
                <div className={styles.introtitle}>
                    <img src="/wordmark.svg" alt="REDTAIL" />
                </div>
            </div>
            <div className={styles.introarrowdown}>
                <IonIcon src="/icons/arrow-down-outline.svg"  onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}/>
            </div>
        </div>
    );
};
