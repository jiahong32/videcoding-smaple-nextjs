# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
npm run dev
```
Starts the Next.js development server on http://localhost:3000 with hot reload enabled.

### Building
```bash
npm run build
```
Creates an optimized production build. Always run this before deployment to catch TypeScript and build errors.

### Production Server
```bash
npm start
```
Runs the production server (requires `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint with Next.js configuration. This project uses ESLint v9 with Next.js Web Vitals and TypeScript rules.

## Architecture Overview

### Tech Stack
- **Next.js 16** with App Router architecture
- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS v4** - Using PostCSS plugin (@tailwindcss/postcss)
- **shadcn/ui** - Component library built on Radix UI with "new-york" style variant

### Key Architectural Decisions

**Next.js App Router**
- This project uses App Router (not Pages Router)
- All routes are in the `app/` directory
- Server Components by default (RSC enabled)
- File-based routing with layout.tsx and page.tsx conventions

**Tailwind CSS v4 Configuration**
- Uses PostCSS plugin instead of traditional tailwind.config.js
- Configuration is in `postcss.config.mjs`
- CSS variables defined in `app/globals.css` using `@theme inline` directive
- Theme system supports both light and dark modes via CSS variables
- Base color scheme: zinc

**shadcn/ui Integration**
- Components are manually copied into `components/ui/`
- No CLI installation - components are added as files
- Configuration in `components.json` specifies:
  - Style variant: "new-york"
  - RSC (React Server Components): enabled
  - CSS variables: enabled (prefix: none)

**Path Aliases**
TypeScript and shadcn/ui are configured with these import aliases:
- `@/components` → components/
- `@/lib` → lib/
- `@/hooks` → hooks/
- `@/ui` → components/ui/

All source files use `@/*` pattern pointing to root directory.

### Component Architecture

**Utility Functions**
- `lib/utils.ts` exports the `cn()` function
- `cn()` combines clsx and tailwind-merge for conditional className handling
- Use this for all dynamic Tailwind class combinations to avoid style conflicts

**shadcn/ui Components**
- Currently includes: Button component
- Components use class-variance-authority for variant styling
- Components are built with Radix UI primitives (@radix-ui/react-slot)
- Icon library: lucide-react

### Styling System

**CSS Variables Pattern**
The theme is defined using HSL color values in CSS variables:
- All theme colors are in `app/globals.css`
- Variables use HSL format: `--primary: 0 0% 9%`
- Converted to full HSL colors via `@theme inline` directive
- Both light and dark themes defined

**Dark Mode**
Dark mode is handled via the `.dark` class selector with matching CSS variables.

## Development Patterns

### Adding New Routes
Create new routes in the `app/` directory following Next.js App Router conventions:
- `app/route-name/page.tsx` for new pages
- `app/route-name/layout.tsx` for route-specific layouts
- Server Components by default; add `'use client'` directive only when needed

### Adding shadcn/ui Components
Components must be manually created in `components/ui/`:
1. Create the component file in `components/ui/`
2. Copy the source from ui.shadcn.com
3. Ensure it imports `cn` from `@/lib/utils`
4. Import and use: `import { ComponentName } from "@/components/ui/component-name"`

### Type Safety
- TypeScript strict mode is enabled
- Target: ES2017
- Module resolution: bundler (Next.js specific)
- JSX pragma: react-jsx (automatic runtime)
- All `.ts` and `.tsx` files are included except node_modules

## Project Requirements

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- Package manager: Uses npm (package-lock.json present, ignore pnpm-lock.yaml)

## Build Output
- Development build: `.next/` directory (gitignored)
- Production build: `.next/` directory
- Static assets: `public/` directory

## Active Technologies
- TypeScript 5 with Next.js 16, React 19.2.0 + Next.js (App Router), Tailwind CSS v4, shadcn/ui, Radix UI (001-breakfast-delivery-app)

## Recent Changes
- 001-breakfast-delivery-app: Added TypeScript 5 with Next.js 16, React 19.2.0 + Next.js (App Router), Tailwind CSS v4, shadcn/ui, Radix UI
