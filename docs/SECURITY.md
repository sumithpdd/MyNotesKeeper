# Security Guidelines

## Never Commit

- **`.env.local`** - Contains API keys and secrets
- **`serviceAccountKey.json`** - Firebase admin credentials
- **`migration.csv`** - May contain real customer data
- **`singleCustomer.json`** - May contain real contact info
- **`backups/`** - Database backups may contain sensitive data

## Configuration

- All API keys must come from environment variables
- Use `.env.example` as a template (no real values)
- Never log API keys, even partially
- Never hardcode project IDs, domains, or credentials

## Firebase

- Use Firestore security rules for access control
- Service account key is for scripts only (migration, backup)
- Keep service account key out of version control

## Best Practices

1. Copy `.env.example` to `.env.local` and add your values
2. Add `.env.local` to `.gitignore` (already configured)
3. Rotate keys if accidentally exposed
4. Use different Firebase projects for dev/staging/production
