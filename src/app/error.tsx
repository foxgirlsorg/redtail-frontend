'use client';

import React from 'react';
import styles from './error-page.module.css';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className={styles.page}>
            <div className={styles.bg}>
                <div className={styles.bgImg} />
                <div className={styles.bgOverlay} />
                <div className={styles.bgNoise} />
            </div>

            <div className={styles.content}>
                <div className={styles.codeGhost}>500</div>

                <div className={styles.inner}>
                    <span className={styles.label}>Ошибка сервера</span>
                    <h1 className={styles.heading}>Что-то пошло не так</h1>
                    <div className={styles.divider} />
                    <p className={styles.desc}>
                        На нашей стороне произошла непредвиденная ошибка.<br />
                        Попробуйте обновить страницу или вернитесь позже.
                    </p>
                    <div className={styles.btnRow}>
                        <button className={styles.btn} onClick={reset}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Попробовать снова
                        </button>
                        <a className={`${styles.btn} ${styles.btnGhost}`} href="/">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            На главную
                        </a>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <a href="/">redtail</a>
            </div>
        </div>
    );
}