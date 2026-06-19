import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getErrorMessage } from '@/lib/errorOverrides';
import { IonIcon } from '@/components/IonIcon';
import { remarkSpoiler, spoilerHastHandler } from '@/lib/remarkSpoiler';
import { Spoiler } from '@/components/MarkdownComponents/SpoilerText/Spoiler';
import styles from './textEditor.module.css';
import type { Components } from 'react-markdown';

const remarkSpoilerPlugins = [remarkSpoiler];
const remarkRehypeOptions = { handlers: { spoiler: spoilerHastHandler } };
const markdownComponents = {
    'spoiler-text': Spoiler,
} as unknown as Components;

export type TextEditorProps = {
    initialValue?: string;
    placeholder?: string;
    allowHtml?: boolean;
    compact?: boolean;
    maxLength?: number;
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
                               maxLength,
                               onCancelAction,
                               onSubmitAction,
                               submitLabel = 'Отправить',
                           }: TextEditorProps) {
    const [content, setContent] = useState(initialValue);
    const [tab, setTab] = useState<'write' | 'preview'>('write');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const didPlaceInitialCursor = useRef(false);

    useEffect(() => {
        if (didPlaceInitialCursor.current || !initialValue) return;

        const textarea = textareaRef.current;
        if (!textarea) return;

        didPlaceInitialCursor.current = true;

        requestAnimationFrame(() => {
            const cursor = textarea.value.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    }, [initialValue]);

    const insert = (before: string, after = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.slice(start, end);
        const next = content.slice(0, start) + before + selected + after + content.slice(end);

        // Respect maxLength when inserting
        if (maxLength && next.length > maxLength) return;

        setContent(next);
        requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + before.length + selected.length + after.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    };

    const insertSpoiler = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.slice(start, end);
        const before = '[spoiler]';
        const after = '[/spoiler]';
        const next = content.slice(0, start) + before + selected + after + content.slice(end);

        if (maxLength && next.length > maxLength) return;

        setContent(next);
        requestAnimationFrame(() => {
            textarea.focus();
            if (selected) {
                const cursor = start + before.length + selected.length + after.length;
                textarea.setSelectionRange(cursor, cursor);
            } else {
                 const cursor = start + before.length;
                textarea.setSelectionRange(cursor, cursor);
            }
        });
    };

    const handleChange = (value: string) => {
        if (maxLength && value.length > maxLength) return;
        setContent(value);
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
            setError(getErrorMessage(err, 'Ошибка отправки'));
        } finally {
            setLoading(false);
        }
    };

    const remaining = maxLength ? maxLength - content.length : null;
    const isNearLimit = remaining !== null && remaining <= 200;
    const isOverLimit = remaining !== null && remaining < 0;

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
                    <button type="button" className={styles.toolbarBtn} title="Спойлер" aria-label="Спойлер" onClick={insertSpoiler}>
                        <IonIcon src="/icons/eye-off-outline.svg" />
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
                    onChange={event => handleChange(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Escape' && onCancelAction) onCancelAction();
                    }}
                    autoFocus={compact}
                />
            ) : (
                <div className={styles.preview}>
                    {content.trim() ? (
                        <ReactMarkdown
                            remarkPlugins={remarkSpoilerPlugins}
                            rehypePlugins={allowHtml ? [rehypeRaw] : undefined}
                            // @ts-ignore
                            remarkRehypeOptions={remarkRehypeOptions}
                            components={markdownComponents}
                        >
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
                {isNearLimit && remaining !== null && (
                    <span
                        className={[
                            styles.charCounter,
                            isOverLimit ? styles.charCounterOver : '',
                        ].filter(Boolean).join(' ')}
                    >
                        {remaining}
                    </span>
                )}
                <div className={styles.actions}>
                    {onCancelAction && (
                        <button type="button" className={styles.cancelBtn} onClick={onCancelAction}>
                            Отмена
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={() => void handleSubmit()}
                        disabled={loading || !content.trim() || isOverLimit === true}
                    >
                        {loading ? <span className={styles.spinner} /> : <IonIcon src="/icons/send-outline.svg" />}
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}