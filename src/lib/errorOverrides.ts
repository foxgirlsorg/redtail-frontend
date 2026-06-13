export const ERROR_MESSAGE_OVERRIDES: Record<string, string> = {
    'Invalid identifier or password': 'Неверный логин или пароль',
};

export function overrideErrorMessage(message: string): string {
    const normalized = message.trim();
    return ERROR_MESSAGE_OVERRIDES[normalized] ?? message;
}

export function getErrorMessage(error: unknown, fallback: string): string {
    const message = error instanceof Error
        ? error.message
        : typeof error === 'string'
            ? error
            : fallback;

    return overrideErrorMessage(message || fallback);
}
