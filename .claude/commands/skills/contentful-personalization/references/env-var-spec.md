# NT Environment Variables

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_NINETAILED_API_KEY` | NT API key for the target data bucket | `abc123...` |
| `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` | NT environment — MUST be exactly `"main"` or `"development"` | `main` |

## Optional Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_NINETAILED_PREVIEW_API_KEY` | Enables the NT preview bar UI |
| `NEXT_PUBLIC_NINETAILED_URL` | Custom NT API URL (not needed unless self-hosted) |

## Data Bucket Mapping

| Contentful env | NT environment value | NT data bucket |
|---------------|---------------------|----------------|
| `master` | `"main"` | Main bucket |
| `bears` | `"development"` | Development bucket |
| Any demo env | `"development"` | Development bucket |

**CRITICAL:** The value must be exactly `"main"` or `"development"` — no other values are valid. Using the Contentful environment name directly (e.g., `"master"` or `"bears"`) will not work.

## Per-Environment .env.local

```bash
# .env.local for master env
NEXT_PUBLIC_NINETAILED_API_KEY=<Main bucket API key>
NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main
NEXT_PUBLIC_NINETAILED_PREVIEW_API_KEY=<Preview key for Main bucket>

# .env.local for a demo env (e.g., bears)
NEXT_PUBLIC_NINETAILED_API_KEY=<Development bucket API key>
NEXT_PUBLIC_NINETAILED_ENVIRONMENT=development
NEXT_PUBLIC_NINETAILED_PREVIEW_API_KEY=<Preview key for Development bucket>
```

## Finding Your Keys

In the Ninetailed app:
1. Go to Settings → API Keys
2. Main bucket key = for production/master content
3. Development bucket key = for all demo environments

The keys are different objects in NT — using the wrong one causes audiences to not resolve because the experience data is in a different bucket.
