This is a starter repo for getting more familiar with AI assisted coding. The goal is to provide tools for agentic development. This is just one way to organize things but follows current "best practices" lik Kiro, spec-kit and plain old common sense.

Get started:
1. check out the contents in docs/
2. start by reading HUMAN_INSTRUCTION.md
3. Check out CONTEXT.md for a "1-minute introduction" into the project
4. Check out agents/, there are some helpers, take special note of cleanup-prompt.md contents
5. Check out specs/, there is one "spec" document there that describes an authentication feature.

Get coding:
1. You should have a PRD as to what the product should be. Example provide in TODO_PRD.md
2. Goal is to build a UI level mock MVP
3. Use the agent personalities or draft your own
4. Create new spec files based on the template, tweak the template and play around
5. Keep CONTEXT.md up to date

Note that the repo has a CLAUDE.md file but that only points to an AI agnostic CONTEXT.md file.

---

# Vibe Template

A modern React + TypeScript template with a comprehensive design system built on Radix UI and Tailwind CSS.

## Features

- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS v4** for utility-first styling
- **Radix UI** for accessible, unstyled components
- **Atomic Design System** with atoms, molecules, organisms structure
- **i18n** internationalization support
- **ESLint & Prettier** for code quality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view in browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── atoms/          # Basic UI components (Button, Input, etc.)
│   ├── molecules/      # Composite components (Card, FormField)
│   ├── organisms/      # Complex components (Form, Header)
│   ├── pages/          # Page components
│   └── templates/      # Layout templates
├── App.tsx             # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Component Library

The template includes a comprehensive set of UI components:

### Atoms
- Avatar, Badge, Button, Checkbox, Input, Label
- RadioGroup, Select, Separator, Slider, Switch
- Tabs, Text, Toggle, Tooltip

### Molecules
- Card, FormField

### Organisms
- Form, Header

## Design System

View the complete design system at `/` route when running the development server. This showcases all available components with their variants and states.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility CSS
- **Radix UI** - Headless UI components
- **i18next** - Internationalization
- **ESLint/Prettier** - Code formatting

## License

Private