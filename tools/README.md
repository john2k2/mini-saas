# Tools Directory

This directory contains development tools and CLI utilities for the project.

## Contents

### stripe-cli/
Contains the Stripe CLI executable for local development and webhook testing.

**Usage:**
```bash
# Listen to webhooks during development
./tools/stripe-cli/stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook endpoint
./tools/stripe-cli/stripe.exe trigger payment_intent.succeeded
```

**Installation:**
If you need to update or install Stripe CLI separately:
1. Download from: https://github.com/stripe/stripe-cli/releases
2. Place the executable in this directory
3. Update your PATH or use the full path as shown above

**Note:** The included Stripe CLI is for Windows. For other platforms, download the appropriate version from the official Stripe CLI releases.
