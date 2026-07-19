'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, type AuthModalView } from '@/lib/authContext';
import { overrideErrorMessage } from '@/lib/errorOverrides';
import { IonIcon } from '@/components/IonIcon';
import styles from './authModal.module.css';

export function Spinner() { return <span className={styles.spinner} />; }

export function ErrorBanner({ msg }: { msg: string }) {
    return (
        <div className={styles.errorBanner}>
            <IonIcon src="/icons/alert-circle-outline.svg" />{overrideErrorMessage(msg)}
        </div>
    );
}

export function SuccessBanner({ msg }: { msg: string }) {
    return (
        <div className={styles.successBanner}>
            <IonIcon src="/icons/checkmark-circle-outline.svg" />{msg}
        </div>
    );
}

function PrivacyPolicyInlineButton({ onClickAction }: { onClickAction: () => void }) {
    return (
        <button type="button" className={styles.inlineLink} onClick={onClickAction}>
            политикой конфиденциальности
        </button>
    );
}

export type LoginViewProps = {
    onSuccessAction: () => void;
    onSwitchAction: (v: AuthModalView) => void;
    footer?: React.ReactNode;
};

export function LoginView({ onSuccessAction, onSwitchAction, footer }: LoginViewProps) {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword]     = useState('');
    const [showPw, setShowPw]         = useState(false);
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!identifier.trim() || !password) { setError('Заполните все поля'); return; }
        setLoading(true);
        try   { await login(identifier.trim(), password); onSuccessAction(); }
        catch (err: any) { setError(err.message ?? 'Ошибка входа'); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.body}>
            {error && <ErrorBanner msg={error} />}

            <div className={styles.field}>
                <label className={styles.label}>Email или логин</label>
                <input className={styles.input} type="text" placeholder="user@example.com"
                       value={identifier} onChange={e => setIdentifier(e.target.value)}
                       autoComplete="username" autoFocus />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Пароль</label>
                <div className={styles.passwordWrapper}>
                    <input className={styles.input} type={showPw ? 'text' : 'password'}
                           placeholder="••••••••" value={password}
                           onChange={e => setPassword(e.target.value)}
                           autoComplete="current-password" />
                    <button type="button" className={styles.passwordToggle} tabIndex={-1}
                            onClick={() => setShowPw(p => !p)}>
                        <IonIcon src={showPw ? '/icons/eye-off-outline.svg' : '/icons/eye-outline.svg'} />
                    </button>
                </div>
                <button type="button" className={styles.forgotLink}
                        onClick={() => onSwitchAction('forgotPassword')}>
                    Забыли пароль?
                </button>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Spinner /> : <IonIcon src="/icons/log-in-outline.svg" />}
                Войти
            </button>

            {footer ?? (
                <div className={styles.switchRow}>
                    Нет аккаунта?{' '}
                    <button type="button" className={styles.switchLink}
                            onClick={() => onSwitchAction('register')}>
                        Зарегистрироваться
                    </button>
                </div>
            )}
        </form>
    );
}

export type RegisterViewProps = {
    onSuccessAction: () => void;
    onSwitchAction: (v: AuthModalView) => void;
    footer?: React.ReactNode;
};

export function RegisterView({ onSuccessAction, onSwitchAction, footer }: RegisterViewProps) {
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !email.trim() || !password) { setError('Заполните все поля'); return; }
        if (password !== confirm) { setError('Пароли не совпадают'); return; }
        if (password.length < 6)  { setError('Минимум 6 символов в пароле'); return; }
        setLoading(true);
        try   { await register(username.trim(), email.trim(), password); onSuccessAction(); }
        catch (err: any) { setError(err.message ?? 'Ошибка регистрации'); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.body}>
            {error && <ErrorBanner msg={error} />}

            <div className={styles.field}>
                <label className={styles.label}>Имя пользователя</label>
                <input className={styles.input} type="text" placeholder="foxgirl42"
                       value={username} onChange={e => setUsername(e.target.value)}
                       autoComplete="username" required autoFocus />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" placeholder="user@example.com"
                       value={email} onChange={e => setEmail(e.target.value)}
                       autoComplete="email" required />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Пароль</label>
                <div className={styles.passwordWrapper}>
                    <input className={styles.input} type={showPw ? 'text' : 'password'}
                           placeholder="Минимум 6 символов" value={password}
                           onChange={e => setPassword(e.target.value)}
                           autoComplete="new-password" required />
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
                    autoComplete="new-password" required />
            </div>

            <p className={styles.privacyNotice}>
                Создавая аккаунт, вы соглашаетесь с нашей{' '}
                <PrivacyPolicyInlineButton onClickAction={() => onSwitchAction('privacyPolicy')} />.
            </p>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Spinner /> : <IonIcon src="/icons/person-add-outline.svg" />}
                Создать аккаунт
            </button>

            {footer ?? (
                <div className={styles.switchRow}>
                    Уже есть аккаунт?{' '}
                    <button type="button" className={styles.switchLink}
                            onClick={() => onSwitchAction('login')}>
                        Войти
                    </button>
                </div>
            )}
        </form>
    );
}

export type ForgotPasswordViewProps = {
    onSwitchAction: (v: AuthModalView) => void;
    footer?: React.ReactNode;
};

export function ForgotPasswordView({ onSwitchAction, footer }: ForgotPasswordViewProps) {
    const { requestPasswordReset } = useAuth();
    const [email, setEmail]       = useState('');
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) { setError('Введите email'); return; }
        setLoading(true);
        try   { await requestPasswordReset(email.trim()); setSuccess(true); }
        catch (err: any) { setError(err.message ?? 'Ошибка отправки'); }
        finally { setLoading(false); }
    };

    if (success) return (
        <div className={styles.body}>
            <SuccessBanner msg={`Письмо отправлено на ${email}. Проверьте почту.`} />
            <button type="button" className={styles.submitBtn}
                    onClick={() => onSwitchAction('login')}>
                <IonIcon src="/icons/arrow-back-outline.svg" />
                Вернуться ко входу
            </button>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className={styles.body}>
            <p className={styles.infoText}>Введите email — пришлём ссылку для сброса пароля.</p>
            {error && <ErrorBanner msg={error} />}
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" placeholder="user@example.com"
                       value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Spinner /> : <IonIcon src="/icons/mail-outline.svg" />}
                Отправить письмо
            </button>
            {footer ?? (
                <div className={styles.switchRow}>
                    <button type="button" className={styles.switchLink}
                            onClick={() => onSwitchAction('login')}>
                        ← Назад
                    </button>
                </div>
            )}
        </form>
    );
}

export function PrivacyPolicyView() { // TODO: fetch this from the backend
    return (
        <div className={`${styles.body} ${styles.policyBody}`}>
            <section className={styles.policySection}>
                <span className={styles.sectionLabel}>Какие данные мы собираем</span>
                <p className={styles.policyText}>
                    Мы собираем данные аккаунта: имя пользователя, email и пароль в защищенном виде. Также
                    обрабатываются публичные действия, например комментарии, ответы и данные профиля, которые вы
                    сами публикуете. Для работы сайта могут использоваться cookies авторизации, базовые данные
                    сессии и статистика посещений, если аналитика включена.
                </p>
            </section>

            <section className={styles.policySection}>
                <span className={styles.sectionLabel}>Зачем это нужно</span>
                <p className={styles.policyText}>
                    Эти данные нужны, чтобы создать аккаунт, выполнить вход и поддерживать авторизованную сессию.
                    Они также используются для отображения ваших комментариев, аватара и имени пользователя в
                    интерфейсе сайта, а также для защиты от спама, злоупотреблений и несанкционированного доступа.
                </p>
            </section>

            <section className={styles.policySection}>
                <span className={styles.sectionLabel}>Доступ и хранение</span>
                <p className={styles.policyText}>
                    Мы не продаем персональные данные. Доступ к данным используется только для работы сайта,
                    модерации и технической поддержки. Данные хранятся до удаления аккаунта или до момента, когда
                    они больше не нужны для работы сервиса.
                </p>
            </section>

            <section className={styles.policySection}>
                <span className={styles.sectionLabel}>Ваши права</span>
                <p className={styles.policyText}>
                    Вы можете изменить данные профиля в аккаунте, запросить сброс пароля или обратиться к нам для
                    удаления данных, связанных с аккаунтом.
                </p>
            </section>
        </div>
    );
}

export type ProfileViewProps = {
    onCloseAction: () => void;
};

const CROP_SIZE = 280;
const AVATAR_OUTPUT_SIZE = 256;

export function AvatarCropper({
    sourceUrl,
    onCancelAction,
    onApplyAction,
}: {
    sourceUrl: string;
    onCancelAction: () => void;
    onApplyAction: (file: File) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [processing, setProcessing] = useState(false);

    const getMetrics = (nextZoom = zoom) => {
        if (!image) return null;
        const scale = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight) * nextZoom;
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        return {
            scale,
            width,
            height,
            maxX: Math.max(0, (width - CROP_SIZE) / 2),
            maxY: Math.max(0, (height - CROP_SIZE) / 2),
        };
    };

    const clampOffset = (x: number, y: number, nextZoom = zoom) => {
        const metrics = getMetrics(nextZoom);
        if (!metrics) return { x: 0, y: 0 };
        return {
            x: Math.max(-metrics.maxX, Math.min(metrics.maxX, x)),
            y: Math.max(-metrics.maxY, Math.min(metrics.maxY, y)),
        };
    };

    useEffect(() => {
        const nextImage = new Image();
        nextImage.onload = () => setImage(nextImage);
        nextImage.src = sourceUrl;
    }, [sourceUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const metrics = getMetrics();
        if (!canvas || !image || !metrics) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
        context.drawImage(
            image,
            (CROP_SIZE - metrics.width) / 2 + offset.x,
            (CROP_SIZE - metrics.height) / 2 + offset.y,
            metrics.width,
            metrics.height,
        );
    }, [image, offset, zoom]);

    const applyCrop = async () => {
        const metrics = getMetrics();
        if (!image || !metrics) return;

        setProcessing(true);
        const output = document.createElement('canvas');
        output.width = AVATAR_OUTPUT_SIZE;
        output.height = AVATAR_OUTPUT_SIZE;
        const context = output.getContext('2d');

        if (!context) {
            setProcessing(false);
            return;
        }

        const ratio = AVATAR_OUTPUT_SIZE / CROP_SIZE;
        context.fillStyle = '#fff';
        context.fillRect(0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
        context.drawImage(
            image,
            ((CROP_SIZE - metrics.width) / 2 + offset.x) * ratio,
            ((CROP_SIZE - metrics.height) / 2 + offset.y) * ratio,
            metrics.width * ratio,
            metrics.height * ratio,
        );

        output.toBlob(blob => {
            setProcessing(false);
            if (!blob) return;
            onApplyAction(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.82);
    };

    return (
        <div className={styles.cropOverlay} role="dialog" aria-modal="true" aria-label="Обрезать фото">
            <div className={styles.cropDialog}>
                <div className={styles.cropHeader}>
                    <span>Обрезать фото</span>
                    <button type="button" className={styles.cropCloseBtn} onClick={onCancelAction} aria-label="Закрыть">
                        <IonIcon src="/icons/close-outline.svg" />
                    </button>
                </div>
                <canvas
                    ref={canvasRef}
                    width={CROP_SIZE}
                    height={CROP_SIZE}
                    className={styles.cropCanvas}
                    onPointerDown={event => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        dragRef.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
                    }}
                    onPointerMove={event => {
                        if (!dragRef.current) return;
                        const displayScale = CROP_SIZE / event.currentTarget.getBoundingClientRect().width;
                        setOffset(clampOffset(
                            dragRef.current.offsetX + (event.clientX - dragRef.current.x) * displayScale,
                            dragRef.current.offsetY + (event.clientY - dragRef.current.y) * displayScale,
                        ));
                    }}
                    onPointerUp={() => { dragRef.current = null; }}
                    onPointerCancel={() => { dragRef.current = null; }}
                />
                <label className={styles.cropZoom}>
                    <IonIcon src="/icons/remove-outline.svg" />
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={zoom}
                        onChange={event => {
                            const nextZoom = Number(event.target.value);
                            setZoom(nextZoom);
                            setOffset(current => clampOffset(current.x, current.y, nextZoom));
                        }}
                    />
                    <IonIcon src="/icons/add-outline.svg" />
                </label>
                <div className={styles.cropActions}>
                    <button type="button" className={styles.cropCancelBtn} onClick={onCancelAction}>Отмена</button>
                    <button type="button" className={styles.cropApplyBtn} onClick={applyCrop} disabled={!image || processing}>
                        {processing ? <Spinner /> : <IonIcon src="/icons/crop-outline.svg" />}
                        Применить
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ProfileView({ onCloseAction }: ProfileViewProps) {
    const { user, logout, updateProfile } = useAuth();
    const [tab, setTab] = useState<'info' | 'password'>('info');

    const [username, setUsername]              = useState(user?.username ?? '');
    const [email, setEmail]                    = useState(user?.email ?? '');
    const [avatarFile, setAvatarFile]          = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreview] = useState<string | null>(null);
    const [cropSourceUrl, setCropSourceUrl]     = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw]         = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw]       = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const clearStatus = () => { setError(''); setSuccess(''); };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
        setCropSourceUrl(URL.createObjectURL(file));
        e.target.value = '';
    };
    useEffect(() => () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    }, [avatarPreviewUrl]);
    useEffect(() => () => {
        if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    }, [cropSourceUrl]);

    const handleInfoSave = async (e: React.FormEvent) => {
        e.preventDefault(); clearStatus(); setLoading(true);
        try {
            await updateProfile({
                username: username !== user?.username ? username : undefined,
                email:    email    !== user?.email    ? email    : undefined,
                avatar:   avatarFile ?? undefined,
            });
            setAvatarFile(null);
            setSuccess('Профиль обновлён!');
        } catch (err: any) { setError(err.message ?? 'Ошибка обновления'); }
        finally { setLoading(false); }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault(); clearStatus();
        if (!currentPw || !newPw) { setError('Заполните все поля'); return; }
        if (newPw !== confirmPw)   { setError('Пароли не совпадают'); return; }
        if (newPw.length < 6)      { setError('Минимум 6 символов'); return; }
        setLoading(true);
        try {
            await updateProfile({ password: newPw, currentPassword: currentPw });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            setSuccess('Пароль изменён!');
        } catch (err: any) { setError(err.message ?? 'Ошибка смены пароля'); }
        finally { setLoading(false); }
    };

    const currentAvatar = avatarPreviewUrl ?? user?.avatar;
    return (
        <div className={styles.body}>
            {cropSourceUrl && (
                <AvatarCropper
                    sourceUrl={cropSourceUrl}
                    onCancelAction={() => {
                        URL.revokeObjectURL(cropSourceUrl);
                        setCropSourceUrl(null);
                    }}
                    onApplyAction={file => {
                        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                        URL.revokeObjectURL(cropSourceUrl);
                        setCropSourceUrl(null);
                    }}
                />
            )}
            
            <div className={styles.avatarSection}>
                <div className={styles.avatarPreview}>
                    {currentAvatar
                        ? <img src={currentAvatar} alt={user?.username} />
                        : <span className={styles.avatarInitial}>{user?.username?.charAt(0).toUpperCase()}</span>
                    }
                </div>
                <div className={styles.avatarMeta}>
                    <span className={styles.avatarName}>{user?.username}</span>
                    <span className={styles.avatarEmail}>{user?.email}</span>
                    <button type="button" className={styles.avatarUploadBtn}
                            onClick={() => fileInputRef.current?.click()}>
                        <IonIcon src="/icons/camera-outline.svg" />Сменить фото
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*"
                           style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>
            </div>

            
            <div className={styles.profileTabs}>
                {(['info', 'password'] as const).map(t => (
                    <button key={t}
                            className={`${styles.profileTab} ${tab === t ? styles.profileTabActive : ''}`}
                            onClick={() => { setTab(t); clearStatus(); }}>
                        {{ info: 'Профиль', password: 'Пароль' }[t]}
                    </button>
                ))}
            </div>

            {error   && <ErrorBanner msg={error} />}
            {success && <SuccessBanner msg={success} />}

            
            {tab === 'info' && (
                <form onSubmit={handleInfoSave} className={styles.section}>
                    <div className={styles.field}>
                        <label className={styles.label}>Имя пользователя</label>
                        <input className={styles.input} type="text"
                               value={username} onChange={e => setUsername(e.target.value)}
                               autoComplete="username" />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input className={styles.input} type="email"
                               value={email} onChange={e => setEmail(e.target.value)}
                               autoComplete="email" />
                        <span className={styles.fieldHint}>После смены email потребуется повторный вход.</span>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <Spinner /> : <IonIcon src="/icons/save-outline.svg" />}
                        Сохранить изменения
                    </button>
                </form>
            )}

            
            {tab === 'password' && (
                <form onSubmit={handlePasswordSave} className={styles.section}>
                    <div className={styles.field}>
                        <label className={styles.label}>Текущий пароль</label>
                        <div className={styles.passwordWrapper}>
                            <input className={styles.input} type={showPw ? 'text' : 'password'}
                                   placeholder="••••••••" value={currentPw}
                                   onChange={e => setCurrentPw(e.target.value)}
                                   autoComplete="current-password" />
                            <button type="button" className={styles.passwordToggle} tabIndex={-1}
                                    onClick={() => setShowPw(p => !p)}>
                                <IonIcon src={showPw ? '/icons/eye-off-outline.svg' : '/icons/eye-outline.svg'} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Новый пароль</label>
                        <input className={styles.input} type={showPw ? 'text' : 'password'}
                               placeholder="Минимум 6 символов" value={newPw}
                               onChange={e => setNewPw(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Повтор пароля</label>
                        <input
                            className={`${styles.input} ${confirmPw && confirmPw !== newPw ? styles.inputError : ''}`}
                            type={showPw ? 'text' : 'password'} placeholder="••••••••"
                            value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                            autoComplete="new-password" />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <Spinner /> : <IonIcon src="/icons/lock-closed-outline.svg" />}
                        Изменить пароль
                    </button>
                </form>
            )}

            
            <div className={styles.logoutRow}>
                <button type="button" className={styles.logoutBtn}
                        onClick={() => { logout(); onCloseAction(); }}>
                    <IonIcon src="/icons/log-out-outline.svg" />
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
}
