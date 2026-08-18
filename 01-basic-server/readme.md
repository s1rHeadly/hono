# Project 01 — Basic Hono server (Node)

This is the first learning project under `hono-learning`: a minimal [Hono](https://hono.dev/) app you run on Node.js.

For setup, concepts, and a full walkthrough, see [`docs/hono.md`](../docs/hono.md).

---

## Prerequisites

Install [Node.js](https://nodejs.org/) (LTS is fine). That includes **npm**, which downloads packages and runs scripts.

Check they are available:

```bash
node -v
npm -v
```

---

## Create this project from scratch

Assume you have **no** `node_modules/`, no `package.json`, and no source files yet. Follow these steps in order.

### 1. Create the project folder

```bash
mkdir 01-basic-server
cd 01-basic-server
```

### 2. Initialize npm

Creates a `package.json` with default metadata:

```bash
npm init -y
```

### 3. Install Hono and the Node adapter

```bash
npm install hono @hono/node-server
```

- **`hono`** — routing, handlers, and response helpers
- **`@hono/node-server`** — connects Hono to Node.js (`serve()`)

### 4. Install nodemon (development only)

While building and testing, you'll edit `src/server.js` often. Node does not reload code on its own — without a watcher, you'd stop the server (`Ctrl+C`), run `node src/server.js` again, and refresh the browser after every save.

**nodemon** watches your files and restarts the server automatically when you save a change.

```bash
npm install --save-dev nodemon
```

The `--save-dev` flag marks it as a development-only tool — your app does not need nodemon in production.

### 5. Configure `package.json`

Enable ES modules (so you can use `import` in `.js` files) and add a `dev` script:

```bash
npm pkg set type=module
npm pkg set scripts.dev="nodemon --watch src --exec node src/server.js"
```

The `dev` script means:

- `--watch src` — only restart when files under `src/` change
- `--exec node src/server.js` — the command nodemon runs (and re-runs on change)

Your `package.json` should now include something like:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon --watch src --exec node src/server.js"
  },
  "dependencies": {
    "@hono/node-server": "^2.0.10",
    "hono": "^4.12.30"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

Exact version numbers may differ depending on when you run `npm install`.

### 6. Create `src/server.js`

```bash
mkdir src
```

Create `src/server.js` with:

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/about", (c) => {
  return c.text("This is the about page");
});

app.notFound((c) => {
  return c.text("Sorry, this page does not exist");
});

serve({
  fetch: app.fetch,
  port: 2000,
});

export default app;
```

If a script never calls `serve(…)`, Node runs the file once and exits — there is nothing listening on a port.

### 7. Start the server

```bash
npm run dev
```

You should see the server start. In a browser, open:

- `http://localhost:2000` — root route (`GET /`)
- `http://localhost:2000/about` — about route (`GET /about`)

Try a URL that does not exist (for example `http://localhost:2000/nope`) to see the `notFound` handler.

---

## Run this project (existing folder)

If you cloned the repo or already have this folder with a `package.json`, you only need to install packages and start the dev server.

From the `01-basic-server` directory:

```bash
npm install
npm run dev
```

`npm install` with no package names reads `package.json` (and `package-lock.json` if present) and downloads everything into `node_modules/`.

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
