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
* **Icons:** [Ionic Icons](https://ionic.io/ionicons) via `@ionic/core`
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
   ```

   | Variable | Description |
      |---|---|
   | `PUBLIC_STRAPI_API_URL` | Full URL to the Strapi API (with `/api`) |
   | `PUBLIC_STRAPI_DOMAIN` | Strapi domain used to resolve media URLs |

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:3000`.

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
│   ├── author/[nickname]/  # Author profile page
│   ├── not-found.tsx       # 404 page
│   └── error.tsx           # 500 page
├── components/             # Reusable UI components
│   ├── Reader/             # Manga and book reader (client-side)
│   ├── TitlePage/          # Title detail page layout
│   ├── SiteNavbar/         # Top navigation bar
│   ├── Footer/             # Site footer
│   └── ...
├── lib/
│   ├── strapiClient.ts     # All Strapi data-fetching functions
│   ├── cookies.ts          # Cookie read/write helpers
│   ├── NavigationLoader    # Route-change progress bar
│   └── SmoothScroll        # Anchor smooth-scroll handler
└── styles/
    └── markdown.css        # GitHub-style dark markdown theme
public/
├── bg.webm / bg-poster.jpg # Hero background video
├── error-bg.jpg            # Error page background image
├── redtail.svg             # Logo
├── noise.svg               # Grain texture overlay
├── fonts/                  # Inter, Mukta, Roboto
└── icons/                  # SVG icon set
```

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright © 2026 **foxgirls.org** . All rights reserved.