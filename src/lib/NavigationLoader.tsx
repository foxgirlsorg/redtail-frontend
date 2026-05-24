'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const BAR_ID = '__nav-progress-bar__';

function getBar(): HTMLDivElement {
    let bar = document.getElementById(BAR_ID) as HTMLDivElement | null;
    if (!bar) {
        bar = document.createElement('div');
        bar.id = BAR_ID;
        Object.assign(bar.style, {
            position:      'fixed',
            top:           '0',
            left:          '0',
            height:        '2px',
            width:         '0%',
            background:    'var(--accent, #de6161)',
            zIndex:        '99999',
            pointerEvents: 'none',
            borderRadius:  '0 2px 2px 0',
            boxShadow:     '0 0 8px rgba(222,97,97,0.55)',
            opacity:       '0',
            transition:    'none',
        });
        document.body.appendChild(bar);
    }
    return bar;
}

export function NavigationLoader() {
    const pathname     = usePathname();
    const searchParams = useSearchParams();
    const finishTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const started      = useRef(false);
    const start = () => {
        finishTimers.current.forEach(clearTimeout);
        finishTimers.current = [];

        const bar = getBar();
        bar.style.transition = 'none';
        bar.style.width      = '0%';
        bar.style.opacity    = '1';
        requestAnimationFrame(() => {
            bar.style.transition = 'width 10s cubic-bezier(0.05, 0.5, 0.1, 1)';
            bar.style.width      = '75%';
        });

        document.documentElement.style.cursor = 'wait';
        started.current = true;
    };
    const finish = () => {
        if (!started.current) return;
        started.current = false;

        const bar = getBar();
        bar.style.transition = 'width 0.15s ease';
        bar.style.width      = '100%';
        const t1 = setTimeout(() => {
            bar.style.transition = 'opacity 0.25s ease';
            bar.style.opacity    = '0';
        }, 180);
        const t2 = setTimeout(() => {
            bar.style.transition = 'none';
            bar.style.width      = '0%';
        }, 450);

        finishTimers.current = [t1, t2];
        document.documentElement.style.cursor = '';
    };
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as Element).closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href) return;
            if (
                href.startsWith('mailto') ||
                anchor.hasAttribute('download') ||
                anchor.getAttribute('target') === '_blank'
            ) return;

            if (href.startsWith('#')) return;
            try {
                const url = new URL(href, window.location.href);
                if (url.pathname === window.location.pathname && url.hash) return;
            } catch {}

            if (href.startsWith('http')) return;
            start();
        };

        const handlePageShow = (e: PageTransitionEvent) => { // ← add here
            if (e.persisted) {
                finishTimers.current.forEach(clearTimeout);
                finishTimers.current = [];
                started.current = false;
                document.documentElement.style.cursor = '';
                const bar = document.getElementById('__nav-progress-bar__') as HTMLDivElement | null;
                if (bar) {
                    bar.style.transition = 'none';
                    bar.style.opacity = '0';
                    bar.style.width = '0%';
                }
            }
        };

        const originalPush    = history.pushState.bind(history);
        const originalReplace = history.replaceState.bind(history);

        history.pushState = (...args) => {
            start();
            return originalPush(...args);
        };
        history.replaceState = (...args) => {
            const newUrl = args[2]?.toString() ?? '';
            if (newUrl && new URL(newUrl, location.href).pathname !== location.pathname) {
                start();
            }
            return originalReplace(...args);
        };

        window.addEventListener('click', handleClick, true);
        window.addEventListener('popstate', start);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('click', handleClick, true);
            window.removeEventListener('popstate', start);
            window.removeEventListener('pageshow', handlePageShow);
            history.pushState    = originalPush;
            history.replaceState = originalReplace;
            finishTimers.current.forEach(clearTimeout);
            document.documentElement.style.cursor = '';
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        finish();
    }, [pathname, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}