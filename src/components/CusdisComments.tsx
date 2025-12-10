// 'use client'
//
// import React, { useEffect, useState } from 'react'
// import { ReactCusdis } from 'react-cusdis'
// import { getCookie, setCookie } from '@/lib/cookies'
//
// type CusdisCommentsProps = {
//     appId: string
//     pageId: string
//     host: string
//     pageTitle: string
//     bgColor: string
// }
//
// const CusdisComments: React.FC<CusdisCommentsProps> = ({
//                                                            appId,
//                                                            pageId,
//                                                            host,
//                                                            pageTitle,
//                                                            bgColor,
//                                                        }) => {
//     const [pageUrl, setPageUrl] = useState<string>('')
//     const [loaded, setLoaded] = useState<boolean>(false)
//
//     useEffect(() => {
//         const scriptUrl = `${host}/js/widget/lang/ru.js`
//         const existingScript = document.querySelector(`script[src="${scriptUrl}"]`)
//
//         if (!existingScript) {
//             const script = document.createElement('script')
//             script.src = scriptUrl
//             script.defer = true
//             document.body.appendChild(script)
//         }
//
//         if (typeof window !== 'undefined') {
//             setPageUrl(window.location.href)
//         }
//
//         const interval = setInterval(async () => {
//             const iframe = document.querySelector<HTMLIFrameElement>('#cusdis_thread iframe')
//             if (!iframe) return
//             iframe.setAttribute('scrolling', 'no')
//
//             try {
//                 const doc = iframe.contentDocument || iframe.contentWindow?.document
//                 if (!doc) return
//
//                 const body = doc.getElementsByTagName('body')[0]
//                 body.style.backgroundColor = bgColor
//
//                 if (!doc.querySelector('style[data-injected="true"]')) {
//                     const res = await fetch('/cusdis.css')
//                     const css = await res.text()
//
//                     const style = doc.createElement('style')
//                     style.textContent = `/* injected */\n${css}`
//                     style.setAttribute('data-injected', 'true')
//                     doc.head.appendChild(style)
//                 }
//
//                 const height = doc.body?.scrollHeight || doc.documentElement?.scrollHeight
//                 if (height && height > 0) {
//                     iframe.style.height = `${height + 50}px`
//                 }
//
//                 const savedName = getCookie('cusdis_username') || ''
//                 const savedEmail = getCookie('cusdis_email') || ''
//
//                 const syncInput = (
//                     selector: string,
//                     savedValue: string,
//                     cookieKey: string
//                 ) => {
//                     const inputs = doc.querySelectorAll<HTMLInputElement>(selector)
//                     inputs.forEach(input => {
//                         if (!input.dataset.listener) {
//                             input.dataset.listener = 'true'
//                             input.addEventListener('blur', () => {
//                                 setCookie(cookieKey, input.value)
//                             })
//                         }
//
//                         const isFocused = doc.activeElement === input
//                         if (!isFocused && input.value !== savedValue) {
//                             input.value = savedValue
//                             input.dispatchEvent(new Event('input', { bubbles: true }))
//                         }
//                     })
//                 }
//
//                 syncInput('input[name="nickname"]', savedName, 'cusdis_username')
//                 syncInput('input[name="email"]', savedEmail, 'cusdis_email')
//
//                 if (!loaded) setLoaded(true)
//             } catch (e) {
//                 // silently ignore
//             }
//         }, 500)
//
//         return () => clearInterval(interval)
//     }, [bgColor, host, loaded])
//
//     if (!pageUrl) return null
//
//     return (
//         <>
//             {!loaded && <div>Загружаем комментарии..</div>}
//             <div style={{ opacity: loaded ? '1' : '0' }}>
//                 <ReactCusdis
//                     attrs={{
//                         host,
//                         appId,
//                         pageId,
//                         pageTitle,
//                         pageUrl,
//                         theme: 'dark'
//                     }}
//                     lang="ru"
//                 />
//             </div>
//         </>
//     )
// }
//
// export default CusdisComments
