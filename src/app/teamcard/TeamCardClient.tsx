'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IonIcon } from '@/components/IonIcon';
import styles from './page.module.css';

type TeamCardClientProps = {
    team: any[];
    strDomain?: string;
};

export default function TeamCardClient({ team, strDomain }: TeamCardClientProps) {
    const [visible, setVisible] = useState<Record<number, boolean>>(
        Object.fromEntries(team.map(m => [m.id, !m.hidden]))
    );
    const [overrides, setOverrides] = useState<Record<number, string>>({});
    const [controlsHidden, setControlsHidden] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [scale, setScale] = useState(1);

    const cardRef = useRef<HTMLElement>(null);
    const CARD_W = 680;
    const CARD_BASE_H = 400;

    const toggle = (id: number) =>
        setVisible(prev => ({ ...prev, [id]: !prev[id] }));

    const setOverride = (id: number, value: string) =>
        setOverrides(prev => ({ ...prev, [id]: value }));

    const visibleMembers = team.filter(m => visible[m.id]);
    const computeScale = useCallback(() => {
        if (!cardRef.current) return;
        const cardH = cardRef.current.offsetHeight;
        const scaleX = (window.innerWidth * 0.95) / CARD_W;
        const scaleY = (window.innerHeight * 0.95) / cardH;
        setScale(Math.min(scaleX, scaleY));
    }, []);

    useEffect(() => {
        if (!fullscreen) { setScale(1); return; }
        computeScale();
        window.addEventListener('resize', computeScale);
        return () => window.removeEventListener('resize', computeScale);
    }, [fullscreen, computeScale, visibleMembers.length]);
    useEffect(() => {
        if (fullscreen) computeScale();
    }, [visibleMembers.length, fullscreen, computeScale]);

    return (
        <div className={styles.wrapper}>

            {!controlsHidden && (
                <div className={styles.controls}>
                    <div className={styles.controlsHeader}>
                        <span className={styles.controlsLabel}>Участники</span>
                        <div className={styles.controlsActions}>
                            <button
                                className={styles.actionBtn}
                                onClick={() => { setControlsHidden(true); setFullscreen(true); }}
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
                                    value={overrides[member.id] ?? member.role}
                                    onChange={e => setOverride(member.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {fullscreen && (
                <button
                    className={styles.exitFullscreen}
                    onClick={() => { setFullscreen(false); setControlsHidden(false); setScale(1); }}
                    title="Выйти из полноэкранного режима"
                >
                    <IonIcon src="/icons/contract-outline.svg" />
                </button>
            )}

            <div
                className={`${styles.cardWrapper} ${fullscreen ? styles.cardWrapperFullscreen : ''}`}
                style={fullscreen ? { transform: `scale(${scale})`, transformOrigin: 'center center' } : undefined}
            >
                <main ref={cardRef} className={styles.card}>
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
                            const thumb = member.image?.formats?.thumbnail?.url;
                            const role = overrides[member.id] !== undefined && overrides[member.id] !== ''
                                ? overrides[member.id]
                                : member.role;
                            return (
                                <li key={member.id} className={styles.member}>
                                    {thumb && (
                                        <div className={styles.avatar}>
                                            <img
                                                src={strDomain + thumb}
                                                alt={member.nickname}
                                                className={styles.avatarImg}
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