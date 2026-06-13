export const ERROR_MESSAGE_OVERRIDES: Record<string, string> = {
    'Invalid identifier or password': 'Неверный логин или пароль.',
    'Email or Username are already taken': 'Пользователь с такой почтой или никнеймом уже существует.',
    'Your comment contains a word that is not allowed.':'Ваш комментарий содержит запрещённые слова.'
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
