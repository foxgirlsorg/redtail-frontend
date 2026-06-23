'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const BAR_ID = '__nav-progress-bar__';

const FINISH_COMPLETE_MS   = 180;
const FINISH_RESET_MS      = 450;
const BROWSER_NAV_GUARD_MS = 1000;

declare global {
    interface Window {
        __navLoaderSuppressNext?: boolean;
    }
}

export function suppressNextNavigationLoader() {
    if (typeof window !== 'undefined') window.__navLoaderSuppressNext = true;
}

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

    const finishTimers     = useRef<ReturnType<typeof setTimeout>[]>([]);
    const started          = useRef(false);
    const isBrowserNav     = useRef(false);
    const browserNavTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        }, FINISH_COMPLETE_MS);

        const t2 = setTimeout(() => {
            bar.style.transition = 'none';
            bar.style.width      = '0%';
        }, FINISH_RESET_MS);

        finishTimers.current = [t1, t2];
        document.documentElement.style.cursor = '';
    };

    const reset = () => {
        finishTimers.current.forEach(clearTimeout);
        finishTimers.current = [];
        started.current = false;
        document.documentElement.style.cursor = '';

        const bar = document.getElementById(BAR_ID) as HTMLDivElement | null;
        if (!bar) return;
        bar.style.transition = 'none';
        bar.style.opacity    = '0';
        bar.style.width      = '0%';
    };

    const clearBrowserNavGuard = () => {
        clearTimeout(browserNavTimer.current ?? undefined);
        browserNavTimer.current = null;
        isBrowserNav.current    = false;
    };

    const handleBrowserNavigation = () => {
        isBrowserNav.current = true;
        clearTimeout(browserNavTimer.current ?? undefined);
        browserNavTimer.current = setTimeout(clearBrowserNavGuard, BROWSER_NAV_GUARD_MS);
        reset();
    };

    useEffect(() => {
        const shouldStartForUrl = (value: string | URL | null | undefined): boolean => {
            if (!value || isBrowserNav.current) return false;
            const url = new URL(value.toString(), location.href);
            return url.pathname !== location.pathname || url.search !== location.search;
        };

        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as Element).closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;
            if (href.startsWith('#')) return;
            if (href.startsWith('mailto')) return;
            if (href.startsWith('http')) return;
            if (anchor.getAttribute('target') === '_blank') return;
            if (anchor.hasAttribute('download')) return;

            try {
                const url = new URL(href, location.href);
                if (url.pathname === location.pathname && url.hash) return;
            } catch {}

            start();
        };

        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) handleBrowserNavigation();
        };

        const originalPush    = history.pushState.bind(history);
        const originalReplace = history.replaceState.bind(history);

        const consumeSuppressFlag = (): boolean => {
            if (window.__navLoaderSuppressNext) {
                window.__navLoaderSuppressNext = false;
                return true;
            }
            return false;
        };

        history.pushState = (...args) => {
            const suppressed = consumeSuppressFlag();
            if (!suppressed && shouldStartForUrl(args[2])) start();
            return originalPush(...args);
        };
        history.replaceState = (...args) => {
            const suppressed = consumeSuppressFlag();
            if (!suppressed && shouldStartForUrl(args[2])) start();
            return originalReplace(...args);
        };

        window.addEventListener('click', handleClick, true);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('click', handleClick, true);
            window.removeEventListener('pageshow', handlePageShow);
            history.pushState    = originalPush;
            history.replaceState = originalReplace;
            finishTimers.current.forEach(clearTimeout);
            clearBrowserNavGuard();
            document.documentElement.style.cursor = '';
        };
    }, []);

    useEffect(() => {
        finish();
        clearBrowserNavGuard();
    }, [pathname, searchParams]);

    return null;
}
