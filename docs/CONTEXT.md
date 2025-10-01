# Context and guidelines
- Ignore docs/HUMAN_INSTRUCTION.md
- Always read and pretend you are docs/agents/agent-fullstack.md
- Always use radix-ui components in atomic design components
- Always favor atomic design components instead of writing new ones

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript 5.8** - Type-safe development
- **Vite 7** - Lightning-fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **i18next** - Internationalization framework
- **ESLint & Prettier** - Code quality and formatting
- **PostCSS & Autoprefixer** - CSS processing

## File listing

```
├── docs/
│   ├── agents/
│   │   ├── agent-fullstack.md
│   │   ├── agent-product-designer.md
│   │   ├── agent-visual-designer.md
│   │   └── cleanup-prompt.md
│   ├── specs/
│   │   └── authentication.md
│   ├── CONTEXT.md
│   └── HUMAN_INSTRUCTION.md
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── atoms/          # Basic UI primitives (Button, Input, etc.)
│   │   ├── molecules/      # Composite components (Card, FormField)
│   │   ├── organisms/      # Complex components (Form, Header)
│   │   ├── pages/          # Page components
│   │   └── templates/      # Layout templates
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── .prettierrc
├── CLAUDE.md
├── README.md
├── TODO_PRD.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```