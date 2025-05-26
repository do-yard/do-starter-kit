# 📂 Project Structure

This guide provides a clear map of the codebase to help you quickly navigate and understand the SaaS Starter Kit structure.

## Project Overview

```
do-starter-kit/
├── application/             # Main application code
├── docs/                    # Documentation guides
└── .do/                     # DigitalOcean deployment configuration
```

## Core Application Structure

```
application/
├── prisma/                  # Database schema and ORM configuration
│   ├── schema.prisma        # Database model definitions
│   └── migrations/          # Database migration files
├── src/                     # Source code
│   ├── app/                 # Next.js App Router (pages, layouts, routes)
│   ├── components/          # Reusable UI components
│   ├── context/             # State management with React Context
│   ├── lib/                 # Core libraries (auth, database)
│   └── services/            # External service integrations
├── docker-compose.yaml      # Local development containers
└── env-example              # Environment variables template
```

## Key Directories Explained

### Routing (`src/app/`)

The app directory uses Next.js App Router, organizing routes as nested folders:

```
app/
├── favicon.ico              # Site favicon
├── globals.css              # Global CSS styles
├── layout.tsx               # Root layout (applies to all routes)
├── (protected)/             # Routes requiring authentication
│   └── dashboard/           # Authenticated dashboard area
│       ├── layout.tsx       # Dashboard layout
│       ├── page.tsx         # Dashboard index page
│       ├── account/         # User account settings
│       └── my-notes/        # User's notes list page
│       └── notes/           # Notes CRUD routes
│           ├── [id]/        # Note details and edit
│           │   └── edit/    # Note edit page
│           └── new/         # Create note page
├── (public)/                # Publicly accessible routes
│   ├── layout.tsx           # Public layout
│   ├── page.tsx             # Homepage
│   ├── login/               # Login page
│   └── signup/              # Signup page
└── api/                     # API routes (serverless functions)
    ├── auth/                # Authentication endpoints
    ├── health/              # Health check endpoint
    ├── profile/             # User profile endpoints
    └── notes/               # Notes API endpoints
        └── [id]/            # Single note API endpoints
```

> In the notes section, both on pages and API, you can add your own functionality

### Components (`src/components/`)

Organized by feature area:

```
components/
├── common/                  # Shared utility components
├── dashboard/               # Dashboard-specific components
├── Footer/                  # Site footer
├── NavBar/                  # Navigation bar
├── notes/                   # Note-related components (create, edit, details)
├── public-view/             # Components for public pages
└── Theme/                   # Theming components
```

### Services (`src/services/`)

Implementation of core services:

```
services/
├── database/                # Database connection and queries
└── storage/                 # File storage
```

### Database (`prisma`)

Prisma ORM configuration:

```
prisma/
├── schema.prisma            # Database schema definition
└── migrations/              # Database migrations
```

## Test Files

Testing files are co-located with the code they test, with `.test.tsx` or `.test.ts` extensions.

## Configuration Files

- `eslint.config.mjs` - ESLint configuration
- `jest.config.ts` - Jest configuration for UI tests
- `jest.server.config.ts` - Jest configuration for API tests
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration

This structure follows modern best practices for React and Next.js applications, promoting modularity, testability, and clear separation of concerns.
