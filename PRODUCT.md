# PRODUCT.md — propsto Philosophy

## Core Principle

**Users own their feedback.**

Feedback received by a user belongs to them permanently, regardless of organizational affiliation. This is the fundamental value proposition of propsto.

## Architecture Implications

```
┌─────────────────────────────────────────────────────┐
│  PERSONAL ACCOUNT (permanent)                       │
│  - All feedback received lives here                 │
│  - Survives leaving any company                     │
│  - User controls what's public on their profile     │
│  - Linked to personal email (escape hatch)          │
├─────────────────────────────────────────────────────┤
│  ORG MEMBERSHIP (temporary/contextual)              │
│  - Access to org templates, managed links, groups   │
│  - Leave org → lose links, keep ALL feedback        │
│  - Org admins can set defaults, not own user data   │
└─────────────────────────────────────────────────────┘
```

## What Users Keep Forever

- All feedback received (regardless of source)
- Personal profile and username
- Personal feedback links they created
- Control over what feedback is publicly visible

## What Users Lose When Leaving an Org

- Access to org's managed templates
- Access to org's managed feedback links
- Group memberships within that org
- Org-scoped username (if different from personal)

## Profile Page Philosophy

Users curate their public profile:
- Choose which feedback links to display
- Select specific feedback to showcase as testimonials
- Demonstrate growth, achievements, or skills
- Build portable professional reputation

## Target MVP: Google Workspace Organizations

**Admin flow:**
1. Signs in with Google Workspace (must be admin)
2. Creates/configures organization
3. Creates managed feedback templates (company values, priorities)
4. Creates managed feedback links for employees
5. Sets up groups reflecting company structure (teams, clients, projects)

**Employee flow:**
1. Signs in with same Google Workspace domain
2. Auto-joins existing organization
3. Links personal email (ensures data portability)
4. Uses org's managed templates/links
5. Shares feedback links after quarters/milestones

**Groups:**
- Represent teams, clients, projects
- Support subgroups (Client → Project A, Project B)
- Employees can belong to multiple groups
- Group pages list members → leave feedback for any/all
- Client-facing views show who's working for them

## The Problem We Solve

- Feedback arrives too late to be actionable
- Giving feedback feels emotionally heavy
- Context is lost by the time feedback arrives
- Feedback is trapped in company systems users can't take with them

## The Solution

A personal feedback link you control — designed for moments that require clarity, not constant feedback. Your feedback history travels with you.
