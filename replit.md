# .md

## Overview

This is a full-stack TypeScript web application for trip planning. It features a React frontend with a component library, an Express backend with REST APIs, and PostgreSQL database storage using Drizzle ORM. The application allows users to create trips, add stops and activities, manage budgets, and share trips with other users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives + custom styling)
- **Animations**: Framer Motion
- **Build Tool**: Vite with HMR support

The frontend lives in `client/` with path aliases:
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)

The server uses a storage abstraction pattern (`server/storage.ts`) that wraps database operations, making it easy to swap implementations.

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod schemas for validation
- `routes.ts`: API route definitions with input/output type contracts

### Database Schema
Core entities:
- **users**: Basic user profiles
- **trips**: User-created trips with dates and visibility settings
- **sharedTrips**: Many-to-many relationship for trip sharing with roles (viewer/editor)
- **stops**: Ordered locations within a trip
- **activities**: Things to do at each stop with duration and cost
- **budgets**: Financial tracking per trip

### Build System
- **Development**: `tsx` for running TypeScript directly
- **Production Build**: Custom build script using esbuild for server and Vite for client
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary data store
- **Connection**: Via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with `drizzle-kit` for schema management

### Third-Party Libraries
- **UI**: Radix UI primitives, Lucide icons, Embla Carousel
- **Forms**: React Hook Form with Zod resolver
- **Dates**: date-fns
- **Charts**: Recharts

### Replit-Specific Integrations
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development environment indicator

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required for app to start)
