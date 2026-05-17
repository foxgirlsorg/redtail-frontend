import React from 'react';
import type { Metadata } from 'next';
import styles from './error-page.module.css';

export const metadata: Metadata = {
    title: '404 — Не найдено | RedTail',
};

export default function NotFound() {
    const year = new Date().getFullYear();
    return (
        <div className={styles.page}>
            <div className={styles.bg}>
                <div className={styles.bgImg} />
                <div className={styles.bgOverlay} />
                <div className={styles.bgNoise} />
            </div>

            <div className={styles.content}>
                <div className={styles.codeGhost}>404</div>

                <div className={styles.inner}>
                    <span className={styles.label}>Ошибка 404</span>
                    <h1 className={styles.heading}>Страница не найдена</h1>
                    <div className={styles.divider} />
                    <p className={styles.desc}>
                        Такой страницы не существует или она была удалена.<br />
                        Возможно, вы перешли по устаревшей ссылке.
                    </p>
                    <a className={styles.btn} href="/">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        На главную
                    </a>
                </div>
            </div>

            <div className={styles.footer}>
                <span className={styles.copy}>redtail © {year}</span>
            </div>
        </div>
    );
}