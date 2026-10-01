# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Website for PRSSA Loyola's meetings, speakers and news posts (CS496 final project). Two separate npm projects live in this repo:

- Repo root: Express + Mongoose API server, CommonJS.
- `my-app/`: Create React App frontend (React 18, react-router v6, axios).

## Commands

Install (both projects need it):

```
npm install
cd my-app && npm install
```

Run (two terminals):

```
npm start                    # API on http://localhost:4000 (node ProjectServer.js)
cd my-app && npm start       # frontend on http://localhost:3000
```

Server tests (Jest, from the repo root):

```
npm test                                        # all tests
npx jest __tests__/MeetingController.test.js    # one file
npx jest -t "Reading a valid meeting by its ID" # one test by name
npm run test:coverage
```

Frontend (from `my-app/`):

```
npm test -- --watchAll=false   # react-scripts test
npm run build                  # with CI=true, lint warnings fail the build
```

There is no separate lint script; ESLint runs as part of the frontend build. `.github/workflows/test.yml` runs the server tests, frontend tests and frontend build.

## Environment

The server needs a `.env` file in the repo root (gitignored; see `.env.example`):

- `DB_URI`, `TESTDB_URI`: MongoDB connection strings for the main and test databases.
- `SESSION_SECRET`: signs session cookies. If unset, a random one is generated per process and a warning is logged.
- Optional: `DB_TARGET` (`test` or `main`), `CLIENT_ORIGIN` (CORS origin, default `http://localhost:3000`), `HOST`, `PORT`.

The server uses the test database unless `NODE_ENV=production` or `DB_TARGET=main`. Sessions are stored in the same database.

The frontend reads `REACT_APP_API_URL` (default `http://localhost:4000`).

## Server architecture

- `app.js` exports `createApp({sessionStore, logging})`. It holds all middleware and the full route table; there are no router modules. It does not connect to the database or listen.
- `ProjectServer.js` connects to the database, creates the MongoDB session store, and listens.

Layers, one set per entity (User, Meeting, Speaker, News):

- `controller/*Controller.js`: `(request, response)` handlers. They do the auth check, build a plain object from `request.body` / `request.file(s)`, call the DAO, and set status + send. Each controller keeps its DAO in a module-level `let dao` and exports `setDAO(otherDAO)` so tests can swap in a mock.
- `model/*DAO.js`: defines the Mongoose schema and model, and exports async functions that return `.lean()` objects. Every DAO has a `deleteAll()` that is for tests only.

Conventions that cut across files:

- Every route in `app.js` is registered through `wrap(...)`. Express 4 does not catch rejected promises from async handlers, and an unhandled rejection kills the process, so a new route must be wrapped too. Errors end up in the error handler at the bottom of `app.js` (Multer errors, Mongoose `ValidationError`/`CastError` → 400, everything else → 500).
- Auth goes through `util/Auth.js`: `auth.isAdmin(request)` and `auth.getUser(request)`. Login puts the user (with `password: null`) on `request.session.user`. Admin-only handlers respond 401 otherwise. `admin` is a Number (0/1), immutable in the schema, and `saveUser` always sets it to 0; admins are made by editing the database.
- Never take the acting user's ID or admin status from the request body; use the session.
- DAO functions that take an ID check `mongoose.isValidObjectId` first and return null. An update without a valid `_id` must return null: with an empty filter, `findOneAndUpdate` would change the first document in the collection.
- Values from `request.body` can be objects (JSON bodies), so anything used in a query on a string field is checked or converted to a string first.
- Passwords: `util/PasswordUtil.js` uses `bcryptjs` with a random salt per password (`hashPassword`, `checkPassword`). Login reads the user by email with `dao.readForLogin` and compares in the controller. Hashes made by the old fixed-salt code still verify.
- Images: Multer uses memory storage with an 8 MB limit and an image-only filter, and is attached per route (`upload.single('meetingImage')`, `upload.array('newsImages', 10)`), never globally. The Multer field name must match the `FormData` key the frontend appends. `util/ImageUtil.js` converts Multer files to the stored shape. Image bytes are stored in MongoDB as `Buffer` fields and reach the frontend as base64 strings. Updates only replace images when new ones are uploaded.
- CORS only allows `CLIENT_ORIGIN` and methods GET, POST, DELETE. Updates are POST routes (`/updatemeeting`, `/editspeaker`, `/updatenewspost`, `/updateuser`); deletes are `DELETE /<entity>/:id`.

Meeting search uses a MongoDB text index over `speaker`, `topic`, `location` and `content`, and responds 404 when nothing matches.

`MeetingDAO.voteOnMeeting` is unused and does not match the `feedback` schema.

## Tests

`test/globalSetup.js` starts an in-memory MongoDB (`mongodb-memory-server`, version pinned in `package.json` under `config`), and `test/setupEnv.js` points `TESTDB_URI`/`DB_URI` at a fresh database for each test file. Tests never use the `.env` databases. The first run downloads the MongoDB binary (~500 MB).

- `__tests__/*Controller.test.js`: unit tests with no database. They call `controller.setDAO(mock)` with a mock from `util/mocks/Mock*DAO.js` (or inline `jest.fn()` objects for speakers), build req/res with `util/ControllerInterceptor.js`, and assert on `res.status` and `res.send` calls. A new controller function that calls a new DAO function needs the same function added to the mock.
- `__tests__/*DAO.test.js`: run the real DAOs against the in-memory database. Tests within a file depend on data left by earlier tests in that file.
- `__tests__/Routes.test.js`: supertest against `createApp()` with real DAOs and sessions. This is where route wiring and who-can-do-what are checked; add to it when adding a route.

## Frontend

- `src/index.js` defines every route. Admin-only pages are wrapped in `Components/RequireAdmin`. Pages for a single item take the ID from the URL (`/ViewMeeting/:id`, `/EditSpeaker/:id`) with `useParams`.
- `src/api.js` exports the axios instance all requests go through (`baseURL` + `withCredentials: true`, which the session cookie depends on) and `errorMessage(error, fallback)` for alerts. Do not import `axios` directly in pages.
- `src/UserContext.js` holds the logged-in user for the whole app. Components read it with `const { user, isAdmin, loading, setUser } = useUser()`; login, logout and account edits call `setUser` instead of reloading the page.
- `src/util.js`: `imageSrc(image)` for stored images, and helpers to convert between a `Date` and the values of date/time inputs.
- Pages are in `src/Pages/` and follow a `Create*` / `Edit*` / `View*` naming pattern per entity. The three meeting list pages share `Components/MeetingList`.
- `App.js` is only the home page (news + upcoming meetings).
- Styling is Bootstrap (loaded from a CDN in `public/index.html`) plus `src/App.css` and `src/site_style.css`. `App.css` overrides `.btn` colors globally, so buttons set `backgroundColor` inline.
- `MainPage/MeetingSection.js`, `MainPage/NewsSection.js` and `Components/PasswordField.js` are unused.
