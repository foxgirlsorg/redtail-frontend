'use client';

import React, { useEffect, useState } from 'react';

type Props = {
    className?: string;
    backdrop: {
        url: string;
        formats?: {
            medium?: { url: string };
        };
        width: number;
        height: number;
    };
    domain?: string;
};

export const Backdrop = ({ className = '', backdrop, domain }: Props) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 800);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const imageUrl = isMobile && backdrop.formats?.medium?.url
        ? domain + backdrop.formats.medium.url
        : domain + backdrop.url;

    const ratio = backdrop.width / backdrop.height;

    return (
        <div
            className={`${className}`}
            style={{
                backgroundImage: `url(${imageUrl})`,
                aspectRatio: ratio.toString(),
            }}
        />
    );
};
