'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { overrideErrorMessage } from '@/lib/errorOverrides';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_DOMAIN!;

export type User = {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    verified?: boolean;
};

export type AuthModalView = 'login' | 'register' | 'forgotPassword' | 'profile';

type UpdateProfileData = {
    username?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    avatar?: File;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (code: string, password: string, passwordConfirmation: string) => Promise<void>;
    refreshUser: () => Promise<void>;
    openModal: (view?: AuthModalView) => void;
    closeModal: () => void;
    modalView: AuthModalView | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'redtail_auth_token';

function parseUser(data: any): User {
    return {
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatar?.formats?.thumbnail?.url
            ? `${STRAPI_URL}${data.avatar.formats.thumbnail.url}`
            : data.avatar?.url
                ? `${STRAPI_URL}${data.avatar.url}`
                : typeof data.avatar === 'string'
                    ? data.avatar
                    : undefined,
        verified: data.verified === true,
    };
}

async function fetchMe(jwt: string): Promise<User | null> {
    try {
        const res = await fetch(
            `${STRAPI_URL}/api/users/me?populate=avatar`,
            {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
                cache: 'no-store',
            },
        );

        if (!res.ok) return null;

        const data = await res.json();
        return parseUser(data);
    } catch {
        return null;
    }
}

async function readJsonSafe(res: Response) {
    return res.json().catch(() => ({}));
}

function getApiErrorMessage(error: any, fallback: string): string {
    return overrideErrorMessage(error?.error?.message ?? fallback);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalView, setModalView] = useState<AuthModalView | null>(null);

    const refreshUser = useCallback(async () => {
        const jwt = localStorage.getItem(TOKEN_KEY);

        if (!jwt) {
            setUser(null);
            setToken(null);
            return;
        }

        const me = await fetchMe(jwt);

        if (!me) {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
            setToken(null);
            return;
        }

        setUser(me);
        setToken(jwt);
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, [refreshUser]);

    const login = async (identifier: string, password: string) => {
        const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password }),
        });

        if (!res.ok) {
            const err = await readJsonSafe(res);
            throw new Error(getApiErrorMessage(err, 'Ошибка входа'));
        }

        const data = await res.json();
        const jwt = data.jwt;

        localStorage.setItem(TOKEN_KEY, jwt);
        setToken(jwt);

        const me = await fetchMe(jwt);
        setUser(me ?? parseUser(data.user));
        setModalView(null);
    };

    const register = async (username: string, email: string, password: string) => {
        const normalizedUsername = username.trim();

        if (!normalizedUsername) {
            throw new Error('Имя пользователя обязательно');
        }

        const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: normalizedUsername, email: email.trim(), password }),
        });

        if (!res.ok) {
            const err = await readJsonSafe(res);
            throw new Error(getApiErrorMessage(err, 'Ошибка регистрации'));
        }

        const data = await res.json();
        const jwt = data.jwt;

        localStorage.setItem(TOKEN_KEY, jwt);
        setToken(jwt);

        const me = await fetchMe(jwt);
        setUser(me ?? parseUser(data.user));
        setModalView(null);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
        setModalView(null);
    };

    const updateProfile = async (data: UpdateProfileData) => {
        if (!token || !user) throw new Error('Вы не авторизованы');
        if (data.password) {
            if (!data.currentPassword) {
                throw new Error('Введите текущий пароль');
            }

            const verifyRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: user.email,
                    password: data.currentPassword,
                }),
            });

            if (!verifyRes.ok) {
                throw new Error('Неверный текущий пароль');
            }
            const pwRes = await fetch(`${STRAPI_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password: data.password }),
            });

            if (!pwRes.ok) {
                const err = await readJsonSafe(pwRes);
                throw new Error(getApiErrorMessage(err, 'Не удалось изменить пароль'));
            }
        }
        let avatarId: number | undefined;

        if (data.avatar) {
            const form = new FormData();
            form.append('files', data.avatar);

            const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });

            if (!uploadRes.ok) {
                const err = await readJsonSafe(uploadRes);
                throw new Error(getApiErrorMessage(err, 'Не удалось загрузить аватар'));
            }

            const uploaded = await uploadRes.json();
            avatarId = uploaded?.[0]?.id;
        }
        const payload: Record<string, unknown> = {};

        if (data.username) payload.username = data.username;
        if (data.email)    payload.email    = data.email;
        if (avatarId)      payload.avatar   = avatarId;

        if (Object.keys(payload).length > 0) {
            const res = await fetch(`${STRAPI_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await readJsonSafe(res);
                throw new Error(getApiErrorMessage(err, 'Не удалось обновить профиль'));
            }
        }

        await refreshUser();
    };

    const requestPasswordReset = async (email: string) => {
        const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) {
            const err = await readJsonSafe(res);
            throw new Error(getApiErrorMessage(err, 'Ошибка запроса сброса пароля'));
        }
    };

    const resetPassword = async (
        code: string,
        password: string,
        passwordConfirmation: string,
    ) => {
        const res = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                password,
                passwordConfirmation,
            }),
        });

        if (!res.ok) {
            const err = await readJsonSafe(res);
            throw new Error(getApiErrorMessage(err, 'Ошибка сброса пароля'));
        }
    };

    const openModal = useCallback((view: AuthModalView = 'login') => {
        setModalView(view);
    }, []);

    const closeModal = useCallback(() => {
        setModalView(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                register,
                logout,
                updateProfile,
                requestPasswordReset,
                resetPassword,
                refreshUser,
                openModal,
                closeModal,
                modalView,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return ctx;
}
