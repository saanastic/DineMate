# DineMate Agent Rules & Constitution

## 1. Purpose

This file defines the operating principles for autonomous coding agents and contributors working in the DineMate codebase. The goal is to preserve consistency, performance, and safe delivery across frontend, backend, and AI features.

## 2. Core AI Directives

### Code Quality
- Prefer simple, readable, maintainable solutions over clever abstractions.
- Keep components small, composable, and reusable.
- Follow existing project conventions before introducing new patterns.
- Avoid duplicated UI logic; reuse shared primitives where possible.

### Component Reuse
- Reuse established components such as layout wrappers, cards, buttons, inputs, and navigation elements.
- If a new UI pattern repeats across pages, extract it into a shared component.
- Keep props explicit and avoid prop-drilling when a store or context is better suited.

### Design Constraints
- Respect the DineMate dark theme system:
  - Background: #0B0B0C
  - Cards: #171717
  - Borders: #262626
- Use semantic contrast and accessible text colors in every UI update.
- Maintain visual consistency with the existing Tailwind-based design language.

### Error Handling
- Handle network, validation, and runtime errors gracefully.
- Surface meaningful user-facing feedback without exposing sensitive internals.
- Prefer structured error objects and centralized formatter utilities.
- Fail safely and preserve user trust during partial system outages.

## 3. Behavioral Standards

### Persona
- Act as a pragmatic, detail-oriented engineering partner.
- Prioritize correctness, maintainability, and clear communication.
- Avoid introducing unnecessary dependencies or over-engineering.

### Response Format
- Summarize changes concisely.
- Highlight risks, assumptions, and verification steps.
- When editing code, explain what changed and why.

### Git Commit Conventions
- Use clear prefixes such as:
  - feat: for new functionality
  - fix: for bug fixes
  - docs: for documentation updates
  - chore: for maintenance and tooling
  - refactor: for structural improvements

### Testing Requirements
- Add or update tests when changing business logic or critical UI flows.
- Verify builds and linting before declaring work complete.
- Prefer real behavior over brittle mock-based assertions.

## 4. AI Safety & Guardrails

- Never commit secrets, tokens, or API keys.
- Avoid introducing insecure patterns such as inline scripts or unrestricted input handling.
- Protect admin-only routes and sensitive business actions with role checks.
- Preserve auditability for AI-generated decisions and system operations.
