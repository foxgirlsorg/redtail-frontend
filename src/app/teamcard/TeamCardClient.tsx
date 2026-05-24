'use client';

import { useState } from 'react';
import { IonIcon } from '@/components/IonIcon';
import styles from './page.module.css';

type Member = {
    id: number;
    nickname: string;
    role: string;
    hidden: boolean;
    image?: { formats?: { thumbnail?: { url?: string } } };
};

type TeamCardClientProps = {
    team: Member[];
    strDomain?: string;
};

export default function TeamCardClient({ team, strDomain }: TeamCardClientProps) {
    const [visible, setVisible] = useState<Record<number, boolean>>(
        Object.fromEntries(team.map(m => [m.id, !m.hidden]))
    );

    const toggle = (id: number) =>
        setVisible(prev => ({ ...prev, [id]: !prev[id] }));

    const visibleMembers = team.filter(m => visible[m.id]);

    return (
        <div className={styles.wrapper}>
            {/* ── Controls panel ── */}
            <div className={styles.controls}>
                <span className={styles.controlsLabel}>Участники</span>
                <div className={styles.toggleList}>
                    {team.map(member => (
                        <label key={member.id} className={styles.toggleRow}>
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
                    ))}
                </div>
            </div>

            {/* ── Card ── */}
            <main className={styles.card}>
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
                                    <span className={styles.role}>{member.role}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </main>
        </div>
    );
}