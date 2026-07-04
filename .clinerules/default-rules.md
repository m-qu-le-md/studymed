# Project Rules: StudyMed (MERN Stack)

## Core Philosophy
- **Stack**: MERN (MongoDB, Express, React, Node.js).
- **Structure**: Modular architecture (`client/` for frontend, `server/` for backend).
- **Security**: Strict enforcement of `authMiddleware` on all protected routes. JWT-based authentication.

## Development Workflow
- **State**: Use React hooks; custom hooks for complex logic.
- **API**: Axios with environment-based `baseURL`. Strict loading/error state management.
- **Database**: Mongoose schemas only. Input validation required before DB interactions.
- **Files**: Use Multer + Cloudinary (folder: `studymed_quizzes`).
- **Routing**: `react-router-dom` v7. Protected routes guarded.
- **Design**: Anti-slop guidelines (consistency, responsiveness, WCAG AA).

## Coding Standards
- Modern ES6+.
- 2-space indentation.
- Update `cline_docs/active_context.md` on core changes.

## Deployment & Version Control
- **Targets**: Render (server), Vercel (client).
- **Security**: Never commit `.env`.

### GitHub Workflow (Work Account)
- **Account**: `mqule.md.hmu@gmail.com`.
- **SSH**: Remote must be `github.com-work`.
- **Pre-push**: Always verify `git config --local user.email` and `git remote -v`.
- **Automation**: Push changes immediately upon feature completion.

## Documentation Workflow
Refer to `cline_docs/` for all standards:
- `project_brief.md`: Project scope & goal.
- `architecture.md`: Technical stack, data flow, CORS, Auth.
- `tech_stack.md`: Versions (React 19, Express 4.18, etc.).
- `active_context.md`: Current development state & recent changes.
- `pages_reference.md`: Routing & page-level logic.
- `component_reference.md`: UI components & reusability standards.
- `quiz_data_structure.md`: JSON/Mongoose schema standards for Quizzes.
- `github_config.md`: Account & SSH setup.
- `quiz_upload_guide.md`: Seeding instructions (`node server/scripts/upload_quiz.js`).
- *Mandatory*: Search docs before starting any task.
