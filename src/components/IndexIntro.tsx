'use client';

import styles from './indexIntro.module.css';
import { IonIcon } from './IonIcons';

export const IntroSection = () => {
    return (
        <div className={styles.intro}>
            <div className={styles.introbg}></div>
            <div className={styles.introinner}>
                <div className={styles.introtitle}>
                    <img src="/redtail.svg" alt="REDTAIL" />
                </div>
            </div>
            <div className={styles.introarrowdown}>
                <IonIcon src="/icons/arrow-down-outline.svg"  onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}/>
            </div>
        </div>
    );
};
