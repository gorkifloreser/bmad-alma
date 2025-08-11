# Unified Project Structure

```
alma-app-monorepo/
├── apps/
│   └── web/            # Next.js Frontend
├── supabase/
│   └── functions/      # Supabase Edge Functions
├── packages/
│   ├── ui/             # Shared MUI Components
│   ├── types/          # Shared TypeScript Interfaces
│   └── config/         # Shared Configurations
├── .github/
│   └── workflows/      # GitHub Actions CI/CD
└── package.json        # Root package for Turborepo
```
