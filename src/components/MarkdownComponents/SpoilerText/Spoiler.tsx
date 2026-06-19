'use client';

import React, { useState } from 'react';
import styles from './Spoiler.module.css';

export function Spoiler({ children }: { children?: React.ReactNode }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <span
            className={`${styles.spoiler} ${
                revealed ? styles.spoilerRevealed : ''
            }`}
            onClick={() => !revealed && setRevealed(true)}
            role={revealed ? undefined : 'button'}
            tabIndex={revealed ? -1 : 0}
            aria-label={
                revealed ? undefined : 'Скрытый текст, нажмите чтобы показать'
            }
            onKeyDown={(e) => {
                if (!revealed && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setRevealed(true);
                }
            }}
        >
      <span
          className={`${styles.spoilerContent} ${
              revealed ? styles.spoilerContentRevealed : ''
          }`}
      >
        {children}
      </span>
    </span>
    );
}