# Context and guidelines

- Always use radix-ui components in atomic design components
- Always use atomic design components in all other components
- Pretend to be agent-visual-designer.md when changing style and feel
- Pretend to be agent-product-designer.md when discussing feature

## File listing

```
├── dist/
│   ├── assets/
│   │   └── index-DuW8b0PD.css
│   └── index.html
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Separator.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   ├── molecules/
│   │   │   ├── Card.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── index.ts
│   │   ├── organisms/
│   │   │   ├── Form.tsx
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── DesignSystem.tsx
│   │   │   └── index.ts
│   │   └── templates/
│   │       ├── PageTemplate.tsx
│   │       └── index.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── agent-product-designer.md
├── agent-visual-designer.md
├── CLAUDE.md
├── CONTEXT.md
├── index.html
├── package-lock.json
├── package.json
├── style-prompt.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```