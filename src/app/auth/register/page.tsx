'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IonIcon } from '@/components/IonIcon';
import { RegisterView } from '@/components/Auth';
import { type AuthModalView } from '@/lib/authContext';
import pageStyles from '../auth-page.module.css';
import styles from '@/components/Auth/authModal.module.css';

function RegisterPageInner() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const from         = searchParams.get('from') ?? '/';

    const handleSuccess = () => router.push(from);

    const handleSwitch = (v: AuthModalView) => {
        if (v === 'login') { router.push(`/auth/login?from=${encodeURIComponent(from)}`); }
    };

    return (
        <div className={pageStyles.card}>
            <div className={pageStyles.header}>
                <div className={pageStyles.headerLeft}>
                    <span className={pageStyles.title}>РЕГИСТРАЦИЯ</span>
                    <span className={pageStyles.subtitle}>Создать аккаунт RedTail</span>
                </div>
                <Link
                    href={`/auth/login?from=${encodeURIComponent(from)}`}
                    className={pageStyles.backBtn}
                    aria-label="Назад ко входу"
                >
                    <IonIcon src="/icons/arrow-back-outline.svg" />
                    Назад
                </Link>
            </div>

            <RegisterView
                onSuccessAction={handleSuccess}
                onSwitchAction={handleSwitch}
                footer={
                    <div className={styles.switchRow}>
                        Уже есть аккаунт?{' '}
                        <Link
                            href={`/auth/login?from=${encodeURIComponent(from)}`}
                            className={styles.switchLink}
                        >
                            Войти
                        </Link>
                    </div>
                }
            />
        </div>
    );
}

export default function RegisterPage() {
    return (
        <main className={pageStyles.page}>
            <div className={pageStyles.bg}>
                <div className={pageStyles.bgImg} />
                <div className={pageStyles.bgOverlay} />
            </div>
            <Suspense fallback={<div className={pageStyles.card}><span className={pageStyles.bigSpinner} /></div>}>
                <RegisterPageInner />
            </Suspense>
        </main>
    );
}
