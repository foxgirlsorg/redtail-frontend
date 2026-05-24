'use client';

import * as React from 'react';
import clsx from 'clsx';

type IconMode = 'ios' | 'md';

type IonIconProps = Omit<React.HTMLAttributes<HTMLElement>, 'color'> & {
    name?: string;
    ios?: string;
    md?: string;
    icon?: string | Partial<Record<IconMode, string>>;
    src?: string;
    mode?: IconMode;
    size?: 'small' | 'large' | string;
    color?: string;
    flipRtl?: boolean;
    title?: string;
    decorative?: boolean;
};

const ICON_BASE_PATH = '/icons';

const cache = new Map<string, Promise<string>>();

function isSrc(value?: string) {
    return !!value && /(\/|\.)/.test(value.trim());
}

function toKebab(value: string) {
    return value
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z0-9])/g, '$1-$2')
        .toLowerCase();
}

function sanitizeIconName(value?: string | null) {
    if (!value) return null;

    const name = toKebab(value.trim());
    if (!name || /[^a-z0-9-]/i.test(name)) return null;

    return name;
}

function resolveIconName(props: IonIconProps) {
    const mode = props.mode === 'ios' ? 'ios' : 'md';

    if (mode === 'ios' && props.ios) return sanitizeIconName(props.ios);
    if (mode === 'md' && props.md) return sanitizeIconName(props.md);

    if (props.name) return sanitizeIconName(props.name);

    if (typeof props.icon === 'string' && !isSrc(props.icon)) {
        return sanitizeIconName(props.icon);
    }

    return null;
}

function resolveIconUrl(props: IonIconProps) {
    if (props.src && isSrc(props.src)) return props.src.trim();

    if (typeof props.icon === 'string' && isSrc(props.icon)) {
        return props.icon.trim();
    }

    if (props.icon && typeof props.icon === 'object') {
        const mode = props.mode === 'ios' ? 'ios' : 'md';
        const modeIcon = props.icon[mode];

        if (modeIcon && isSrc(modeIcon)) return modeIcon.trim();

        const modeName = sanitizeIconName(modeIcon);
        if (modeName) return `${ICON_BASE_PATH}/${modeName}.svg`;
    }

    const name = resolveIconName(props);
    return name ? `${ICON_BASE_PATH}/${name}.svg` : null;
}

function sanitizeSvg(svgText: string) {
    if (typeof window === 'undefined') return '';

    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return '';

    svg.querySelectorAll('script').forEach((node) => node.remove());

    svg.querySelectorAll('*').forEach((node) => {
        [...node.attributes].forEach((attr) => {
            const name = attr.name.toLowerCase();
            const value = attr.value.toLowerCase();

            if (name.startsWith('on') || value.includes('javascript:')) {
                node.removeAttribute(attr.name);
            }
        });
    });

    svg.classList.add('ionicon');

    return svg.outerHTML;
}

async function loadSvg(url: string) {
    if (!cache.has(url)) {
        cache.set(
            url,
            fetch(url)
                .then((res) => (res.ok ? res.text() : ''))
                .then(sanitizeSvg)
                .catch(() => '')
        );
    }

    return cache.get(url)!;
}

export function IonIcon({
                            name,
                            ios,
                            md,
                            icon,
                            src,
                            mode = 'md',
                            size,
                            color,
                            flipRtl = false,
                            title,
                            decorative = !title,
                            className,
                            style,
                            ...rest
                        }: IonIconProps) {
    const [svg, setSvg] = React.useState('');

    const url = React.useMemo(
        () => resolveIconUrl({ name, ios, md, icon, src, mode }),
        [name, ios, md, icon, src, mode]
    );

    React.useEffect(() => {
        let cancelled = false;

        if (!url) {
            setSvg('');
            return;
        }

        loadSvg(url).then((content) => {
            if (!cancelled) setSvg(content);
        });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return React.createElement('ion-icon', {
        ...rest,
        role: decorative ? undefined : 'img',
        'aria-hidden': decorative ? true : undefined,
        'aria-label': decorative ? undefined : title,
        title,
        class: clsx(
            'app-ion-icon',
            size === 'small' && 'icon-small',
            size === 'large' && 'icon-large',
            flipRtl && 'flip-rtl',
            color && `ion-color ion-color-${color}`,
            className
        ),
        style: {
            ...style,
            '--ionicon-size':
                size && size !== 'small' && size !== 'large' ? size : undefined,
        } as React.CSSProperties,
        dangerouslySetInnerHTML: { __html: svg },
    });
}

export default IonIcon;