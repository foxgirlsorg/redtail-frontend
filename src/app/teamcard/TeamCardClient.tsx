'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IonIcon } from '@/components/IonIcon';
import styles from './page.module.css';

type TeamCardClientProps = {
    team: any[];
    strDomain?: string;
};

const CARD_W = 680;

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

    const cardRef = useRef<HTMLElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const cardBgRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);

    const toggle = (id: number) =>
        setVisible(prev => ({ ...prev, [id]: !prev[id] }));

    const setOverride = (id: number, value: string) =>
        setOverrides(prev => ({ ...prev, [id]: value }));

    const visibleMembers = team.filter(m => visible[m.id]);

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
    }, [visibleMembers.length, overrides]);

    useEffect(() => {
        if (!fullscreen) return;
        computeFsScale();
        window.addEventListener('resize', computeFsScale);
        return () => window.removeEventListener('resize', computeFsScale);
    }, [fullscreen, visibleMembers.length, computeFsScale]);

    const createBlurredBg = (
        imageUrl: string,
        blurPxAt680: number,
        outW: number,
        outH: number
    ): Promise<string> =>
        new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                const blurPx = Math.min(blurPxAt680 * Math.sqrt(outW / CARD_W), 7);

                const scale = 0.35; // lower = smoother/less noisy
                const smallW = Math.max(1, Math.round(outW * scale));
                const smallH = Math.max(1, Math.round(outH * scale));

                const smallCanvas = document.createElement("canvas");
                smallCanvas.width = smallW;
                smallCanvas.height = smallH;

                const smallCtx = smallCanvas.getContext("2d");
                if (!smallCtx) return reject("no small ctx");

                const coverScale = Math.max(smallW / img.width, smallH / img.height);
                const drawW = img.width * coverScale;
                const drawH = img.height * coverScale;
                const dx = (smallW - drawW) / 2;
                const dy = (smallH - drawH) / 2;

                smallCtx.imageSmoothingEnabled = true;
                smallCtx.imageSmoothingQuality = "high";
                smallCtx.filter = `blur(${blurPx * scale}px) brightness(0.85) saturate(0.95)`;
                smallCtx.drawImage(img, dx, dy, drawW, drawH);

                const canvas = document.createElement("canvas");
                canvas.width = outW;
                canvas.height = outH;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("no ctx");

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(smallCanvas, 0, 0, outW, outH);

                // subtle smoothing veil
                ctx.fillStyle = "rgba(255,255,255,0.035)";
                ctx.fillRect(0, 0, outW, outH);

                resolve(canvas.toDataURL("image/png"));
            };

            img.onerror = reject;
            img.src = imageUrl;
        });

    const handleRender = useCallback(async () => {
        if (!cardRef.current || rendering) return;

        setRendering(true);
        setRenderStatus('loading');
        setRenderMsg('Загрузка...');

        const cardEl = cardRef.current;
        const bgEl = cardBgRef.current;
        const dividerEl = dividerRef.current;

        const originalBorder = cardEl.style.border;
        const originalBoxShadow = cardEl.style.boxShadow;
        const originalOutline = cardEl.style.outline;
        const originalTransform = cardEl.style.transform;

        const originalBg = bgEl?.style.backgroundImage ?? '';
        const originalBgFilter = bgEl?.style.filter ?? '';
        const originalDividerHeight = dividerEl?.style.height ?? '';

        const originalBgInset = bgEl?.style.inset ?? '';
        const originalBgSize = bgEl?.style.backgroundSize ?? '';
        const originalDividerBackground = dividerEl?.style.background ?? '';
        const originalDividerBackgroundImage = dividerEl?.style.backgroundImage ?? '';
        const originalDividerMinHeight = dividerEl?.style.minHeight ?? '';

        try {
            const naturalW = cardEl.scrollWidth;
            const naturalH = cardEl.scrollHeight;
            const dpr = renderWidth / naturalW;

            const outputW = Math.round(naturalW * dpr);
            const outputH = Math.round(naturalH * dpr);

            cardEl.style.border = 'none';
            cardEl.style.boxShadow = 'none';
            cardEl.style.outline = 'none';
            cardEl.style.transform = 'none';

            if (bgEl) {
                setRenderMsg('Обработка фона...');

                const blurredDataUrl = await createBlurredBg(
                    '/teamcard/pattern.png',
                    4,
                    outputW,
                    outputH
                );

                bgEl.style.inset = '0';
                bgEl.style.backgroundImage = `url(${blurredDataUrl})`;
                bgEl.style.backgroundSize = '100% 100%';
                bgEl.style.filter = 'none';
            }

            if (dividerEl) {
                dividerEl.style.height = '2px';
                dividerEl.style.minHeight = '2px';
                dividerEl.style.backgroundImage =
                    'linear-gradient(to right, #de6161 0%, rgba(222, 97, 97, 0.35) 45%, rgba(222, 97, 97, 0) 100%)';
            }

            const mod = await import('html2canvas' as any);
            const html2canvas = mod.default ?? mod;

            setRenderMsg('Рендеринг...');

            const canvas = await html2canvas(cardEl, {
                scale: dpr,
                useCORS: true,
                allowTaint: true,
                backgroundColor: renderFormat === 'jpg' ? '#161616' : null,
                width: naturalW,
                height: naturalH,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                logging: false,
            });

            setRenderMsg('Сохранение...');

            const mimeType = renderFormat === 'jpg' ? 'image/jpeg' : 'image/png';
            const dataUrl =
                renderFormat === 'jpg'
                    ? canvas.toDataURL(mimeType, 0.98)
                    : canvas.toDataURL(mimeType);

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
            cardEl.style.border = originalBorder;
            cardEl.style.boxShadow = originalBoxShadow;
            cardEl.style.outline = originalOutline;
            cardEl.style.transform = originalTransform;

            if (bgEl) {
                bgEl.style.backgroundImage = originalBg;
                bgEl.style.backgroundSize = originalBgSize;
                bgEl.style.filter = originalBgFilter;
                bgEl.style.inset = originalBgInset;
            }

            if (dividerEl) {
                dividerEl.style.background = originalDividerBackground;
                dividerEl.style.backgroundImage = originalDividerBackgroundImage;
                dividerEl.style.height = originalDividerHeight;
                dividerEl.style.minHeight = originalDividerMinHeight;
            }

            setRendering(false);
        }
    }, [rendering, renderWidth, renderFormat]);

    const scaledHeight = cardHeight > 0 ? cardHeight * scale : 'auto';

    return (
        <div className={`${styles.wrapper} ${fullscreen ? styles.wrapperFullscreen : ''}`}>
            {!fullscreen && (
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

                    <div className={styles.toggleList}>
                        {team.map(member => (
                            <div key={member.id} className={styles.memberControl}>
                                <label className={styles.toggleRow}>
                                    <span className={`${styles.toggleName} ${member.hidden ? styles.toggleNameMuted : ''}`}>
                                        {member.nickname}
                                        {member.hidden && <span className={styles.hiddenBadge}>скрыт</span>}
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
                                    className={styles.roleOverride}
                                    type="text"
                                    placeholder={member.role ?? 'Роль...'}
                                    value={overrides[member.id] ?? member.role ?? ''}
                                    onChange={e => setOverride(member.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.renderPanel}>
                        <div className={styles.renderPanelHeader}>
                            <IonIcon src="/icons/image-outline.svg" className={styles.renderPanelIcon} />
                            <span className={styles.controlsLabel}>Экспорт изображения</span>
                        </div>

                        <div className={styles.renderField}>
                            <label className={styles.renderLabel}>Ширина (px)</label>
                            <input
                                className={styles.renderInput}
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
                                    className={`${styles.formatBtn} ${renderFormat === 'png' ? styles.formatBtnActive : ''}`}
                                    onClick={() => setRenderFormat('png')}
                                >
                                    PNG
                                </button>
                                <button
                                    className={`${styles.formatBtn} ${renderFormat === 'jpg' ? styles.formatBtnActive : ''}`}
                                    onClick={() => setRenderFormat('jpg')}
                                >
                                    JPG
                                </button>
                            </div>
                        </div>

                        <button
                            className={`${styles.renderBtn} ${rendering ? styles.renderBtnLoading : ''} ${renderStatus === 'ok' ? styles.renderBtnOk : ''} ${renderStatus === 'err' ? styles.renderBtnErr : ''}`}
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
                    <div className={styles.cardBg} ref={cardBgRef} />

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

                    <div ref={dividerRef} className={styles.divider} />

                    <ul className={styles.grid}>
                        {visibleMembers.map(member => {
                            const imgUrl = member.image?.url;
                            const role =
                                overrides[member.id] !== undefined && overrides[member.id] !== ''
                                    ? overrides[member.id]
                                    : member.role;

                            return (
                                <li key={member.id} className={styles.member}>
                                    {imgUrl && (
                                        <div className={styles.avatar}>
                                            <img
                                                src={strDomain + imgUrl}
                                                alt={member.nickname}
                                                className={styles.avatarImg}
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    )}
                                    <div className={styles.info}>
                                        <span className={styles.nickname}>{member.nickname}</span>
                                        <span className={styles.role}>{role}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </main>
            </div>
        </div>
    );
}