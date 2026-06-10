# Tech Icons

This directory contains organized tech framework and service icons using `react-icons`.

## Usage

```tsx
import { TechIcons, NextJSIcon, VercelIcon } from "@/components/icons/tech-icons";

// Using the TechIcons object
<TechIcons.NextJS className="w-6 h-6 text-foreground" />
<TechIcons.Vercel className="w-8 h-8 text-primary" />

// Using individual exports
<NextJSIcon className="w-6 h-6" />
<VercelIcon className="w-6 h-6" />
```

## Available Icons

### Frontend Frameworks

- `NextJS` - Next.js
- `React` - React
- `TypeScript` - TypeScript
- `TailwindCSS` - Tailwind CSS

### Backend & Database

- `NodeJS` - Node.js
- `PostgreSQL` - PostgreSQL
- `MongoDB` - MongoDB
- `Redis` - Redis
- `Prisma` - Prisma ORM
- `Supabase` - Supabase

### Cloud & Hosting

- `Vercel` - Vercel
- `AWS` - Amazon Web Services
- `GoogleCloud` - Google Cloud Platform
- `Netlify` - Netlify
- `Railway` - Railway
- `Cloudflare` - Cloudflare

### DevOps & Tools

- `Docker` - Docker
- `Kubernetes` - Kubernetes
- `GitHub` - GitHub
- `GitLab` - GitLab

### Services

- `Stripe` - Stripe Payments
- `Auth0` - Auth0 Authentication
- `Firebase` - Firebase
- `PlanetScale` - PlanetScale
- `Figma` - Figma Design

## Styling

All icons accept standard React props and can be styled with:

- `className` for Tailwind classes
- `size` prop for consistent sizing
- `color` prop for color overrides

```tsx
<TechIcons.NextJS className="w-12 h-12 text-primary hover:text-primary/80 transition-colors" />
```
