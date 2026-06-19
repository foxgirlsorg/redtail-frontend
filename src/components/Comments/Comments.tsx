'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useAuth } from '@/lib/authContext';
import { getErrorMessage } from '@/lib/errorOverrides';
import { IonIcon } from '@/components/IonIcon';
import { TextEditor } from '@/components/TextEditor';
import { remarkSpoiler, spoilerHastHandler } from '@/lib/remarkSpoiler';
import { Spoiler } from '@/components/MarkdownComponents/SpoilerText/Spoiler';
import {
    fetchComments,
    postComment,
    updateComment,
    deleteComment,
    type Comment,
} from '@/lib/commentsApi';
import styles from './Comments.module.css';
import '@/styles/markdown.css';

const MAX_COMMENT_LENGTH = 4500;
// Raw character threshold before collapsing
const COLLAPSE_THRESHOLD = 600;
// Height (px) the comment is clamped to while collapsed
const COLLAPSED_HEIGHT = 144;

const remarkSpoilerPlugins = [remarkSpoiler];
const remarkRehypeOptions = { handlers: { spoiler: spoilerHastHandler } };
const markdownComponents = {
    'spoiler-text': Spoiler,
} as unknown as Components;

type CommentsProps = {
    contentType: string;
    contentId: string | number;
    embedded?: boolean;
};

function formatCommentDate(iso: string): string {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;

    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function countComments(items: Comment[] = []): number {
    return items.reduce((sum, item) => sum + 1 + countComments(item.children ?? []), 0);
}

function CommentAvatar({ avatar, name, size = 34 }: { avatar?: string; name?: string; size?: number }) {
    return (
        <div className={styles.commentAvatar} style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {avatar ? <img src={avatar} alt={name} /> : (name?.charAt(0) ?? '?').toUpperCase()}
        </div>
    );
}

function CommentMarkdown({ content, allowHtml }: { content: string; allowHtml: boolean }) {

    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={remarkSpoilerPlugins}
                rehypePlugins={allowHtml ? [rehypeRaw] : undefined}
                // @ts-ignore
                remarkRehypeOptions={remarkRehypeOptions}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function VerifiedBadge() {
    return (
        <span className={styles.verifiedBadge} title="Член команды" aria-label="Член команды">
            <IonIcon src="/icons/checkmark-sharp.svg" />
        </span>
    );
}

function CollapsibleCommentContent({
                                       content,
                                       allowHtml,
                                       isRemoved,
                                   }: {
    content: string;
    allowHtml: boolean;
    isRemoved: boolean;
}) {
    const isLong = content.length > COLLAPSE_THRESHOLD;
    const [expanded, setExpanded] = useState(!isLong);
    const [maxHeight, setMaxHeight] = useState<number | 'none'>(
        isLong ? COLLAPSED_HEIGHT : 'none',
    );
    const innerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setExpanded(!isLong);
        setMaxHeight(isLong ? COLLAPSED_HEIGHT : 'none');
    }, [content, isLong]);

    const toggle = () => {
        const el = innerRef.current;
        if (!el) return;
        const fullHeight = el.scrollHeight;

        if (expanded) {
            setMaxHeight(fullHeight);
            setExpanded(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setMaxHeight(COLLAPSED_HEIGHT));
            });
        } else {
           setExpanded(true);
            setMaxHeight(fullHeight);
        }
    };

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
        if (e.propertyName !== 'max-height') return;
        if (expanded) setMaxHeight('none');
    };

    if (isRemoved) {
        return (
            <div className={styles.commentContent}>
                <span className={styles.removedText}>Комментарий удалён.</span>
            </div>
        );
    }

    return (
        <div className={styles.commentContent}>
            <div
                ref={innerRef}
                className={[
                    styles.commentContentInner,
                    isLong ? styles.commentContentAnimated : '',
                    isLong && !expanded ? styles.commentContentCollapsed : '',
                ].filter(Boolean).join(' ')}
                style={isLong ? { maxHeight: maxHeight === 'none' ? undefined : `${maxHeight}px` } : undefined}
                onTransitionEnd={handleTransitionEnd}
            >
                <CommentMarkdown content={content} allowHtml={allowHtml} />
            </div>
            {isLong && (
                <button
                    type="button"
                    className={styles.expandBtn}
                    onClick={toggle}
                >
                    <IonIcon
                        src={expanded ? '/icons/chevron-up-outline.svg' : '/icons/chevron-down-outline.svg'}
                        className={styles.expandBtnIcon}
                    />
                    {expanded ? 'Свернуть' : 'Показать полностью'}
                </button>
            )}
        </div>
    );
}

type CommentItemProps = {
    comment: Comment;
    contentType: string;
    contentId: string | number;
    depth?: number;
    onMutate: () => void;
};

function CommentItem({
                         comment,
                         contentType,
                         contentId,
                         depth = 0,
                         onMutate,
                     }: CommentItemProps) {
    const { user, token, openModal } = useAuth();

    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [deleting, setDeleting] = useState(false);

    const isOwn = user !== null && user !== undefined && user.id === comment.author?.id;
    const isRemoved = comment.removed === true;
    const authorCanRenderHtml = comment.author?.verified === true;
    const currentUserCanUseHtml = user?.verified === true;

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_DOMAIN ?? '';
    const avatarUrl = comment.author?.avatar
        ? (comment.author.avatar.startsWith('http')
            ? comment.author.avatar
            : `${strapiUrl}${comment.author.avatar}`)
        : undefined;

    const handleDelete = async () => {
        if (!token || !comment.author?.id) return;

        try {
            await deleteComment(contentType, contentId, comment.id, comment.author.id, token);
            onMutate();
        } catch {}

        setDeleting(false);
    };

    const handleEditSave = async (content: string) => {
        if (!token) return;
        await updateComment(contentType, contentId, comment.id, content, token);
        setEditing(false);
        onMutate();
    };

    const handleReply = async (content: string) => {
        if (!token) {
            openModal('login');
            return;
        }

        await postComment(contentType, contentId, content, comment.id, token);
        setReplying(false);
        onMutate();
    };

    return (
        <div
            className={[
                styles.comment,
                depth > 0 ? styles.commentThread : '',
                isRemoved ? styles.commentRemoved : '',
            ].filter(Boolean).join(' ')}
        >
            <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                    <CommentAvatar avatar={avatarUrl} name={comment.author?.name} size={34} />
                    <div className={styles.commentMetaText}>
                        <span className={styles.commentAuthor}>
                            {comment.author?.name ?? 'Аноним'}
                            {authorCanRenderHtml && <VerifiedBadge />}
                            {comment.isAdminComment && <VerifiedBadge />}
                        </span>

                        <span className={styles.commentDate}>{formatCommentDate(comment.createdAt)}</span>

                        {comment.updatedAt !== comment.createdAt && (
                            <span className={styles.editedBadge}>(ред.)</span>
                        )}
                    </div>
                </div>

                {editing ? (
                    <TextEditor
                        compact
                        initialValue={editContent}
                        allowHtml={currentUserCanUseHtml}
                        maxLength={MAX_COMMENT_LENGTH}
                        onCancelAction={() => setEditing(false)}
                        onSubmitAction={handleEditSave}
                        submitLabel="Сохранить"
                    />
                ) : (
                    <CollapsibleCommentContent
                        content={comment.content}
                        allowHtml={authorCanRenderHtml}
                        isRemoved={isRemoved}
                    />
                )}

                {!isRemoved && !editing && (
                    <div className={styles.commentActions}>
                        {depth < 3 && (
                            <button
                                className={`${styles.actionBtn} ${styles.replyBtn}`}
                                onClick={() => token ? setReplying(r => !r) : openModal('login')}
                            >
                                Ответить
                            </button>
                        )}

                        {isOwn && (
                            <div className={styles.ownerActions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        setEditing(true);
                                        setEditContent(comment.content);
                                    }}
                                >
                                    <IonIcon src="/icons/pencil-outline.svg" />
                                </button>

                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setDeleting(true)}
                                >
                                    <IonIcon src="/icons/trash-outline.svg" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {deleting && (
                    <div className={styles.deleteConfirm}>
                        Удалить комментарий?
                        <div className={styles.deleteConfirmActions}>
                            <button className={styles.confirmYesBtn} onClick={handleDelete}>
                                Да
                            </button>
                            <button className={styles.confirmNoBtn} onClick={() => setDeleting(false)}>
                                Нет
                            </button>
                        </div>
                    </div>
                )}

                {replying && user && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <TextEditor
                            compact
                            placeholder={`Ответ для ${comment.author?.name ?? 'пользователя'}…`}
                            allowHtml={user.verified === true}
                            maxLength={MAX_COMMENT_LENGTH}
                            onCancelAction={() => setReplying(false)}
                            onSubmitAction={handleReply}
                            submitLabel="Ответить"
                        />
                    </div>
                )}

                {(comment.children?.length ?? 0) > 0 && (
                    <div className={styles.replies}>
                        {comment.children!.map(child => (
                            <CommentItem
                                key={child.id}
                                comment={child}
                                contentType={contentType}
                                contentId={contentId}
                                depth={depth + 1}
                                onMutate={onMutate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function Comments({ contentType, contentId, embedded = false }: CommentsProps) {
    const { user, token, isLoading: authLoading, openModal } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        setError('');
        try {
            const data = await fetchComments(contentType, contentId, token);
            setComments(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Ошибка загрузки'));
        } finally {
            setLoading(false);
        }
    }, [contentType, contentId, token]);
    useEffect(() => {
        if (!authLoading) {
            setLoading(true);
            load();
        }
    }, [authLoading, load, user?.avatar]);

    const nested = useMemo(() => comments, [comments]);
    const commentsCount = useMemo(() => countComments(nested), [nested]);

    const handleNewComment = async (content: string) => {
        if (!token) {
            openModal('login');
            return;
        }

        await postComment(contentType, contentId, content, null, token);
        await load();
    };

    return (
        <section className={`${styles.section} ${embedded ? styles.sectionEmbedded : ''}`}>
            <div className={`${styles.sectionHeader} ${embedded ? styles.sectionHeaderEmbedded : ''}`}>
                {!embedded && (
                    <h3 className={styles.sectionTitle}>
                        комментарии <span>({commentsCount})</span>
                    </h3>
                )}

                {!authLoading && (
                    user && (
                        <button
                            className={styles.userBar}
                            onClick={() => openModal('profile')}
                            title="Мой профиль"
                        >
                            <div className={styles.userBarAvatar}>
                                {user.avatar
                                    ? <img src={user.avatar} alt={user.username} />
                                    : user.username.charAt(0).toUpperCase()
                                }
                            </div>
                            <span className={styles.userBarName}>
                                {user.username}
                                {user.verified === true && <VerifiedBadge />}
                            </span>
                        </button>
                    )
                )}
            </div>

            {user ? (
                <TextEditor
                    placeholder="Оставьте комментарий…"
                    allowHtml={user.verified === true}
                    maxLength={MAX_COMMENT_LENGTH}
                    onSubmitAction={handleNewComment}
                />
            ) : (
                !authLoading && (
                    <div className={styles.authPrompt}>
                        <span className={styles.authPromptText}>
                            Войдите, чтобы оставлять комментарии.
                        </span>
                        <div className={styles.authPromptBtns}>
                            <button className={styles.authBtn} onClick={() => openModal('register')}>
                                Регистрация
                            </button>
                            <button className={`${styles.authBtn} ${styles.authBtnPrimary}`} onClick={() => openModal('login')}>
                                Войти
                            </button>
                        </div>
                    </div>
                )
            )}

            {error && (
                <div className={styles.errorBanner}>
                    <IonIcon src="/icons/alert-circle-outline.svg" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className={styles.loadingRow}>
                    <span className={styles.spinner} />
                    Загружаем комментарии…
                </div>
            ) : nested.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>
                        <IonIcon src="/icons/chatbubbles-outline.svg" />
                    </span>
                    <span>Пока нет комментариев. Будьте первым!</span>
                </div>
            ) : (
                <div className={styles.commentList}>
                    {nested.map(c => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            contentType={contentType}
                            contentId={contentId}
                            onMutate={load}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
