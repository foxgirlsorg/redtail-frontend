'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, type AuthModalView } from '@/lib/authContext';
import { IonIcon } from '@/components/IonIcon';
import { LoginView, RegisterView, ForgotPasswordView, ProfileView } from './authForms';
import styles from './authModal.module.css';

const VIEW_META: Record<AuthModalView, { title: string; subtitle: string }> = {
    login:          { title: 'ВХОД',         subtitle: 'Войти в аккаунт RedTail' },
    register:       { title: 'РЕГИСТРАЦИЯ',  subtitle: 'Создать аккаунт RedTail' },
    forgotPassword: { title: 'СБРОС ПАРОЛЯ', subtitle: 'Восстановление доступа' },
    profile:        { title: 'МОЙ ПРОФИЛЬ',  subtitle: 'Управление аккаунтом' },
};

export function AuthModal() {
    const { modalView, closeModal } = useAuth();
    const [view, setView] = useState<AuthModalView>(modalView ?? 'login');
    const overlayRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (modalView) setView(modalView); }, [modalView]);
    useEffect(() => {
        if (!modalView) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [modalView, closeModal]);

    if (!modalView) return null;

    const { title, subtitle } = VIEW_META[view];

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={e => { if (e.target === overlayRef.current) closeModal(); }}
        >
            <div
                className={`${styles.modal} ${view === 'profile' ? styles.modalWide : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.title}>{title}</span>
                        <span className={styles.subtitle}>{subtitle}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={closeModal} aria-label="Закрыть">
                        <IonIcon src="/icons/close-outline.svg" />
                    </button>
                </div>

                {view === 'login' && (
                    <LoginView
                        onSuccessAction={closeModal}
                        onSwitchAction={setView}
                        footer={
                            <div className={styles.switchRow}>
                                Нет аккаунта?{' '}
                                <button type="button" className={styles.switchLink}
                                        onClick={() => setView('register')}>
                                    Зарегистрироваться
                                </button>
                            </div>
                        }
                    />
                )}
                {view === 'register' && (
                    <RegisterView
                        onSuccessAction={closeModal}
                        onSwitchAction={setView}
                        footer={
                            <div className={styles.switchRow}>
                                Уже есть аккаунт?{' '}
                                <button type="button" className={styles.switchLink}
                                        onClick={() => setView('login')}>
                                    Войти
                                </button>
                            </div>
                        }
                    />
                )}
                {view === 'forgotPassword' && (
                    <ForgotPasswordView onSwitchAction={setView} />
                )}
                {view === 'profile' && (
                    <ProfileView onCloseAction={closeModal} />
                )}
            </div>
        </div>
    );
}

export function AuthModalRoot() {
    const { modalView } = useAuth();
    if (!modalView) return null;
    return <AuthModal />;
}
