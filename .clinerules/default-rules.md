# Project Rules: StudyMed (MERN Stack)

## Core Philosophy
- **Stack**: MERN (MongoDB, Express, React, Node.js).
- **Structure**: Modular architecture (`client/` for frontend, `server/` for backend).
- **Security**: Strict enforcement of `authMiddleware` on all protected routes (JWT).

## Development Workflow
- **State**: Use React hooks; custom hooks for complex logic.
- **API**: Axios with environment-based `baseURL`. Strict loading/error state management.
- **Database**: Mongoose schemas only. Input validation required before DB interactions.
- **Files**: Use Multer + Cloudinary (folder: `studymed_quizzes`).
- **Routing**: `react-router-dom` v7.
- **Design**: Anti-slop guidelines (consistency, responsiveness, WCAG AA).

## Startup & Seeding
- **Start Backend**: `cd server && npm run dev`
- **Start Frontend**: `cd client && npm start`
- **Upload Quizzes**: `node server/scripts/upload_quiz.js` (Place JSON in `data/` first).

## Technical Specifications
### Architecture & Tech Stack
- **Frontend**: React 19.1.0, Tailwind CSS 3.4.4, react-router-dom 7.7.1, Axios 1.11.0.
- **Backend**: Express 4.18.2, Mongoose 6.12.0.
- **Data Flow**: Server handles API via modules (`quiz`, `user`, `study`). CORS enabled for local dev.
- **Auth**: JWT required via `Authorization` header.

### Quiz & Data Management
- **Schema**: Must follow `server/models/Quiz.js` structure (`single` vs `group` types).
- **Bookmark System**: Uses `DEFAULT_USER_ID` from `.env` (maps to a fixed MongoDB user).

### UI/UX Standards
- **Components**: Use `InputField`, `QuestionSingleEditor`, `QuestionGroupEditor`, `QuestionSingleDisplay`, `ResizableCaseStudy`, `QuizNavigationDrawer`.
- **Page Logic**: Refer to `pages_reference.md` for specific routing logic and CRUD handlers.

## Coding Standards
- Modern ES6+.
- 2-space indentation.
- Update `active_context.md` on core changes.

## Deployment & Version Control
- **Targets**: Render (server), Vercel (client).
- **Security**: NEVER commit `.env`.
- **GitHub Workflow (Work Account)**: 
  - Email: `mqule.md.hmu@gmail.com`
  - SSH Host: `github.com-work`
  - Always verify `git config --local` before pushing.
  - Automate push on feature completion.

## Documentation Reference
- `active_context.md`: Current state.
- `architecture.md`: System flow.
- `bookmark_system_guide.md`: Bookmark logic.
- `component_reference.md`: UI components.
- `pages_reference.md`: Routing guide.
- `quiz_data_structure.md`: Data schema.
- `quiz_upload_guide.md`: Seeding instructions.
- `tech_stack.md`: Versions.