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
├── app/                    # Next.js App Router pages & layouts
│   ├── page.tsx            # Home — title grid, articles, team
│   ├── manga/[slug]/       # Manga title page + reader
│   ├── book/[slug]/        # Book/novel title page + reader
│   ├── article/[slug]/     # Article page (Markdown)
│   ├── article-iv/[slug]/  # Telegram Instant View page (TelegramBot only)
│   ├── author/[nickname]/  # Author profile page
│   ├── auth/               # Login, register, profile, password-reset pages
│   ├── not-found.tsx       # 404 page
│   └── error.tsx           # 500 page
├── components/             # Reusable UI components
│   ├── Auth/               # Auth modal, forms, profile view
│   ├── Comments/           # Comment section with threading and Markdown support
│   ├── Reader/             # Manga and book reader (client-side)
│   ├── TextEditor/         # Markdown editor used in comments
│   ├── TitlePage/          # Title detail page layout
│   ├── SiteNavbar/         # Top navigation bar
│   ├── Footer/             # Site footer
│   └── ...
├── lib/
│   ├── strapiClient.ts     # All Strapi data-fetching functions (server-side)
│   ├── authContext.tsx     # Auth state, login/register/profile/password logic
│   ├── commentsApi.ts      # Comments CRUD against Strapi Comments plugin
│   ├── cookies.ts          # Cookie read/write helpers (reader progress)
│   ├── NavigationLoader    # Route-change progress bar
│   └── SmoothScroll        # Anchor smooth-scroll handler
└── styles/
    └── markdown.css        # GitHub-style dark markdown theme
middleware.ts               # Routes TelegramBot to /article-iv
public/
├── bg.webm / bg-poster.jpg # Hero background video
├── error-bg.jpg            # Error page background image
├── redtail.svg             # Logo
├── noise.svg               # Grain texture overlay
├── fonts/                  # Inter, Mukta, Roboto
└── icons/                  # SVG icon set
```

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