---
name: Feature
about: Implement new user-facing functionality
title: ""
labels: type:feature
assignees: ""
---

**As a** [user role]  
**I want** [action/feature]  
**So that** [benefit/value]  

### Acceptance Criteria
- [ ] Criteria 1 (e.g.: "Google Workspace domains are validated during signup")
- [ ] Criteria 2 (e.g.: "Error messages guide users to correct input")
- [ ] Criteria 3 (e.g.: "Session persists across page refreshes")

### Technical Requirements
- [ ] API endpoints: 
  - `POST /api/auth/google`
  - `GET /api/user/me`
- [ ] Database changes:
  - New `organization` table schema
- [ ] Security considerations:
  - OAuth2 token validation

### Definition of Done
- [ ] All AC verified in staging
- [ ] Code reviewed (+2 approvals)
- [ ] E2E tests passing (Cypress)
- [ ] Documentation updated:
  - [ ] API docs
  - [ ] User guides
