'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IonIcon } from '@/components/IonIcon';
import { LoginView, ForgotPasswordView } from '@/components/Auth';
import { type AuthModalView } from '@/lib/authContext';
import pageStyles from '../auth-page.module.css';
import styles from '@/components/Auth/authModal.module.css';

function LoginPageInner() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const from         = searchParams.get('from') ?? '/';

    const [subView, setSubView] = React.useState<AuthModalView>('login');

    const handleSuccess = () => router.push(from);
    const handleSwitch = (v: AuthModalView) => {
        if (v === 'register') { router.push(`/auth/register?from=${encodeURIComponent(from)}`); return; }
        setSubView(v);
    };

    return (
        <div className={pageStyles.card}>
            <div className={pageStyles.header}>
                <div className={pageStyles.headerLeft}>
                    <span className={pageStyles.title}>
                        {subView === 'forgotPassword' ? 'СБРОС ПАРОЛЯ' : 'ВХОД'}
                    </span>
                    <span className={pageStyles.subtitle}>
                        {subView === 'forgotPassword' ? 'Восстановление доступа' : 'Войти в аккаунт RedTail'}
                    </span>
                </div>
                <Link
                    href={from === '/' ? '/' : from}
                    className={pageStyles.backBtn}
                    aria-label="Назад"
                >
                    <IonIcon src="/icons/arrow-back-outline.svg" />
                    Назад
                </Link>
            </div>

            {subView === 'login' && (
                <LoginView
                    onSuccessAction={handleSuccess}
                    onSwitchAction={handleSwitch}
                    footer={
                        <div className={styles.switchRow}>
                            Нет аккаунта?{' '}
                            <Link
                                href={`/auth/register?from=${encodeURIComponent(from)}`}
                                className={styles.switchLink}
                            >
                                Зарегистрироваться
                            </Link>
                        </div>
                    }
                />
            )}

            {subView === 'forgotPassword' && (
                <ForgotPasswordView
                    onSwitchAction={handleSwitch}
                    footer={
                        <div className={styles.switchRow}>
                            <button type="button" className={styles.switchLink}
                                    onClick={() => setSubView('login')}>
                                ← Назад ко входу
                            </button>
                        </div>
                    }
                />
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className={pageStyles.page}>
            <div className={pageStyles.bg}>
                <div className={pageStyles.bgImg} />
                <div className={pageStyles.bgOverlay} />
            </div>
            <Suspense fallback={<div className={pageStyles.card}><span className={pageStyles.bigSpinner} /></div>}>
                <LoginPageInner />
            </Suspense>
        </main>
    );
}
