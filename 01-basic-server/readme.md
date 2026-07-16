# Project 01 — Basic Hono server (Node)

This is the first learning project under `hono-learning`: a minimal [Hono](https://hono.dev/) app you run on Node.js.

For setup, concepts, and a full walkthrough, see [`docs/hono.md`](../docs/hono.md).

---

## Run this project

From the `01-basic-server` directory in a terminal.

### Install dependencies

If `node_modules/` is missing (for example you just cloned the repo) or you changed dependencies, install packages first:

```bash
npm install
```

### nodemon (auto-restart during development)

While building and testing, you'll edit `src/server.js` often. Node does not reload code on its own — without a watcher, you'd stop the server (`Ctrl+C`), run `node src/server.js` again, and refresh the browser after every save.

**nodemon** watches your files and restarts the server automatically when you save a change.

This project already lists nodemon as a dev dependency, so `npm install` installs it. If you were setting up from scratch:

```bash
npm install --save-dev nodemon
```

The `--save-dev` flag marks it as a development-only tool — your app does not need nodemon in production.

The `dev` script in `package.json` uses it:

```json
"dev": "nodemon --watch src --exec node src/server.js"
```

`--watch src` limits restarts to files under `src/`. `--exec node src/server.js` is the command nodemon runs (and re-runs when something changes).

### Start the server

```bash
npm run dev
```

You should see the server start. In a browser, open:

- `http://localhost:2000` — root route (`GET /`)
- `http://localhost:2000/about` — about route (`GET /about`)

If a script never calls `serve(…)`, Node runs the file once and exits — there is nothing listening on a port.

---

## Project breakdown

**Don't skip this.** Here is a mental model for what this project is and what each piece of `src/server.js` is doing.

### What is `new Hono()`?

```js
const app = new Hono();
```

Creates the Hono app object — the one place where you register routes and middleware. It does not open a port by itself; that is `serve()` later.

### What is `app.get("/", (c) => {`?

"When someone visits `/` using `GET`, run this function."

### What is `c`?

`(c)` is the **context** object:

- **Request data** — `c.req` (path, method, body helpers, etc.)
- **Response helpers** — `c.text`, `c.json`, `c.html`, and more
- **Other context** — headers, route params, values set with `c.set` / `c.get`

### What is `return c.text("Hello Hono!");`?

Returns an HTTP response:

- **Status:** `200` (default)
- **`Content-Type`:** `text/plain`
- **Body:** `Hello Hono!`

### What is `serve()`?

```js
serve({
  fetch: app.fetch,
  port: 2000,
});
```

Connects Hono to Node.js: starts an HTTP server and passes each incoming request into Hono's `fetch` handler.

### Full flow

When you open `http://localhost:2000` in a browser:

1. Browser sends `GET /`
2. Node accepts the connection (via `@hono/node-server`)
3. Hono matches `/` to your `app.get("/", …)` handler
4. Your function `return`s a `Response` (from `c.text(…)`)
5. Response sent back to the browser
6. Browser displays the text body
