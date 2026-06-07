import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { IonIcon } from '@/components/IonIcon';
import styles from './textEditor.module.css';

export type TextEditorProps = {
    initialValue?: string;
    placeholder?: string;
    allowHtml?: boolean;
    compact?: boolean;
    onCancelAction?: () => void;
    onSubmitAction: (content: string) => Promise<void>;
    submitLabel?: string;
};

function stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

export function TextEditor({
    initialValue = '',
    placeholder = 'Напишите текст…',
    allowHtml = false,
    compact = false,
    onCancelAction,
    onSubmitAction,
    submitLabel = 'Отправить',
}: TextEditorProps) {
    const [content, setContent] = useState(initialValue);
    const [tab, setTab] = useState<'write' | 'preview'>('write');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insert = (before: string, after = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.slice(start, end);
        const next = content.slice(0, start) + before + selected + after + content.slice(end);

        setContent(next);
        requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + before.length + selected.length + after.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    };

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed) return;

        setError('');
        setLoading(true);
        try {
            await onSubmitAction(allowHtml ? trimmed : stripHtml(trimmed));
            setContent('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ошибка отправки');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.editor} ${compact ? styles.compact : ''}`}>
            <div className={styles.toolbar}>
                <div className={styles.formatRow}>
                    <button type="button" className={styles.toolbarBtn} title="Жирный" aria-label="Жирный" onClick={() => insert('**', '**')}>
                        <IonIcon src="/icons/text-outline.svg" />
                    </button>
                    <button type="button" className={styles.toolbarBtn} title="Курсив" aria-label="Курсив" onClick={() => insert('*', '*')}>
                        <IonIcon src="/icons/create-outline.svg" />
                    </button>
                    <button type="button" className={styles.toolbarBtn} title="Зачёркнутый" aria-label="Зачёркнутый" onClick={() => insert('~~', '~~')}>
                        <IonIcon src="/icons/remove-outline.svg" />
                    </button>
                    <div className={styles.toolbarDivider} />
                    <button type="button" className={styles.toolbarBtn} title="Код" aria-label="Код" onClick={() => insert('`', '`')}>
                        <IonIcon src="/icons/code-slash-outline.svg" />
                    </button>
                    <button type="button" className={styles.toolbarBtn} title="Цитата" aria-label="Цитата" onClick={() => insert('\n> ')}>
                        <IonIcon src="/icons/chatbox-outline.svg" />
                    </button>
                    <button type="button" className={styles.toolbarBtn} title="Ссылка" aria-label="Ссылка" onClick={() => insert('[', '](url)')}>
                        <IonIcon src="/icons/link-outline.svg" />
                    </button>
                </div>
                <div className={styles.tabRow}>
                    <button type="button" className={`${styles.tabBtn} ${tab === 'write' ? styles.tabActive : ''}`} onClick={() => setTab('write')}>
                        <IonIcon src="/icons/create-outline.svg" />
                        Редактор
                    </button>
                    <button type="button" className={`${styles.tabBtn} ${tab === 'preview' ? styles.tabActive : ''}`} onClick={() => setTab('preview')}>
                        <IonIcon src="/icons/eye-outline.svg" />
                        Предпросмотр
                    </button>
                </div>
            </div>

            {tab === 'write' ? (
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    placeholder={placeholder}
                    value={content}
                    onChange={event => setContent(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Escape' && onCancelAction) onCancelAction();
                    }}
                    autoFocus={compact}
                />
            ) : (
                <div className={styles.preview}>
                    {content.trim() ? (
                        <ReactMarkdown rehypePlugins={allowHtml ? [rehypeRaw] : undefined}>
                            {allowHtml ? content : stripHtml(content)}
                        </ReactMarkdown>
                    ) : (
                        <span className={styles.previewEmpty}>Ничего нет…</span>
                    )}
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <IonIcon src="/icons/alert-circle-outline.svg" />
                    {error}
                </div>
            )}

            <div className={styles.footer}>
                <div className={styles.actions}>
                    {onCancelAction && (
                        <button type="button" className={styles.cancelBtn} onClick={onCancelAction}>
                            Отмена
                        </button>
                    )}
                    <button type="button" className={styles.submitBtn} onClick={() => void handleSubmit()} disabled={loading || !content.trim()}>
                        {loading ? <span className={styles.spinner} /> : <IonIcon src="/icons/send-outline.svg" />}
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
