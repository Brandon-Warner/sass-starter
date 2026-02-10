# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a B2B SaaS starter application built with Next.js and Auth0. It provides multi-tenant organization management with Auth0 Organizations, user management, RBAC, SSO configuration, MFA policies, and domain verification.

## Common Commands

```bash
# Development
npm run dev                # Start development server on http://localhost:3000
npm run build             # Build for production
npm start                 # Start production server
npm run lint              # Run ESLint
npm run format            # Format code with Prettier

# Auth0 Setup (run once on new tenant)
npm run auth0:bootstrap   # Bootstrap Auth0 tenant with required configuration
```

## Environment Configuration

The application requires a `.env` file (created by `npm run auth0:bootstrap`). Key environment variables:

- `APP_BASE_URL` - Application base URL (default: http://localhost:3000)
- `NEXT_PUBLIC_AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` - Application client for org context
- `AUTH0_MANAGEMENT_CLIENT_ID` / `AUTH0_MANAGEMENT_CLIENT_SECRET` - Management client for org operations
- `AUTH0_ADMIN_ROLE_ID` / `AUTH0_MEMBER_ROLE_ID` - Organization role IDs
- `SESSION_ENCRYPTION_SECRET` - Session encryption key
- `CUSTOM_CLAIMS_NAMESPACE` - Namespace for custom claims in tokens
- `DEFAULT_CONNECTION_ID` - Default Auth0 connection for user signup

## Architecture

### Dual Auth0 Client Pattern

The application uses **two separate Auth0 clients** for different contexts:

1. **App Client** (`appClient` in `lib/auth0.ts`):
   - Used for authenticated dashboard access within an organization context
   - Handles standard user authentication with organization awareness
   - Routes: `/dashboard/*`, `/auth/login`, `/auth/logout`

2. **Onboarding Client** (`onboardingClient` in `lib/auth0.ts`):
   - Used for signup and organization creation flow
   - Has special `screen_hint: "signup"` parameter
   - Routes: `/onboarding/signup`, `/onboarding/callback`, `/onboarding/create`

The `middleware.ts` routes requests to the appropriate client based on URL path (`/onboarding` vs everything else).

### Organization-Based Multi-Tenancy

- Users belong to one or more Auth0 Organizations (multi-tenant architecture)
- Organization ID is stored in session as `org_id` after login
- All authenticated dashboard operations are scoped to the current organization
- Users without organizations are redirected to `/onboarding/create`
- Organization switching is handled via `OrganizationSwitcher` component

### Role-Based Access Control (RBAC)

- Two roles: `admin` and `member` (IDs stored in environment variables)
- Roles are assigned at the organization level (not global)
- Role claims are added to tokens via `add-role-to-tokens.js` Auth0 Action
- New users get `member` role automatically via `add-default-role.js` Action
- Server actions can be protected with `withServerActionAuth()` wrapper (see `lib/with-server-action-auth.ts`)
- Role is retrieved from custom claims namespace: `${CUSTOM_CLAIMS_NAMESPACE}/roles`

### Server Actions Pattern

Server actions in `app/**/actions.ts` files use the `withServerActionAuth()` higher-order function:

```typescript
export const myAction = withServerActionAuth(
  async (formData: FormData, session: SessionData) => {
    // Action implementation
  },
  { role: "admin" } // Optional: restrict to specific role
)
```

This pattern:
- Automatically validates authentication
- Optionally enforces role requirements
- Provides session data as last parameter
- Returns error objects for auth failures

### Auth0 Actions (Serverless Functions)

Three Auth0 Actions in the `actions/` directory are deployed to the tenant during bootstrap:

1. **add-default-role.js**: Assigns member role to new users in organizations
2. **add-role-to-tokens.js**: Injects role claims into access/ID tokens
3. **security-policies.js**: Enforces organization-level MFA policies

These run in Auth0's environment during login flows, not in the Next.js application.

### Key Application Routes

- `/` - Landing page (public)
- `/onboarding/signup` - User signup with organization creation
- `/onboarding/create` - Create new organization for existing user
- `/dashboard` - Main dashboard (org home)
- `/dashboard/organization/general` - Organization settings
- `/dashboard/organization/members` - User management (invite, delete, role assignment)
- `/dashboard/organization/sso` - SSO connection management (SAML/OIDC)
- `/dashboard/organization/security-policies` - MFA policy configuration
- `/dashboard/account/*` - User profile, password, MFA management

### Management API Client

The `managementClient` (from `lib/auth0.ts`) is used for:
- Creating/updating organizations
- Managing organization members and roles
- Configuring SSO connections
- Inviting users
- Reading user organizations

This client uses the Management API credentials and should only be used in server-side code (API routes, server actions, server components).

### Domain Verification

The application supports domain verification for SSO connections:
- Users can claim email domains for their organization
- Verification uses DNS TXT records with identifier `saastart-domain-verification` (see `lib/constants.ts`)
- Once verified, enables home realm discovery for that domain
- Implementation in `lib/domain-verification.ts`

## Code Style

- TypeScript with strict mode enabled
- Tailwind CSS for styling with shadcn/ui components
- Path alias: `@/*` maps to project root
- Component library: Radix UI primitives with custom styling
- Use `app/` directory router (Next.js App Router)
- Server components by default; use `"use client"` only when needed

## Important Notes

- Always use server actions for mutations (not API routes) unless external access required
- Session data includes `user.org_id` for the current organization context
- The bootstrap script (`scripts/bootstrap.mjs`) is destructive - only run on fresh Auth0 tenants
- MFA policies are stored in organization metadata as JSON (`metadata.mfaPolicy`)
- The application uses Next.js 16+ with React 19+
