'use client';

import { useEffect } from 'react';

export const SmoothScroll = () => {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as Element).closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Extract the hash — handles both '#titles' and '/#titles'
            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            const hash = href.slice(hashIndex);
            const targetId = hash.slice(1);

            // If there's a pathname before the hash and it's not current page, let browser navigate normally
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
                // Section taller than viewport — align to top with navbar offset
                const offset = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize);
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            } else {
                // Section fits in viewport — center it
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            history.pushState(null, '', href);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return null;
};