'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { IonIcon } from '@/components/IonIcon';
import { AvatarCropper } from '@/components/Auth';
import { TextEditor } from '@/components/TextEditor/textEditor';
import styles from './page.module.css';

type TeamCardClientProps = {
    team: any[];
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

const CARD_W = 680;
let nextCustomId = -1;
let nextBlockId = 1;

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

    const [customMembers, setCustomMembers] = useState<CustomMember[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newNickname, setNewNickname] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [newAvatarMode, setNewAvatarMode] = useState<'url' | 'upload'>('url');
    const [newAvatarFile, setNewAvatarFile] = useState<string | null>(null);
    const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [newBlockTitle, setNewBlockTitle] = useState('');
    const [newBlockSubtitle, setNewBlockSubtitle] = useState('');
    const [newBlockContent, setNewBlockContent] = useState('');
    const [newBlockPosition, setNewBlockPosition] = useState<'before' | 'after'>('before');

    const cardRef = useRef<HTMLElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const toggleListRef = useRef<HTMLDivElement>(null);
    const [scrolledTop, setScrolledTop] = useState(true);
    const [scrolledBottom, setScrolledBottom] = useState(false);

    const toggle = (id: number) =>
        setVisible(prev => ({ ...prev, [id]: !prev[id] }));

    const setOverride = (id: number, value: string) =>
        setOverrides(prev => ({ ...prev, [id]: value }));

    const addCustomMember = () => {
        if (!newNickname.trim()) return;
        const id = nextCustomId--;
        setCustomMembers(prev => [
            ...prev,
            {
                id,
                nickname: newNickname.trim(),
                role: newRole.trim(),
                avatarUrl: newAvatarMode === 'url' ? (newAvatarUrl.trim() || null) : newAvatarFile,
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
        setNewNickname('');
        setNewRole('');
        setNewAvatarUrl('');
        setNewAvatarFile(null);
        setCropSourceUrl(null);
        setShowAddForm(false);
    };

    const addTextBlock = () => {
        setTextBlocks(prev => [...prev, {
            id: nextBlockId++,
            title: newBlockTitle.trim(),
            subtitle: newBlockSubtitle.trim(),
            content: newBlockContent.trim(),
            position: newBlockPosition,
        }]);
        resetBlockForm();
    };

    const removeTextBlock = (id: number) => {
        setTextBlocks(prev => prev.filter(b => b.id !== id));
    };

    const updateTextBlock = (id: number, field: keyof TextBlock, value: any) => {
        setTextBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const resetBlockForm = () => {
        setNewBlockTitle('');
        setNewBlockSubtitle('');
        setNewBlockContent('');
        setNewBlockPosition('before');
        setShowAddBlock(false);
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const checkScroll = useCallback(() => {
        const el = toggleListRef.current;
        if (!el) return;
        setScrolledTop(el.scrollTop <= 0);
        setScrolledBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = toggleListRef.current;
        if (!el) return;
        el.addEventListener('scroll', checkScroll, { passive: true });
        return () => el.removeEventListener('scroll', checkScroll);
    }, [checkScroll, visibleMembers.length]);

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

            setRenderStatus('ok');
            setRenderMsg('Сохранено!');
            setTimeout(() => {
                setRenderStatus('idle');
                setRenderMsg('');
            }, 2500);
        } catch (e) {
            console.error(e);
            setRenderStatus('err');
            setRenderMsg('Ошибка');
            setTimeout(() => {
                setRenderStatus('idle');
                setRenderMsg('');
            }, 3000);
        } finally {
            setRendering(false);
        }
    }, [rendering, renderWidth, renderFormat]);

    const scaledHeight = cardHeight > 0 ? cardHeight * scale : 'auto';

    return (
        <div className={`${styles.wrapper} ${fullscreen ? styles.wrapperFullscreen : ''}`}>
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
                                className={styles.actionBtn}
                                onClick={() => setFullscreen(true)}
                                title="Полноэкранный режим"
                            >
                                <IonIcon src="/icons/expand-outline.svg" />
                            </button>
                        </div>
                    </div>

                    <div className={styles.toggleListWrap}>
                        <div className={styles.scrollFadeTop} style={{ opacity: scrolledTop ? 0 : 1 }} />
                        <div className={styles.toggleList} ref={toggleListRef}>
                            {team.map(member => (
                            <div key={member.id} className={styles.memberControl}>
                                <label className={styles.toggleRow}>
                                    <span className={`${styles.toggleName} ${member.hidden ? styles.toggleNameMuted : ''}`}>
                                        {member.nickname}
                                        {member.hidden && <span className={styles.badge}>скрыт</span>}
                                    </span>
                                    <button
                                        role="switch"
                                        aria-checked={visible[member.id]}
                                        className={`${styles.switch} ${visible[member.id] ? styles.switchOn : ''}`}
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
                                        <span className={`${styles.badge} ${styles.badgeAccent}`}>локальный</span>
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
                                            className={`${styles.switch} ${visible[member.id] ? styles.switchOn : ''}`}
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
                                    value={newNickname}
                                    onChange={e => setNewNickname(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.addMemberField}>
                                <label className={styles.addMemberLabel}>Роль</label>
                                <input
                                    className={styles.fieldInput}
                                    type="text"
                                    placeholder="Роль..."
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                />
                            </div>

                            <div className={styles.addMemberField}>
                                <label className={styles.addMemberLabel}>Аватар</label>
                                <div className={styles.avatarSourceToggle}>
                                    <button
                                        className={`${styles.segBtn} ${newAvatarMode === 'url' ? styles.segBtnActive : ''}`}
                                        onClick={() => setNewAvatarMode('url')}
                                    >
                                        URL
                                    </button>
                                    <button
                                        className={`${styles.segBtn} ${newAvatarMode === 'upload' ? styles.segBtnActive : ''}`}
                                        onClick={() => setNewAvatarMode('upload')}
                                    >
                                        Загрузить
                                    </button>
                                </div>
                                {newAvatarMode === 'url' ? (
                                    <input
                                        className={styles.fieldInput}
                                        type="url"
                                        placeholder="https://..."
                                        value={newAvatarUrl}
                                        onChange={e => setNewAvatarUrl(e.target.value)}
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
                                            {newAvatarFile ? 'Заменить' : 'Выбрать файл'}
                                        </button>
                                    </div>
                                )}
                                {(newAvatarMode === 'url' ? newAvatarUrl : newAvatarFile) && (
                                    <div className={styles.avatarPreviewSmall}>
                                        <img
                                            src={newAvatarMode === 'url' ? newAvatarUrl : newAvatarFile!}
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
                                    className={`${styles.btnAccent} ${styles.addMemberSaveBtn}`}
                                    onClick={addCustomMember}
                                    disabled={!newNickname.trim()}
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
                                    className={`${styles.segBtn} ${renderFormat === 'png' ? styles.segBtnActive : ''}`}
                                    onClick={() => setRenderFormat('png')}
                                >
                                    PNG
                                </button>
                                <button
                                    className={`${styles.segBtn} ${renderFormat === 'jpg' ? styles.segBtnActive : ''}`}
                                    onClick={() => setRenderFormat('jpg')}
                                >
                                    JPG
                                </button>
                            </div>
                        </div>

                        <button
                            className={`${styles.btnAccent} ${styles.renderBtn} ${rendering ? styles.renderBtnLoading : ''} ${renderStatus === 'ok' ? styles.renderBtnOk : ''} ${renderStatus === 'err' ? styles.renderBtnErr : ''}`}
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

                    <div className={styles.controlsTextBlocks}>                        <div className={styles.controlsHeader}>
                            <span className={styles.controlsLabel}>Текстовые блоки</span>
                        </div>

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
                                                className={`${styles.segBtn} ${block.position === 'before' ? styles.segBtnActive : ''}`}
                                                onClick={() => updateTextBlock(block.id, 'position', 'before')}
                                            >
                                                Сверху
                                            </button>
                                            <button
                                                className={`${styles.segBtn} ${block.position === 'after' ? styles.segBtnActive : ''}`}
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

                        <button className={styles.addMemberBtn} onClick={addTextBlock}>
                            <IonIcon src="/icons/add-outline.svg" />
                            Добавить блок
                        </button>
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
                        setNewAvatarFile(await fileToDataUrl(file));
                    }}
                />
            )}

            <div
                ref={wrapperRef}
                className={`${styles.cardWrapper} ${fullscreen ? styles.cardWrapperFullscreen : ''}`}
                style={!fullscreen && cardHeight > 0 ? { height: scaledHeight } : undefined}
            >
                <main
                    ref={cardRef}
                    className={styles.card}
                    style={{
                        transform: `scale(${fullscreen ? fsScale : scale})`,
                        transformOrigin: fullscreen ? 'center center' : 'top left',
                    }}
                >
                    <div className={styles.cardBg} />

                    {beforeBlocks.length > 0 && (
                        <div className={styles.textBlockGroupBefore}>
                            {beforeBlocks.map(block => (
                                <div key={block.id} className={styles.textBlockWrap}>
                                    {block.title && <div className={styles.textBlockTitle}>{block.title}</div>}
                                    {block.subtitle && <div className={styles.brandSub}>{block.subtitle}</div>}
                                    {(block.title || block.subtitle) && <div className={`${styles.divider} ${styles.tb}`} />}
                                    {block.content && <div className={styles.textBlock}>
                                        <div className={styles.textBlockContent}>
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{block.content}</ReactMarkdown>
                                        </div>
                                    </div>}
                                </div>
                            ))}
                        </div>
                    )}

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
                            const isCustom = member.id < 0;
                            const imgUrl = isCustom ? member.avatarUrl : member.image?.url;
                            const role =
                                overrides[member.id] !== undefined && overrides[member.id] !== ''
                                    ? overrides[member.id]
                                    : member.role;

                            return (
                                <li key={member.id} className={styles.member}>
                                    <div className={`${styles.avatar} ${!imgUrl ? styles.avatarEmpty : ''}`}>
                                        {imgUrl && (
                                            <img
                                                src={isCustom ? imgUrl : strDomain + imgUrl}
                                                alt={member.nickname}
                                                className={styles.avatarImg}
                                                crossOrigin={isCustom ? undefined : 'anonymous'}
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

                    {afterBlocks.length > 0 && (
                        <div className={styles.textBlockGroupAfter}>
                            {afterBlocks.map(block => (
                                <div key={block.id} className={styles.textBlockWrap}>
                                    {block.title && <div className={styles.textBlockTitle}>{block.title}</div>}
                                    {block.subtitle && <div className={styles.brandSub}>{block.subtitle}</div>}
                                    {(block.title || block.subtitle) && <div className={`${styles.divider} ${styles.tb}`} />}
                                    {block.content && <div className={styles.textBlock}>
                                        <div className={styles.textBlockContent}>
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{block.content}</ReactMarkdown>
                                        </div>
                                    </div>}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
