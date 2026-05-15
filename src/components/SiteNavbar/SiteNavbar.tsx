'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './SiteNavbar.module.css';
import { IonIcon } from '@/components/IonIcon';
import {GoBackBtn} from "@/components/SiteNavbar/GoBackBtn/GoBackBtn";

type NavLink = { name: string; href: string };
type NavVariant = 'home' | 'title' | 'inner';

function resolveNav(pathname: string): { variant: NavVariant; backHref: string } | null {
    if (pathname.startsWith('/article/') || pathname.includes('/reader/')) {
        return null;
    }
    if (pathname === '/' || pathname === '') {
        return { variant: 'home', backHref: '/' };
    }
    if (pathname.startsWith('/manga/') || pathname.startsWith('/book/')) {
        return { variant: 'title', backHref: '/#titles' };
    }
    return { variant: 'inner', backHref: '/' };
}

const homeLinks: NavLink[] = [
    { name: 'Тайтлы', href: '#titles' },
    { name: 'Статьи',  href: '#team'   },
    { name: 'Команда',  href: '#team'   },
];

const titleLinks: NavLink[] = [
    { name: 'Главная', href: '/' },
    { name: 'Тайтлы', href: '/#titles' },
    { name: 'Команда',  href: '/#team'   },
];

const innerLinks: NavLink[] = [
    { name: 'Главная', href: '/' },
    { name: 'Тайтлы', href: '/#titles' },
    { name: 'Команда',  href: '/#team'   },
];

export const SiteNavbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled]     = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const nav = resolveNav(pathname);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    if (!nav) return null;

    const { variant, backHref } = nav;
    const showBack = variant === 'title';
    const links = variant === 'home'  ? homeLinks
        : variant === 'title' ? titleLinks
            : innerLinks;

    const allMobileLinks: NavLink[] = showBack
        ? [{ name: '← Назад', href: backHref }, ...links]
        : links;

    return (
        <>
            <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
                <div className={styles.container}>

                    {showBack && (
                        <GoBackBtn></GoBackBtn>
                    )}

                    <a href="/" className={styles.logo}>
                        <IonIcon src="/icons/redtail.svg" className={styles.logoIcon} />
                        <span className={styles.logoTitle}>REDTAIL</span>
                    </a>

                    <nav className={styles.desktopNav}>
                        {links.map((link, i) => (
                            <a key={i} href={link.href}>{link.name}</a>
                        ))}
                    </nav>

                    <button
                        className={styles.mobileButton}
                        aria-label="Открыть меню"
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(true)}
                    >
                        <IonIcon src="/icons/menu-outline.svg" className={styles.menuIcon} />
                    </button>
                </div>
            </header>

            <div
                className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''} ${scrolled ? styles.scrolled : ''}`}
                aria-hidden={!mobileOpen}
            >
                <button
                    className={styles.mobileCloseButton}
                    aria-label="Закрыть меню"
                    onClick={() => setMobileOpen(false)}
                >
                    <IonIcon src="/icons/close-outline.svg" className={styles.menuIcon} />
                </button>
                <div className={styles.mobileMenuContent}>
                    {allMobileLinks.map((link, i) => (
                        <a
                            key={i}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
};