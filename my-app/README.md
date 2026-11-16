# PRSSA Loyola website (frontend)

React 18 app built with [Vite](https://vite.dev/). Needs Node.js 22.12 or newer.

## Available Scripts

In the `my-app` directory, you can run:

### `npm start` (or `npm run dev`)

Runs the app in development mode on [http://localhost:3000](http://localhost:3000) and opens it in your browser.
The page updates as you make changes. Port 3000 matches the server's default CORS origin.

### `npm test`

Runs the tests once with [Vitest](https://vitest.dev/).

### `npm run build`

Builds the app for production into the `build` folder.

### `npm run preview`

Serves the production build locally on port 3000 so you can check it.

## Configuration

The site expects the server at `http://localhost:4000`. To use a different address, set `REACT_APP_API_URL` in `my-app/.env`.
