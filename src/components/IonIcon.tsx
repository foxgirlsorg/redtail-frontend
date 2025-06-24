'use client';

import { useEffect } from 'react';
import { defineCustomElements } from '@ionic/core/loader';

type IonIconProps = {
    name?: string;
    src?: string;
    icon?: string;
    style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>;

export const IonIcon = ({ name, src, icon, style, ...rest }: IonIconProps) => {
    useEffect(() => {
        // window.Ionicons = { url: '/icons/' };
        defineCustomElements(window);
    }, []);

    return (
        // @ts-ignore
        <ion-icon
            name={name}
            src={src}
            icon={icon}
            style={style}
            {...rest}
        />
    );
};
