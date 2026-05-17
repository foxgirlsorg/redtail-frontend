'use client';

import React from 'react';
// NOTE: global-error replaces the root layout, so we need html/body here.
// We inline the critical styles since CSS Modules may not be available.

export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ru">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Критическая ошибка — RedTail</title>
            <style>{`
                    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body { height: 100%; font-family: 'Segoe UI', sans-serif; background: #161616; color: #e8e8e8; }
                    .page { position: relative; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; overflow: hidden; }
                    .bg { position: fixed; inset: 0; z-index: 0; }
                    .bg-img { position: absolute; inset: 0; background-image: url('/error-bg.jpg'); background-size: cover; background-position: top center; filter: blur(3px); transform: scale(1.05); }
                    .bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(15,15,17,0.83) 0%, rgba(15,15,17,0.95) 100%); }
                    .content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
                    .ghost { font-size: clamp(6rem,20vw,10rem); font-weight: 700; color: #de6161; line-height: 1; opacity: .1; position: absolute; user-select: none; pointer-events: none; }
                    .label { font-size: .7rem; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: #de6161; margin-bottom: 1rem; }
                    .heading { font-size: clamp(1.4rem,4vw,2rem); font-weight: 300; letter-spacing: .08em; text-transform: uppercase; margin-bottom: .75rem; }
                    .divider { width: 2.5rem; height: 2px; background: #de6161; border-radius: 999px; opacity: .6; margin-bottom: 1.25rem; }
                    .desc { font-size: 1rem; color: #a2a2a2; line-height: 1.7; max-width: 28rem; margin-bottom: 2rem; }
                    .btns { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: center; }
                    .btn { display: inline-flex; align-items: center; gap: .5rem; padding: .65rem 1.5rem; border: 1px solid rgba(222,97,97,.4); border-radius: 999px; background: rgba(222,97,97,.1); color: #de6161; font-size: .78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; text-decoration: none; cursor: pointer; font-family: inherit; transition: background .25s, border-color .25s, color .25s; }
                    .btn:hover { background: #de6161; border-color: #de6161; color: white; }
                    svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
                    .footer-link { position: absolute; bottom: 1.5rem; font-size: .62rem; letter-spacing: .2em; text-transform: uppercase; color: #737373; text-decoration: none; z-index: 1; }
                    .footer-link:hover { color: #de6161; }
                `}</style>
        </head>
        <body>
        <div className="page">
            <div className="bg">
                <div className="bg-img" />
                <div className="bg-overlay" />
            </div>

            <div className="ghost">503</div>

            <div className="content">
                <div className="label">Критическая ошибка</div>
                <div className="heading">Сайт недоступен</div>
                <div className="divider" />
                <p className="desc">
                    Произошёл критический сбой.<br />
                    Мы уже работаем над исправлением.
                </p>
                <div className="btns">
                    <button className="btn" onClick={reset}>
                        <svg viewBox="0 0 24 24">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        Перезагрузить
                    </button>
                    <a className="btn" href="/">
                        <svg viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        На главную
                    </a>
                </div>
            </div>

            <a className="footer-link" href="/">redtail</a>
        </div>
        </body>
        </html>
    );
}