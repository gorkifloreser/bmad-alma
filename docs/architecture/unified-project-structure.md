# Unified Project Structure

```
alma-app-monorepo/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # Nest.js Backend
├── packages/
│   ├── ui/           # Shared MUI Components
│   ├── types/        # Shared TypeScript Interfaces
│   └── config/       # Shared Configurations
├── terraform/        # Terraform IaC files
├── .github/
│   └── workflows/    # GitHub Actions CI/CD
└── package.json      # Root package for Turborepo
```
