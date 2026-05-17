// src/components/IonIcon.tsx
'use client';

import { useEffect } from 'react';
import { defineCustomElements } from '@ionic/core/loader';

let defined = false;

type IonIconProps = {
    name?: string;
    src?: string;
    icon?: string;
    style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>;

export const IonIcon = ({ name, src, icon, style, ...rest }: IonIconProps) => {
    useEffect(() => {
        if (defined) return;
        defined = true;
        defineCustomElements(window);

        // Re-register after bfcache restore
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) defineCustomElements(window);
        });
    }, []);

    return (
        // @ts-ignore
        <ion-icon name={name} src={src} icon={icon} style={style} {...rest} />
    );
};