'use client';

import { useState, useRef, useEffect, useCallback, type RefObject, type DependencyList, type ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { IonIcon } from '@/components/IonIcon';
import { AvatarCropper } from '@/components/Auth';
import { TextEditor } from '@/components/TextEditor/textEditor';
import '@/styles/markdown.css';
import styles from './page.module.css';

type TeamMember = {
    id: number;
    nickname: string;
    role?: string;
    hidden?: boolean;
    image?: { url: string };
};

type TeamCardClientProps = {
    team: TeamMember[];
    strDomain?: string;
};

type CustomMember = {
    id: number;
    nickname: string;
    role: string;
    avatarUrl: string | null;
};

type TextBlock = {
    id: number;
    title: string;
    subtitle: string;
    content: string;
    position: 'before' | 'after';
};

type NewMemberForm = {
    nickname: string;
    role: string;
    avatarUrl: string;
    avatarMode: 'url' | 'upload';
    avatarFile: string | null;
};

type NewBlockForm = {
    title: string;
    subtitle: string;
    content: string;
    position: 'before' | 'after';
};

const CARD_W = 680;

const emptyNewMember: NewMemberForm = {
    nickname: '',
    role: '',
    avatarUrl: '',
    avatarMode: 'url',
    avatarFile: null,
};

const emptyNewBlock: NewBlockForm = {
    title: '',
    subtitle: '',
    content: '',
    position: 'before',
};

const isCustomMember = (id: number) => id < 0;

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function useScrollShadow(ref: RefObject<HTMLDivElement | null>, deps: DependencyList = []) {
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);

    const check = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        setAtTop(el.scrollTop <= 0);
        setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    }, [ref]);

    useEffect(() => {
        check();
        const el = ref.current;
        if (!el) return;
        el.addEventListener('scroll', check, { passive: true });
        return () => el.removeEventListener('scroll', check);
    }, [check, ...deps]);

    return { atTop, atBottom };
}

function TextBlockGroup({
                            blocks,
                            groupClass,
                            hiddenClass,
                            hidden,
                        }: {
    blocks: TextBlock[];
    groupClass: string;
    hiddenClass: string;
    hidden: boolean;
}) {
    if (blocks.length === 0) return null;

    return (
        <div className={cx(groupClass, hidden && hiddenClass)}>
            {blocks.map(block => (
                <div key={block.id} className={styles.textBlockWrap}>
                    {block.title && <div className={styles.textBlockTitle}>{block.title}</div>}
                    {block.subtitle && <div className={styles.brandSub}>{block.subtitle}</div>}
                    {(block.title || block.subtitle) && <div className={cx(styles.divider, styles.tb)} />}
                    {block.content && (
                        <div className={styles.textBlock}>
                            <div className={cx(styles.textBlockContent, 'markdown-body')}>
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{block.content}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function TeamCardClient({ team, strDomain }: TeamCardClientProps) {
    const [visible, setVisible] = useState<Record<number, boolean>>(
        Object.fromEntries(team.map(m => [m.id, !m.hidden]))
    );
    const [overrides, setOverrides] = useState<Record<number, string>>({});
    const [fullscreen, setFullscreen] = useState(false);
    const [scale, setScale] = useState(1);
    const [fsScale, setFsScale] = useState(1);
    const [cardHeight, setCardHeight] = useState<number>(0);

    const [renderWidth, setRenderWidth] = useState(1200);
    const [renderFormat, setRenderFormat] = useState<'png' | 'jpg'>('png');
    const [rendering, setRendering] = useState(false);
    const [renderStatus, setRenderStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
    const [renderMsg, setRenderMsg] = useState('');
    const renderStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [customMembers, setCustomMembers] = useState<CustomMember[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMember, setNewMember] = useState<NewMemberForm>(emptyNewMember);
    const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const [teamcardEnabled, setTeamcardEnabled] = useState(true);
    const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
    const [newBlock, setNewBlock] = useState<NewBlockForm>(emptyNewBlock);
    const [configName, setConfigName] = useState('teamcard_config');

    const nextCustomId = useRef(-1);
    const nextBlockId = useRef(1);

    const cardRef = useRef<HTMLElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const toggleListRef = useRef<HTMLDivElement>(null);
    const blockListRef = useRef<HTMLDivElement>(null);

    const { atTop: scrolledTop, atBottom: scrolledBottom } = useScrollShadow(toggleListRef, [
        team.length,
        customMembers.length,
    ]);
    const { atTop: scrolledBlockTop, atBottom: scrolledBlockBottom } = useScrollShadow(blockListRef, [
        textBlocks.length,
    ]);

    const toggle = (id: number) =>
        setVisible(prev => ({ ...prev, [id]: !prev[id] }));

    const setOverride = (id: number, value: string) =>
        setOverrides(prev => ({ ...prev, [id]: value }));

    const addCustomMember = () => {
        if (!newMember.nickname.trim()) return;
        const id = nextCustomId.current--;
        setCustomMembers(prev => [
            ...prev,
            {
                id,
                nickname: newMember.nickname.trim(),
                role: newMember.role.trim(),
                avatarUrl: newMember.avatarMode === 'url' ? (newMember.avatarUrl.trim() || null) : newMember.avatarFile,
            },
        ]);
        setVisible(prev => ({ ...prev, [id]: true }));
        resetAddForm();
    };

    const removeCustomMember = (id: number) => {
        setCustomMembers(prev => prev.filter(m => m.id !== id));
        setVisible(prev => { const n = { ...prev }; delete n[id]; return n; });
        setOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const resetAddForm = () => {
        setNewMember(emptyNewMember);
        setCropSourceUrl(null);
        setShowAddForm(false);
    };

    const addTextBlock = () => {
        setTextBlocks(prev => [...prev, {
            id: nextBlockId.current++,
            title: newBlock.title.trim(),
            subtitle: newBlock.subtitle.trim(),
            content: newBlock.content.trim(),
            position: newBlock.position,
        }]);
        resetBlockForm();
    };

    const removeTextBlock = (id: number) => {
        setTextBlocks(prev => {
            const next = prev.filter(b => b.id !== id);
            if (next.length === 0) setTeamcardEnabled(true);
            return next;
        });
    };

    const updateTextBlock = (id: number, field: keyof TextBlock, value: any) => {
        setTextBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const resetBlockForm = () => setNewBlock(emptyNewBlock);

    const handleExportConfig = () => {
        // noinspection PointlessBooleanExpressionJS
        const config = {
            teamcardEnabled,
            team: team.map(m => ({
                id: m.id,
                visible: !!visible[m.id],
                override: overrides[m.id] ?? '',
            })),
            customMembers: customMembers.map(m => ({
                nickname: m.nickname,
                role: m.role,
                avatarUrl: m.avatarUrl || null,
            })),
            textBlocks: textBlocks.map(b => ({
                title: b.title,
                subtitle: b.subtitle,
                content: b.content,
                position: b.position,
            })),
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${configName || 'teamcard_config'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportConfig = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const config = JSON.parse(reader.result as string);

                if (typeof config.teamcardEnabled === 'boolean') {
                    setTeamcardEnabled(config.teamcardEnabled);
                }

                if (Array.isArray(config.team)) {
                    const v: Record<number, boolean> = {};
                    const o: Record<number, string> = {};
                    for (const m of config.team) {
                        if (typeof m.id === 'number') {
                            v[m.id] = m.visible !== false;
                            if (m.override) o[m.id] = String(m.override);
                        }
                    }
                    setVisible(prev => ({ ...prev, ...v }));
                    setOverrides(prev => ({ ...prev, ...o }));
                }

                if (Array.isArray(config.customMembers)) {
                    const newCustoms: CustomMember[] = config.customMembers.map((m: any) => ({
                        id: nextCustomId.current--,
                        nickname: String(m.nickname || ''),
                        role: String(m.role || ''),
                        avatarUrl: m.avatarUrl && typeof m.avatarUrl === 'string' ? m.avatarUrl : null,
                    }));
                    setCustomMembers(newCustoms);
                    const cv: Record<number, boolean> = {};
                    for (const c of newCustoms) cv[c.id] = true;
                    setVisible(prev => ({ ...prev, ...cv }));
                }

                if (Array.isArray(config.textBlocks)) {
                    setTextBlocks(config.textBlocks.map((b: any) => ({
                        id: nextBlockId.current++,
                        title: String(b.title || ''),
                        subtitle: String(b.subtitle || ''),
                        content: String(b.content || ''),
                        position: b.position === 'after' ? 'after' as const : 'before' as const,
                    })));
                }
            } catch {
                console.error('Invalid config file');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
        setCropSourceUrl(URL.createObjectURL(file));
        e.target.value = '';
    };

    const fileToDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    useEffect(() => () => { if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl); }, [cropSourceUrl]);

    const visibleTeamMembers = team.filter(m => visible[m.id]);
    const visibleCustomMembers = customMembers.filter(m => visible[m.id]);
    const visibleMembers = [...visibleTeamMembers, ...visibleCustomMembers];

    const beforeBlocks = textBlocks.filter(b => b.position === 'before');
    const afterBlocks = textBlocks.filter(b => b.position === 'after');

    const computeScale = useCallback(() => {
        if (!wrapperRef.current) return;
        const available = wrapperRef.current.offsetWidth;
        const s = Math.min(1, available / CARD_W);
        setScale(s);
        if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
    }, []);

    const computeFsScale = useCallback(() => {
        if (!cardRef.current) return;
        const cardH = cardRef.current.offsetHeight;
        const scaleX = (window.innerWidth * 0.95) / CARD_W;
        const scaleY = (window.innerHeight * 0.95) / cardH;
        setFsScale(Math.min(scaleX, scaleY));
    }, []);

    useEffect(() => {
        computeScale();
        const ro = new ResizeObserver(computeScale);
        if (wrapperRef.current) ro.observe(wrapperRef.current);
        return () => ro.disconnect();
    }, [computeScale]);

    useEffect(() => {
        if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
    }, [visibleMembers.length, overrides, textBlocks]);

    useEffect(() => {
        if (!fullscreen) return;
        computeFsScale();
        window.addEventListener('resize', computeFsScale);
        return () => window.removeEventListener('resize', computeFsScale);
    }, [fullscreen, visibleMembers.length, textBlocks, computeFsScale]);

    useEffect(() => {
        document.body.style.overflow = fullscreen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [fullscreen]);

    useEffect(() => () => {
        if (renderStatusTimeout.current) clearTimeout(renderStatusTimeout.current);
    }, []);

    const flashRenderStatus = (status: 'ok' | 'err', msg: string, delay: number) => {
        if (renderStatusTimeout.current) clearTimeout(renderStatusTimeout.current);
        setRenderStatus(status);
        setRenderMsg(msg);
        renderStatusTimeout.current = setTimeout(() => {
            setRenderStatus('idle');
            setRenderMsg('');
        }, delay);
    };

    const handleRender = useCallback(async () => {
        if (!cardRef.current || rendering) return;

        setRendering(true);
        setRenderStatus('loading');
        setRenderMsg('Загрузка...');

        try {
            const { domToPng, domToJpeg } = await import('modern-screenshot');

            setRenderMsg('Рендеринг...');

            const cardEl = cardRef.current;
            const prevTransform = cardEl.style.transform;
            const prevOrigin = cardEl.style.transformOrigin;
            cardEl.style.transform = 'none';
            cardEl.style.transformOrigin = 'unset';

            const scale = renderWidth / cardEl.scrollWidth;

            const dataUrl = await (renderFormat === 'jpg' ? domToJpeg : domToPng)(cardEl, {
                scale,
                backgroundColor: renderFormat === 'jpg' ? '#161616' : null,
                quality: 0.98,
                style: {
                    border: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                },
                fetch: { requestInit: { mode: 'cors' } },
                onCloneNode: (node: Node) => {
                    const el = node as Element;
                    const divider = el.querySelector(`.${styles.divider}`) as HTMLElement | undefined;
                    if (divider) {
                        divider.style.height = '2px';
                        divider.style.minHeight = '2px';
                        divider.style.background = '';
                        divider.style.backgroundImage =
                            'linear-gradient(to right, #de6161 0%, rgba(222, 97, 97, 0.35) 45%, rgba(222, 97, 97, 0) 100%)';
                    }
                },
            });

            cardEl.style.transform = prevTransform;
            cardEl.style.transformOrigin = prevOrigin;

            setRenderMsg('Сохранение...');

            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `redtail-team.${renderFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            flashRenderStatus('ok', 'Сохранено!', 2500);
        } catch (e) {
            console.error(e);
            flashRenderStatus('err', 'Ошибка', 3000);
        } finally {
            setRendering(false);
        }
    }, [rendering, renderWidth, renderFormat]);

    const scaledHeight = cardHeight > 0 ? cardHeight * scale : 'auto';

    return (
        <div className={cx(styles.wrapper, fullscreen && styles.wrapperFullscreen)}>
            <div className={styles.backdrop}>
                <div className={styles.backdropImage} />
                <div className={styles.backdropVignette} />
                <div className={styles.backdropNoise} />
            </div>
            {!fullscreen && (
                <div className={styles.panelsCombined}>
                    <div className={styles.controls}>
                        <div className={styles.controlsHeader}>
                            <span className={styles.controlsLabel}>Участники</span>
                            <div className={styles.controlsActions}>
                                <button
                                    role="switch"
                                    aria-checked={teamcardEnabled}
                                    className={cx(styles.switch, teamcardEnabled && styles.switchOn)}
                                    onClick={() => setTeamcardEnabled(prev => !prev)}
                                    disabled={textBlocks.length === 0}
                                    title={textBlocks.length === 0 ? 'Добавьте блок для управления' : 'Показать/скрыть карточку команды'}
                                >
                                    <span className={styles.switchThumb} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.toggleListWrap}>
                            <div className={styles.scrollFadeTop} style={{ opacity: scrolledTop ? 0 : 1 }} />
                            <div className={styles.toggleList} ref={toggleListRef}>
                                {team.map(member => (
                                    <div key={member.id} className={styles.memberControl}>
                                        <label className={styles.toggleRow}>
                                            <span className={cx(styles.toggleName, member.hidden && styles.toggleNameMuted)}>
                                                {member.nickname}
                                                {member.hidden && <span className={styles.badge}>скрыт</span>}
                                            </span>
                                            <button
                                                role="switch"
                                                aria-checked={visible[member.id]}
                                                className={cx(styles.switch, visible[member.id] && styles.switchOn)}
                                                onClick={() => toggle(member.id)}
                                            >
                                                <span className={styles.switchThumb} />
                                            </button>
                                        </label>
                                        <input
                                            className={styles.fieldInput}
                                            type="text"
                                            placeholder={member.role ?? 'Роль...'}
                                            value={overrides[member.id] ?? member.role ?? ''}
                                            onChange={e => setOverride(member.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                                {customMembers.map(member => (
                                    <div key={member.id} className={styles.memberControl}>
                                        <div className={styles.toggleRow}>
                                            <span className={styles.toggleName}>
                                                {member.nickname}
                                                <span className={cx(styles.badge, styles.badgeAccent)}>локальный</span>
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <button
                                                    className={styles.removeMemberBtn}
                                                    onClick={() => removeCustomMember(member.id)}
                                                    title="Удалить"
                                                >
                                                    <IonIcon src="/icons/close-outline.svg" />
                                                </button>
                                                <button
                                                    role="switch"
                                                    aria-checked={visible[member.id]}
                                                    className={cx(styles.switch, visible[member.id] && styles.switchOn)}
                                                    onClick={() => toggle(member.id)}
                                                >
                                                    <span className={styles.switchThumb} />
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            className={styles.fieldInput}
                                            type="text"
                                            placeholder="Роль..."
                                            value={overrides[member.id] ?? member.role ?? ''}
                                            onChange={e => setOverride(member.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className={styles.scrollFadeBottom} style={{ opacity: scrolledBottom ? 0 : 1 }} />
                        </div>

                        {!showAddForm ? (
                            <button className={styles.addMemberBtn} onClick={() => setShowAddForm(true)}>
                                <IonIcon src="/icons/add-outline.svg" />
                                Добавить участника
                            </button>
                        ) : (
                            <div className={styles.addMemberForm}>
                                <div className={styles.addMemberFormHeader}>
                                    <span className={styles.addMemberFormTitle}>Новый участник</span>
                                    <button className={styles.addMemberCloseBtn} onClick={resetAddForm}>
                                        <IonIcon src="/icons/close-outline.svg" />
                                    </button>
                                </div>

                                <div className={styles.addMemberField}>
                                    <label className={styles.addMemberLabel}>Никнейм</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        placeholder="Никнейм..."
                                        value={newMember.nickname}
                                        onChange={e => setNewMember(prev => ({ ...prev, nickname: e.target.value }))}
                                        autoFocus
                                    />
                                </div>

                                <div className={styles.addMemberField}>
                                    <label className={styles.addMemberLabel}>Роль</label>
                                    <input
                                        className={styles.fieldInput}
                                        type="text"
                                        placeholder="Роль..."
                                        value={newMember.role}
                                        onChange={e => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.addMemberField}>
                                    <label className={styles.addMemberLabel}>Аватар</label>
                                    <div className={styles.avatarSourceToggle}>
                                        <button
                                            className={cx(styles.segBtn, newMember.avatarMode === 'url' && styles.segBtnActive)}
                                            onClick={() => setNewMember(prev => ({ ...prev, avatarMode: 'url' }))}
                                        >
                                            URL
                                        </button>
                                        <button
                                            className={cx(styles.segBtn, newMember.avatarMode === 'upload' && styles.segBtnActive)}
                                            onClick={() => setNewMember(prev => ({ ...prev, avatarMode: 'upload' }))}
                                        >
                                            Загрузить
                                        </button>
                                    </div>
                                    {newMember.avatarMode === 'url' ? (
                                        <input
                                            className={styles.fieldInput}
                                            type="url"
                                            placeholder="https://..."
                                            value={newMember.avatarUrl}
                                            onChange={e => setNewMember(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                        />
                                    ) : (
                                        <div className={styles.avatarRow}>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleAvatarFileChange}
                                            />
                                            <button
                                                className={styles.avatarUploadBtn}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <IonIcon src="/icons/image-outline.svg" />
                                                {newMember.avatarFile ? 'Заменить' : 'Выбрать файл'}
                                            </button>
                                        </div>
                                    )}
                                    {(newMember.avatarMode === 'url' ? newMember.avatarUrl : newMember.avatarFile) && (
                                        <div className={styles.avatarPreviewSmall}>
                                            <img
                                                src={newMember.avatarMode === 'url' ? newMember.avatarUrl : newMember.avatarFile!}
                                                alt=""
                                                className={styles.avatarPreviewSmallImg}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.addMemberActions}>
                                    <button className={styles.addMemberCancelBtn} onClick={resetAddForm}>
                                        Отмена
                                    </button>
                                    <button
                                        className={cx(styles.btnAccent, styles.addMemberSaveBtn)}
                                        onClick={addCustomMember}
                                        disabled={!newMember.nickname.trim()}
                                    >
                                        Добавить
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.renderPanel}>
                            <div className={styles.renderPanelHeader}>
                                <IonIcon src="/icons/image-outline.svg" className={styles.renderPanelIcon} />
                                <span className={styles.controlsLabel}>Экспорт изображения</span>
                            </div>

                            <div className={styles.renderField}>
                                <label className={styles.renderLabel}>Ширина (px)</label>
                                <input
                                    className={styles.fieldInput}
                                    type="number"
                                    min={400}
                                    max={6000}
                                    step={100}
                                    value={renderWidth}
                                    onChange={e =>
                                        setRenderWidth(Math.max(400, Math.min(6000, Number(e.target.value))))
                                    }
                                />
                            </div>

                            <div className={styles.renderField}>
                                <label className={styles.renderLabel}>Формат</label>
                                <div className={styles.formatToggle}>
                                    <button
                                        className={cx(styles.segBtn, renderFormat === 'png' && styles.segBtnActive)}
                                        onClick={() => setRenderFormat('png')}
                                    >
                                        PNG
                                    </button>
                                    <button
                                        className={cx(styles.segBtn, renderFormat === 'jpg' && styles.segBtnActive)}
                                        onClick={() => setRenderFormat('jpg')}
                                    >
                                        JPG
                                    </button>
                                </div>
                            </div>

                            <button
                                className={cx(
                                    styles.btnAccent,
                                    styles.renderBtn,
                                    rendering && styles.renderBtnLoading,
                                    renderStatus === 'ok' && styles.renderBtnOk,
                                    renderStatus === 'err' && styles.renderBtnErr,
                                )}
                                onClick={handleRender}
                                disabled={rendering}
                            >
                                {rendering ? (
                                    <>
                                        <span className={styles.renderSpinner} />
                                        {renderMsg}
                                    </>
                                ) : renderStatus === 'ok' ? (
                                    <>
                                        <IonIcon src="/icons/checkmark-outline.svg" />
                                        {renderMsg}
                                    </>
                                ) : renderStatus === 'err' ? (
                                    <>
                                        <IonIcon src="/icons/close-outline.svg" />
                                        {renderMsg}
                                    </>
                                ) : (
                                    <>
                                        <IonIcon src="/icons/download-outline.svg" />
                                        Сохранить {renderFormat.toUpperCase()}
                                    </>
                                )}
                            </button>

                            <p className={styles.renderHint}>
                                Высота определяется автоматически · {renderWidth}×auto px
                            </p>
                        </div>
                    </div>

                    <div className={styles.controlsTextBlocks}>
                        <div className={styles.controlsHeader}>
                            <span className={styles.controlsLabel}>Текстовые блоки</span>
                            <div className={styles.controlsActions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => setFullscreen(true)}
                                    title="Полноэкранный режим"
                                >
                                    <IonIcon src="/icons/expand-outline.svg" />
                                </button>
                            </div>
                        </div>

                        <div className={styles.toggleListWrap}>
                            <div className={styles.scrollFadeTop} style={{ opacity: scrolledBlockTop ? 0 : 1 }} />
                            <div className={styles.toggleList} ref={blockListRef}>
                                {textBlocks.length === 0 && (
                                    <p className={styles.renderHint}>
                                        Блоков пока нет.
                                    </p>
                                )}

                                {textBlocks.length > 0 && (
                                    <div className={styles.blockList}>
                                        {textBlocks.map(block => (
                                            <div key={block.id} className={styles.blockControl}>
                                                <div className={styles.blockControlHeader}>
                                                    <span className={styles.badge}>
                                                        {block.position === 'before' ? 'над карточкой' : 'под карточкой'}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <button
                                                            className={styles.removeMemberBtn}
                                                            onClick={() => removeTextBlock(block.id)}
                                                            title="Удалить"
                                                        >
                                                            <IonIcon src="/icons/close-outline.svg" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className={styles.formatToggle}>
                                                    <button
                                                        className={cx(styles.segBtn, block.position === 'before' && styles.segBtnActive)}
                                                        onClick={() => updateTextBlock(block.id, 'position', 'before')}
                                                    >
                                                        Сверху
                                                    </button>
                                                    <button
                                                        className={cx(styles.segBtn, block.position === 'after' && styles.segBtnActive)}
                                                        onClick={() => updateTextBlock(block.id, 'position', 'after')}
                                                    >
                                                        Снизу
                                                    </button>
                                                </div>

                                                <input
                                                    className={styles.fieldInput}
                                                    type="text"
                                                    placeholder="Заголовок..."
                                                    value={block.title}
                                                    onChange={e => updateTextBlock(block.id, 'title', e.target.value)}
                                                />
                                                <input
                                                    className={styles.fieldInput}
                                                    type="text"
                                                    placeholder="Подзаголовок..."
                                                    value={block.subtitle}
                                                    onChange={e => updateTextBlock(block.id, 'subtitle', e.target.value)}
                                                />
                                                <TextEditor
                                                    key={block.id}
                                                    compact
                                                    allowHtml
                                                    hideFooter
                                                    initialValue={block.content}
                                                    placeholder="Текст..."
                                                    className={styles.blockTextEditor}
                                                    onChange={(value) => updateTextBlock(block.id, 'content', value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.scrollFadeBottom} style={{ opacity: scrolledBlockBottom ? 0 : 1 }} />
                        </div>

                        <button className={styles.addMemberBtn} onClick={addTextBlock}>
                            <IonIcon src="/icons/add-outline.svg" />
                            Добавить блок
                        </button>

                        <div className={styles.renderPanel}>
                            <input
                                ref={importInputRef}
                                type="file"
                                accept=".json"
                                hidden
                                onChange={handleImportConfig}
                            />
                            <div className={styles.configRow}>
                                <div className={styles.configInputWrap}>
                                    <input
                                        className={styles.configInput}
                                        type="text"
                                        value={configName}
                                        onChange={e => setConfigName(e.target.value)}
                                    />
                                </div>
                                <button className={cx(styles.configBtn, styles.configBtnAccent)} onClick={handleExportConfig}>
                                    <IonIcon src="/icons/file-down.svg" />
                                    <span>Экспорт</span>
                                </button>
                                <button className={styles.configBtn} onClick={() => importInputRef.current?.click()}>
                                    <IonIcon src="/icons/file-up.svg" />
                                    <span>Импорт</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {fullscreen && (
                <button
                    className={styles.exitFullscreen}
                    onClick={() => setFullscreen(false)}
                    title="Выйти из полноэкранного режима"
                >
                    <IonIcon src="/icons/contract-outline.svg" />
                </button>
            )}

            {cropSourceUrl && (
                <AvatarCropper
                    sourceUrl={cropSourceUrl}
                    onCancelAction={() => { URL.revokeObjectURL(cropSourceUrl); setCropSourceUrl(null); }}
                    onApplyAction={async file => {
                        URL.revokeObjectURL(cropSourceUrl);
                        setCropSourceUrl(null);
                        setNewMember(prev => ({ ...prev, avatarFile: null }));
                        const dataUrl = await fileToDataUrl(file);
                        setNewMember(prev => ({ ...prev, avatarFile: dataUrl }));
                    }}
                />
            )}

            <div
                ref={wrapperRef}
                className={cx(styles.cardWrapper, fullscreen && styles.cardWrapperFullscreen)}
                style={!fullscreen && cardHeight > 0 ? { height: scaledHeight } : undefined}
            >
                <main
                    ref={cardRef}
                    className={cx(styles.card, !teamcardEnabled && styles.cardNoTeam)}
                    style={{
                        transform: `scale(${fullscreen ? fsScale : scale})`,
                        transformOrigin: fullscreen ? 'center center' : 'top left',
                    }}
                >
                    <div className={styles.cardBg} />

                    <TextBlockGroup
                        blocks={beforeBlocks}
                        groupClass={styles.textBlockGroupBefore}
                        hiddenClass={styles.textBlockGroupBeforeNoTeam}
                        hidden={!teamcardEnabled}
                    />

                    {teamcardEnabled && (
                        <>
                            <div className={styles.header}>
                                <div className={styles.headerLeft}>
                                    <a href="https://redtail.foxgirls.org" className={styles.brandUrl}>
                                        redtail.foxgirls.org
                                    </a>
                                    <span className={styles.brandName}>REDTAIL</span>
                                    <span className={styles.brandSub}>Команда переводчиков</span>
                                </div>
                                <IonIcon src="/icons/redtail.svg" className={styles.headerIcon} />
                            </div>

                            <div className={styles.divider} />

                            <ul className={styles.grid}>
                                {visibleMembers.map(member => {
                                    const custom = isCustomMember(member.id);
                                    const imgUrl = custom ? (member as CustomMember).avatarUrl : (member as TeamMember).image?.url;
                                    const role =
                                        overrides[member.id] !== undefined && overrides[member.id] !== ''
                                            ? overrides[member.id]
                                            : member.role;

                                    return (
                                        <li key={member.id} className={styles.member}>
                                            <div className={cx(styles.avatar, !imgUrl && styles.avatarEmpty)}>
                                                {imgUrl && (
                                                    <img
                                                        src={custom ? imgUrl : strDomain + imgUrl}
                                                        alt={member.nickname}
                                                        className={styles.avatarImg}
                                                        crossOrigin={custom ? undefined : 'anonymous'}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.info}>
                                                <span className={styles.nickname}>{member.nickname}</span>
                                                <span className={styles.role}>{role}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}

                    <TextBlockGroup
                        blocks={afterBlocks}
                        groupClass={styles.textBlockGroupAfter}
                        hiddenClass={styles.textBlockGroupAfterNoTeam}
                        hidden={!teamcardEnabled}
                    />
                </main>
            </div>
        </div>
    );
}