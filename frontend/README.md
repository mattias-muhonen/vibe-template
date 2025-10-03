# Frontend (Next.js + TypeScript)

## Overview

This is the frontend application built with Next.js 14+ and TypeScript. It provides a modern, responsive web interface for the Multi-User Todo Application.

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript 5.8** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Server state management

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & API client
│   └── types/            # TypeScript types
├── public/               # Static assets
├── next.config.js
├── tailwind.config.ts
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Running in Dev Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Next Steps

Follow the execution strategy in `docs/EXECUTION_STRATEGY.md` to implement features:

1. Backend API first (see `../backend/`)
2. Backend tests
3. Frontend components and pages
4. Frontend integration

## Current Status

Currently contains a minimal stub that calls `/api/hello` from the backend to verify connectivity.

