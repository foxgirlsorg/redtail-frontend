'use client';

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { IonIcon } from '@/components/IonIcon';
import { Spinner, ErrorBanner } from '@/components/Auth';
import pageStyles from '../auth-page.module.css';
import styles from '@/components/Auth/authModal.module.css';

function ResetForm() {
    const { resetPassword }  = useAuth();
    const searchParams       = useSearchParams();
    const router             = useRouter();

    const code = searchParams.get('code') ?? '';
    const from = searchParams.get('from') ?? '/';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!success) return;
        timer.current = setTimeout(() => router.push(from), 2500);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [success, from, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!code)                { setError('Код сброса не найден. Перейдите по ссылке из письма.'); return; }
        if (!password)            { setError('Введите новый пароль'); return; }
        if (password.length < 6)  { setError('Минимум 6 символов'); return; }
        if (password !== confirm)  { setError('Пароли не совпадают'); return; }
        setLoading(true);
        try   { await resetPassword(code, password, confirm); setSuccess(true); }
        catch (err: any) { setError(err.message ?? 'Ошибка. Возможно, ссылка устарела.'); }
        finally { setLoading(false); }
    };

    if (success) return (
        <div className={pageStyles.card}>
            <div className={pageStyles.statusCard}>
                <div className={`${pageStyles.statusIcon} ${pageStyles.statusIconSuccess}`}>
                    <IonIcon src="/icons/checkmark-circle-outline.svg" />
                </div>
                <h1 className={pageStyles.statusTitle}>ПАРОЛЬ ИЗМЕНЁН</h1>
                <p className={pageStyles.statusDesc}>Перенаправляем вас автоматически…</p>
                <button className={pageStyles.statusBtn} onClick={() => router.push(from)}>
                    <IonIcon src="/icons/arrow-forward-outline.svg" />
                    {from === '/' ? 'На главную' : 'Вернуться'}
                </button>
            </div>
        </div>
    );

    if (!code) return (
        <div className={pageStyles.card}>
            <div className={pageStyles.statusCard}>
                <div className={`${pageStyles.statusIcon} ${pageStyles.statusIconError}`}>
                    <IonIcon src="/icons/warning-outline.svg" />
                </div>
                <h1 className={pageStyles.statusTitle}>НЕВЕРНАЯ ССЫЛКА</h1>
                <p className={pageStyles.statusDesc}>
                    Код сброса пароля не найден. Перейдите по ссылке из письма или запросите новое письмо.
                </p>
                <button className={pageStyles.statusBtn} onClick={() => router.push('/auth/login')}>
                    <IonIcon src="/icons/arrow-back-outline.svg" />
                    Ко входу
                </button>
            </div>
        </div>
    );

    return (
        <div className={pageStyles.card}>
            <div className={pageStyles.header}>
                <div className={pageStyles.headerLeft}>
                    <span className={pageStyles.title}>НОВЫЙ ПАРОЛЬ</span>
                    <span className={pageStyles.subtitle}>Введите новый пароль для аккаунта</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.body}>
                {error && <ErrorBanner msg={error} />}

                <div className={styles.field}>
                    <label className={styles.label}>Новый пароль</label>
                    <div className={styles.passwordWrapper}>
                        <input className={styles.input} type={showPw ? 'text' : 'password'}
                               placeholder="Минимум 6 символов" value={password}
                               onChange={e => setPassword(e.target.value)}
                               autoComplete="new-password" autoFocus />
                        <button type="button" className={styles.passwordToggle} tabIndex={-1}
                                onClick={() => setShowPw(p => !p)}>
                            <IonIcon src={showPw ? '/icons/eye-off-outline.svg' : '/icons/eye-outline.svg'} />
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Повтор пароля</label>
                    <input
                        className={`${styles.input} ${confirm && confirm !== password ? styles.inputError : ''}`}
                        type={showPw ? 'text' : 'password'} placeholder="••••••••"
                        value={confirm} onChange={e => setConfirm(e.target.value)}
                        autoComplete="new-password" />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <Spinner /> : <IonIcon src="/icons/lock-closed-outline.svg" />}
                    Сохранить пароль
                </button>

                <div className={styles.switchRow}>
                    <button type="button" className={styles.switchLink}
                            onClick={() => router.push('/auth/login')}>
                        ← Вернуться ко входу
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className={pageStyles.page}>
            <div className={pageStyles.bg}>
                <div className={pageStyles.bgImg} />
                <div className={pageStyles.bgOverlay} />
            </div>
            <Suspense fallback={<div className={pageStyles.card}><span className={pageStyles.bigSpinner} /></div>}>
                <ResetForm />
            </Suspense>
        </main>
    );
}
