'use client';

import { useRef, useCallback } from 'react';
import { IonIcon } from '@/components/IonIcon';
import styles from './page.module.css';

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadUrl(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function svgToPng(svgUrl: string, targetHeight: number): Promise<Blob> {
    const res = await fetch(svgUrl);
    const svgText = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) throw new Error('Invalid SVG');

    const vb = svgEl.getAttribute('viewBox');
    if (!vb) throw new Error('SVG missing viewBox');
    const [, , vbW, vbH] = vb.split(/[\s,]+/).map(Number);
    const scale = targetHeight / vbH;
    const targetWidth = Math.round(vbW * scale);

    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            canvas.toBlob((b) => {
                URL.revokeObjectURL(blobUrl);
                if (b) resolve(b);
                else reject(new Error('Canvas export failed'));
            }, 'image/png');
        };
        img.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Failed to load SVG'));
        };
        img.src = blobUrl;
    });
}

type AssetCardProps = {
    title: string;
    preview: React.ReactNode;
    downloads: { label: string; onClick: () => void }[];
};

function AssetCard({ title, preview, downloads }: AssetCardProps) {
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div className={styles.cardPreview}>{preview}</div>
            <div className={styles.cardDownloads}>
                {downloads.map((d) => (
                    <button key={d.label} className={styles.dlBtn} onClick={d.onClick}>
                        {d.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function BrandingClient() {
    const pngCache = useRef<Map<string, Blob>>(new Map());

    const handleSvgPng = useCallback(async (svgUrl: string, filename: string) => {
        const cached = pngCache.current.get(svgUrl);
        if (cached) {
            downloadBlob(cached, filename);
            return;
        }
        const blob = await svgToPng(svgUrl, 1024);
        pngCache.current.set(svgUrl, blob);
        downloadBlob(blob, filename);
    }, []);

    return (
        <div className={styles.grid}>
            <AssetCard
                title="Паттерн"
                preview={
                    <img src="/teamcard/pattern_small.jpg" alt="pattern" className={styles.imgPreview} />
                }
                downloads={[
                    { label: 'small', onClick: () => downloadUrl('/teamcard/pattern_small.jpg', 'pattern_small.jpg') },
                    { label: 'blurred', onClick: () => downloadUrl('/teamcard/pattern_blurred.jpg', 'pattern_blurred.jpg') },
                    { label: 'full', onClick: () => downloadUrl('/teamcard/pattern.png', 'pattern.png') },
                ]}
            />

            <AssetCard
                title="Логотип (иконка)"
                preview={
                    <IonIcon src="/icons/redtail.svg" className={styles.svgPreview} />
                }
                downloads={[
                    { label: 'SVG', onClick: () => downloadUrl('/icons/redtail.svg', 'redtail-icon.svg') },
                    { label: 'PNG 1024', onClick: () => handleSvgPng('/icons/wordmark.svg', 'redtail-icon.png') },
                ]}
            />

            <AssetCard
                title="wordmark"
                preview={
                    <img src="/wordmark.svg" alt="intro" className={styles.svgPreviewWide} />
                }
                downloads={[
                    { label: 'SVG', onClick: () => downloadUrl('/redtail.svg', 'redtail-wordmark.svg') },
                    { label: 'PNG 1024', onClick: () => handleSvgPng('/wordmark.svg', 'redtail-wordmark.png') },
                ]}
            />

            <AssetCard
                title="wordmark 2"
                preview={
                    <img src="/wordmark-2.svg" alt="intro" className={styles.svgPreviewWide} />
                }
                downloads={[
                    { label: 'SVG', onClick: () => downloadUrl('/redtail.svg', 'redtail-wordmark.svg') },
                    { label: 'PNG 1024', onClick: () => handleSvgPng('/wordmark.svg', 'redtail-wordmark.png') },
                ]}
            />
        </div>
    );
}
