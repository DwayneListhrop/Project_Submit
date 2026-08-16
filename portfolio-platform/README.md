# Portfolio Platform

This branch is the provider-neutral home for the interactive portfolio system.

## Architecture
- GitHub is the source of truth.
- The app should run as a standard React/Vite web application without Replit-specific dependencies.
- Vercel is the preferred production deployment target.
- StackBlitz or CodeSandbox can be used for lightweight browser-based experimentation.
- Replit remains optional for prototyping only.

## Product direction
The portfolio should present interactive education, science, robotics, AI, visualization, and product builds as an exhibit-style system rather than a static gallery. Core features include project cards, progress/readiness states, search and filtering, case-study views, keyboard navigation, material/theme modes, responsive layouts, motion with reduced-motion support, and room for screenshots, demos, changelogs, and deployment links.

## Migration rules
1. Keep project metadata separated from presentation logic so projects can be added without rewriting components.
2. Avoid platform-specific environment assumptions.
3. Keep deployment configuration minimal and portable.
4. Use accessible semantic controls and responsive layouts.
5. Treat GitHub commits and pull requests as the canonical history of changes.
