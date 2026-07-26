# RedTail site frontend
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The official website for the RedTail translation team.**

This repository contains the source code for the RedTail reader frontend — a site for browsing and reading manga, light novel, and book translations produced by the team.

The CMS backend powering the content is maintained in a separate repository: [foxgirlsorg/redtail-backend](https://github.com/foxgirlsorg/redtail-backend).

## 🛠️ Technical Overview

* **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** CSS Modules
* **CMS Client:** [@strapi/client](https://www.npmjs.com/package/@strapi/client)
* **Markdown:** [react-markdown](https://github.com/remarkjs/react-markdown) + rehype-raw
* **Icons:** [Ionic Icons](https://ionic.io/ionicons) via custom SVG loader
* **Image Lightbox:** [react-photo-view](https://github.com/MinJieLiu/react-photo-view)

## 🚀 Local Development

### Prerequisites

* Node.js v20+
* A running instance of the [RedTail backend](https://github.com/foxgirlsorg/redtail-backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/foxgirlsorg/redtail.git
   cd redtail
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file at the project root:
   ```env
   PUBLIC_STRAPI_API_URL=http://localhost:1337/api
   PUBLIC_STRAPI_DOMAIN=http://localhost:1337
   NEXT_PUBLIC_STRAPI_DOMAIN=http://localhost:1337
   ```

   | Variable | Required | Description |
      |---|---|---|
   | `PUBLIC_STRAPI_API_URL` | Yes | Full URL to the Strapi API (with `/api`) — used server-side |
   | `NEXT_PUBLIC_STRAPI_DOMAIN` | Yes | Strapi domain exposed to the browser (auth, comments, image URLs) |
   | `TELEGRAM_CHANNEL` | No | Telegram channel handle used for Instant View meta tags |

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:3000`.

## 📊 Analytics

Analytics are handled via [Umami](https://umami.is/) using
[next-umami](https://github.com/kdcokenny/next-umami). They are entirely
optional — if `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is not set, no analytics script
is loaded.

Traffic is proxied through the Next.js server (`/stats/*`) to avoid
adblockers and avoid exposing the Umami server URL to the client.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | No | Website ID from the Umami dashboard. Analytics are disabled if unset. |
| `NEXT_PUBLIC_UMAMI_SERVER_URL` | No | URL of your Umami instance. Defaults to Umami Cloud. |
| `NEXT_PUBLIC_UMAMI_DOMAINS` | No | Comma-separated list of domains to track. Tracks all if unset. |

## 📦 Building & Deployment

```bash
npm run build
npm run start
```

## 📂 Project Structure

```text
src/
├── app/                        # Next.js App Router pages & layouts
│   ├── page.tsx                # Home — title grid, articles, team
│   ├── manga/[slug]/           # Manga title page + reader
│   ├── book/[slug]/            # Book/novel title page + reader
│   ├── article/[slug]/         # Article page (Markdown)
│   ├── article-iv/[slug]/      # Telegram Instant View page (TelegramBot only)
│   ├── author/[nickname]/      # Author profile page
│   ├── auth/                   # Login, register, profile, password-reset pages
│   ├── adm/                    # Hidden admin tools ("Как ты вообще сюда попал?")
│   │   ├── page.tsx            # Adm index — links to sub-tools
│   │   ├── teamcard/           # Overengineered team card generator (see below)
│   │   └── branding/           # Brand assets viewer (pattern, logo, intro)
│   ├── not-found.tsx           # 404 page
│   └── error.tsx               # 500 page
├── components/                 # Reusable UI components
│   ├── Auth/                   # Auth modal, forms, profile view, avatar cropper
│   ├── Comments/               # Comment section with threading and Markdown support
│   ├── Reader/                 # Manga and book reader (client-side)
│   ├── TextEditor/             # Markdown editor used in comments and text blocks
│   ├── TitlePage/              # Title detail page layout
│   ├── SiteNavbar/             # Top navigation bar
│   ├── Footer/                 # Site footer
│   └── ...
├── lib/
│   ├── strapiClient.ts         # All Strapi data-fetching functions (server-side)
│   ├── authContext.tsx         # Auth state, login/register/profile/password logic
│   ├── commentsApi.ts          # Comments CRUD against Strapi Comments plugin
│   ├── cookies.ts              # Cookie read/write helpers (reader progress)
│   ├── NavigationLoader        # Route-change progress bar
│   └── SmoothScroll            # Anchor smooth-scroll handler
├── proxy.ts                    # Routes TelegramBot UA to /article-iv via rewrite
└── styles/
    └── markdown.css            # GitHub-style dark markdown theme
public/
├── bg.webm / bg-poster.jpg     # Hero background video
├── error-bg.jpg                # Error page background image
├── redtail.svg                 # Logo
├── noise.svg                   # Grain texture overlay
├── fonts/                      # Inter, Mukta, Roboto
└── icons/                      # SVG icon set. Mostly ionicons with a bit of lucide icons and some custom ones.
```

## 🃏 Team Card Generator

Located at `/adm/teamcard`. An overengineered tool for generating team member cards as PNG/JPG images.

**What it does:** renders a styled card showing the RedTail team — member avatars, nicknames, roles. That's it. A screenshot tool with extra steps.

**What it actually has:**

- Toggle individual team members on/off
- Override any member's role with a custom string
- Add "local" custom members with a URL or uploaded/cropped avatar image
- Insert markdown text blocks above or below the team grid (with title, subtitle, full markdown+HTML support via `TextEditor`)
- Hide the entire team section, leaving only text blocks (for those times you need a card with just text but still want the same export pipeline)
- Scale-to-fit preview in a resizable wrapper
- Fullscreen mode
- Export to PNG or JPG at configurable width (400–6000px) using `modern-screenshot`, with a transform-stripping trick to avoid mobile clipping
- JSON config export/import — saves all state (toggles, overrides, custom members with base64 avatars, text blocks) to a named `.json` file and restores it
- Scroll shadow indicators on every scrollable panel
- Disabled switch states, auto-re-enable logic, status flash timeouts

All of this lives in a single 971-line client component with a custom `useScrollShadow` hook, a `TextBlockGroup` helper, a `cx()` utility, a cropper integration, and enough state to make you question why this isn't a backend service. It's a team card generator. It generates team cards.

## 🔐 Authentication & Password Changes

Strapi's `/api/auth/change-password` endpoint does not reliably verify the
current password across all versions and configurations. Password changes
therefore use a two-step approach:

1. A login attempt is made against `/api/auth/local` with the user's current
   email and the supplied current password. If Strapi rejects it, the request
   is aborted immediately with an "incorrect current password" error.
2. Only after a successful login does the code apply the new password via
   `PUT /api/users/:id`.

Profile field updates (username, email, avatar) are a separate `PUT` request
and are unaffected by the password flow.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright © 2026 **foxgirls.org** . All rights reserved.