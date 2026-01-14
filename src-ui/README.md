# RecallDesk Frontend

React + TypeScript frontend for the RecallDesk desktop application.

## Structure

```
src-ui/src/
├── pages/
│   ├── Onboarding.tsx      # Gmail + folders setup
│   ├── Search.tsx          # Main search interface
│   └── Settings.tsx        # Settings & privacy controls
├── components/
│   ├── SearchBox.tsx       # Search input
│   ├── ResultsList.tsx     # Results list
│   ├── ResultItem.tsx      # Single result
│   ├── Filters.tsx         # Filters panel
│   └── index.ts
├── hooks/
│   ├── useSearch.ts        # Search logic
│   ├── useIndexing.ts      # Sync progress
│   └── useGmailConnection.ts
├── services/
│   ├── api.ts              # Tauri API wrapper
│   └── logger.ts           # Client logging
├── store/
│   ├── searchStore.ts      # Search state
│   ├── indexingStore.ts    # Indexing state
│   └── settingsStore.ts    # Settings state
├── types/
│   ├── search.ts           # Search types
│   ├── index.ts            # Indexing types
│   └── settings.ts         # Settings types
├── App.tsx                 # Root component
├── main.tsx                # React entry point
└── index.css               # Global styles
```

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (with Tauri backend)
npm run dev

# Build for production
npm run build

# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

## Architecture

- **Pages**: Full page components (Onboarding, Search, Settings)
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for business logic
- **Store**: Zustand for state management
- **Services**: API layer (Tauri command wrappers)
- **Types**: TypeScript type definitions

## Design Principles

1. **Functional Components**: Only use functional components with hooks
2. **Custom Hooks**: Extract stateful logic into custom hooks
3. **Type Safety**: Explicit TypeScript types everywhere
4. **Small Components**: Keep components <200 lines
5. **No Business Logic**: UI layer is thin, business logic in backend

## Development

### Creating a New Component

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

/**
 * MyComponent does something useful
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Click me</button>
    </div>
  );
};
```

### Creating a Custom Hook

```typescript
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export const useMyFeature = (query: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await invoke('my_feature_command', { query });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 150); // Debounce
    return () => clearTimeout(timer);
  }, [query]);

  return { data, loading, error };
};
```

### Using Tauri API

```typescript
// src/services/api.ts
import { invoke } from '@tauri-apps/api/tauri';

export const api = {
  async search(query: string, filters?: any) {
    return await invoke('search_command', { query, filters });
  },

  async connectGmail() {
    return await invoke('connect_gmail_command');
  },

  async syncGmail() {
    return await invoke('sync_gmail_command');
  },
};
```

## State Management

Using Zustand for simple, decentralized state management:

```typescript
// src/store/searchStore.ts
import { create } from 'zustand';

interface SearchState {
  query: string;
  results: any[];
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}));
```

## Styling

- Use CSS modules for component-specific styles
- Global styles in `index.css`
- Follow mobile-first responsive design
- Support light/dark mode (optional)

## Performance

- Debounce search input (150ms)
- Lazy load result snippets (async)
- Memoize expensive components
- Use React DevTools to check render counts

## Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import { SearchBox } from './SearchBox';

test('SearchBox accepts input', () => {
  render(<SearchBox />);
  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
});
```

## Building

```bash
# Build optimized production bundle
npm run build

# Outputs to: dist/

# Test production build
npm run preview
```

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
```

### Port already in use

Change Vite port in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
});
```

### TypeScript errors

```bash
npm run type-check
```

## See Also

- [Architecture Guide](../docs/architecture.md#presentation-layer)
- [Development Setup](../docs/dev-setup.md)