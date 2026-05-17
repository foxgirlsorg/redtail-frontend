'use client';

import { useEffect } from 'react';

export const SmoothScroll = () => {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as Element).closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;
            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            const hash = href.slice(hashIndex);
            const targetId = hash.slice(1);
            const pathPart = href.slice(0, hashIndex);
            if (pathPart && pathPart !== '/' && pathPart !== window.location.pathname) return;

            const target = document.getElementById(targetId);
            if (!target) return;

            e.preventDefault();

            if (hash === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.pushState(null, '', href);
                return;
            }

            const elementHeight = target.getBoundingClientRect().height;
            const windowHeight = window.innerHeight;

            if (elementHeight > windowHeight) {
                const offset = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize);
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            history.pushState(null, '', href);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return null;
};