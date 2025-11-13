# bbass.co

Personal portfolio website for Bob Bass, built with Next.js 16 and deployed as a static site.

## Tech Stack

- **Next.js 16.0.2** - App Router with static site generation
- **React 19.2.0** - Latest React with modern features
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 3.4.18** - Utility-first styling
- **pnpm 9.15.2** - Fast, efficient package management

## Prerequisites

- Node.js 22 or higher
- pnpm 9 or higher

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (static export)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Features

- Static site generation for fast loading
- Responsive design with mobile-first approach
- Interactive cursor effect with radial gradient
- Icon-based navigation
- shields.io badge integration for tech stack
- Smooth animations and transitions

## Project Structure

```
app/
├── page.tsx          # Home page
├── tech/             # Tech stack page
├── work/             # Work experience page
├── contact/          # Contact page
├── layout.tsx        # Root layout
└── globals.css       # Global styles

components/
├── Cursor.tsx        # Mouse-following gradient effect
└── Navigation.tsx    # Main navigation bar
```

## Deployment

This site uses static export and can be deployed to any static hosting service:

```bash
pnpm build
```

The output will be in the `out/` directory.

## Code Quality

- ESLint 9 with flat config format
- Prettier with 80-character line width, single quotes, no semicolons
- TypeScript strict mode enabled

## License

© 2025 Bob Bass. All rights reserved.
