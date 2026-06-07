'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ProfileView } from '@/components/Auth';
import { IonIcon } from '@/components/IonIcon';
import pageStyles from '../auth-page.module.css';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login?from=/auth/profile');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <main className={pageStyles.page}>
                <div className={pageStyles.bg}>
                    <div className={pageStyles.bgImg} />
                    <div className={pageStyles.bgOverlay} />
                </div>
                <span className={pageStyles.bigSpinner} />
            </main>
        );
    }

    return (
        <main className={pageStyles.page}>
            <div className={pageStyles.bg}>
                <div className={pageStyles.bgImg} />
                <div className={pageStyles.bgOverlay} />
            </div>

            <div className={`${pageStyles.card} ${pageStyles.cardWide}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.headerLeft}>
                        <span className={pageStyles.title}>МОЙ ПРОФИЛЬ</span>
                        <span className={pageStyles.subtitle}>Управление аккаунтом</span>
                    </div>
                    <button
                        className={pageStyles.backBtn}
                        onClick={() => router.back()}
                        aria-label="Назад"
                    >
                        <IonIcon src="/icons/arrow-back-outline.svg" />
                        Назад
                    </button>
                </div>

                <ProfileView onCloseAction={() => router.push('/')} />
            </div>
        </main>
    );
}
