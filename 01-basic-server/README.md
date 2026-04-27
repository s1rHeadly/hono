# Project 01 — Basic Hono server (Node)

This is the first learning project under `hono-learning`: a minimal [Hono](https://hono.dev/) app you run on Node.js. Everything below describes **this folder** only.

---

## Folder structure (this project)

| Path | Purpose |
|------|---------|
| `package.json` | Project name, npm scripts, and dependencies (`hono`, `@hono/node-server`). |
| `package-lock.json` | Lockfile: pins exact package versions so each `npm install` pulls the same dependency tree. |
| `public/` | (Optional) Static files the browser requests by URL, for example `index.html`. You create this folder when you add static serving. |
| `src/server.js` | The Hono app: imports, `new Hono()`, routes, and `serve()` so Node listens on a port. |
| `node_modules/` | **Downloaded packages** (the actual `hono` and `@hono/node-server` code, plus their dependencies). Filled in when you run `npm install` in this folder. Not committed to Git: see the parent `.gitignore`. |

The parent folder `hono-learning/` may add more projects later (`02-…`, `03-…`); this README is only for **01-basic-server**.

---

## How Hono connects to Node (the packages)

Hono runs on many **runtimes** (environments where your code executes: Cloudflare Workers, Deno, Bun, Node, and others). The core library is not tied to one way of opening a network port; you add a small **adapter** package for the runtime you use (here: Node).

In this project, two packages work together:

1. **`hono`**  
   - Provides the `Hono` class, routing, middleware, and request/response handling.  
   - This is the **application** layer: what happens for each URL and method.

2. **`@hono/node-server`**  
   - Provides `serve` (and related helpers) that connect your Hono app to **Node’s** `http` server.  
   - This is the **binding** between the app and “listen on a TCP port on this machine.”

`package.json` sets `"type": "module"`, so Node treats `.js` files as **ES modules** and you can use `import` instead of `require`.

```json
"dependencies": {
  "@hono/node-server": "^2.0.0",
  "hono": "^4.12.15"
}
```

From **this directory** (`01-basic-server`), install those dependencies into `node_modules/`:

```bash
npm install
```

With **no** package names after the command, npm reads `package.json`, resolves the versions in `package-lock.json` (if that file is present), and **downloads and installs** everything listed under `"dependencies"`—here, `hono` and `@hono/node-server`—so your `import` statements work.

---

## How to create `src/server.js` (from scratch)

1. **Install Hono from the terminal** (in this project’s folder, where `package.json` will live). You need [Node.js](https://nodejs.org/) (which includes `npm`) on your machine.  
   - If you are **starting a new folder** and do not have a `package.json` yet, create one: `npm init -y`  
   - Then add **Hono** and the **Node adapter** (you import both in `server.js`):

   ```bash
   npm install hono @hono/node-server
   ```

   With **package names** after `install`, npm fetches those packages, saves them in `node_modules/`, and adds them to the `"dependencies"` section of `package.json` (and updates the lockfile). If you **already** have a `package.json` that lists them (as in this project) and you only need to **download** what the file already names, use **`npm install` with nothing after it** so npm installs the full set from `package.json` into `node_modules/`:

   ```bash
   npm install
   ```

2. **Create** `src/server.js` (a `src` folder keeps code next to the root `package.json` clean).

3. **Import** at the top of the file:  
   - `Hono` from `hono`  
   - `serve` from `@hono/node-server` (this is what actually starts the HTTP server on Node and sends each request into your app)

4. **Create the app** with `const app = new Hono()`.

5. **Add routes** with `app.get`, `app.post`, etc., when you want to respond to HTTP requests.

6. **Start listening** with `serve({ fetch: app.fetch, port: 3000 })` (or similar) at the bottom of the file so the process **stays running** and keeps answering requests until you stop it.

7. **Run** with `npm run dev` (this project’s `package.json` runs `node src/server.js`).

If you are typing the file yourself, you can add routes and `serve` step by step; the copy of `src/server.js` in this folder is already a complete minimal server you can run as-is.

---

## What is happening in `src/server.js`

The project’s `src/server.js` looks like this (open the file on disk to see the exact file in full):

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hono is running 🚀");
});

serve({ fetch: app.fetch, port: 3000 });
```

- **`import { Hono } from "hono"`**  
  Loads the `Hono` constructor. You use it to register routes and middleware. The app object exposes a **`fetch`** function: the same “take a `Request`, return a `Response`” idea as the browser’s `fetch` API, so adapters (like `@hono/node-server`) can plug Hono into real HTTP traffic.

- **`import { serve } from "@hono/node-server"`**  
  Loads the Node adapter’s `serve`, which starts the HTTP server and forwards requests to `app.fetch`.

- **`const app = new Hono();`** and **`app.get("/", …)`**  
  Creates the app and registers a root route. The handler returns **`c.text(...)`** — a plain `text/plain` response; see the **Context `c` — response helpers (reference)** section (later in this README) for a full table, including a `c.text` example drawn from this file.

- **`serve({ fetch: app.fetch, port: 3000 })`**  
  Binds the app to **port 3000** (change the port in code if you need another).

The sections below show how **static files** and a small **JSON API** fit in once you go beyond this minimal app. When you have read through the walkthrough, the **Project breakdown** section at the **end** of this README restates the same `src/server.js` ideas as a compact mental model and request flow.

---

## Context `c` — response helpers (reference)

In route handlers, `c` is the [Context](https://hono.dev/docs/api/context) object. You read the request via `c.req` (and related APIs). To **send a reply**, you `return` a `Response` — usually by calling one of the helpers below. Most helpers let you set an optional **HTTP status** and **headers** in two ways: `c.method(data, status, headers)` or `c.method(data, { status, headers })` (the second form matches how `new Response()` works in the browser when you pass an options object).

Hono 4 (this project) exposes at least the following on `c`:

| Helper | Default `Content-Type` (if any) | Role |
|--------|--------------------------------|------|
| `c.text(string)` | `text/plain; charset=UTF-8` | Plain text body. See the example in this project below. |
| `c.json(object)` | `application/json` | JSON-encoded body (uses `JSON.stringify` internally). |
| `c.html(…)` | `text/html; charset=UTF-8` | HTML in a string, or a `Promise` that resolves to a string, for async HTML. |
| `c.body(data)` | *None* — set `Content-Type` with `c.header(...)` if needed | Raw body: `string`, `ArrayBuffer`, `Uint8Array`, `ReadableStream`, or `null`. Often used together with `c.status(...)` and `c.header('Content-Type', …)` *before* returning. |
| `c.newResponse(data, init?)` | Same as `c.body` | Same as `c.body` under the hood: builds a `Response` from the same `Data` types. |
| `c.redirect(url, status?)` | Redirect response: sets `Location`, empty body; default **302** | HTTP redirect. Use `301` / `303` / `307` / `308` when appropriate. |
| `c.notFound()` | *Defined by the app* | Triggers the app’s *not found* handler (default **404** response unless you customized it). |
| `c.render(content)` | *Depends on renderer* | When a [renderer is set](https://hono.dev/docs/api/context#render-setrenderer) (often via `c.setRenderer`), wraps `content` in a layout; default behavior routes through `c.html` if you did not set a custom renderer. |
| `c.header(name, value)` | *(Response headers)* | Set response headers. Combine with `c.body` / `c.status` (not only with the table methods above). |
| `c.status(code)` | *(Response status)* | Set the status code, often right before `c.body`, or before helpers that use the “pending” status you set. |

**Example in this project — `c.text`:** the `GET /` route returns a plain-text body:

```7:9:hono-learning/01-basic-server/src/server.js
app.get("/", (c) => {
  return c.text("Hono is running 🚀");
});
```

**Streaming (import separately):** `stream` and `streamSSE` are not `c.*` methods. You import them from `hono/streaming` and call them with `c` as the first argument, for example `stream(c, async (s) => { ... })` or `streamSSE` for [server-sent events](https://hono.dev/docs/helpers/streaming). You still `return` the `Response` they give you, like the helpers in the table.

**Full API:** [Context — Hono documentation](https://hono.dev/docs/api/context) (request/response, variables, `set` / `get`, redirects, and more).

---

## Public files: folder, URLs, and `index.html`

For HTML, CSS, and client JavaScript, you often keep files in a directory such as `public/`. Hono does not read that folder by default. You add **middleware** (extra functions that run for a request): `serveStatic` looks up a path on disk and returns the file as the HTTP response. On Node, import it from the same family of packages as `serve`:

`import { serveStatic } from "@hono/node-server/serve-static"`

### How a URL maps to a file

With `root` set to the folder on disk, the **path part of the URL** (after the host and port) is joined to that folder:

| You put the file at… | A typical URL in the browser is… |
|----------------------|-----------------------------------|
| `public/index.html`  | `http://localhost:3000/index.html` |
| `public/index.html`  | `http://localhost:3000/` (if the request path is a **directory** on disk, `serveStatic` looks for a default name, by default `index.html` inside that directory) |
| `public/app.css`     | `http://localhost:3000/app.css` |

The `root` option is **relative to the current working directory** (usually the project folder when you run `npm run dev`). The implementation resolves `…/public/index.html` for a request to `/index.html` when `root` is something like `"./public"`.

### Register API routes before the static catch-all

Hono matches routes in order. Register **`/api/...` handlers first**, then a wide pattern for static files (for example `get('*', …)`), so that JSON endpoints are handled by your code and not treated as missing files under `public/`.

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

// 1) API first (see next section) …
// app.get("/api/...", ...)

// 2) Then static files from ./public
app.get("*", serveStatic({ root: "./public" }));
```

---

## GET and POST: a small dummy API

The `src/server.js` in this folder only defines `GET /` unless you add more code yourself. The **examples in this section** are copy-paste teaching snippets: you would merge them (and the in-memory `items` array) into your app to try a tiny JSON API. A **route** in Hono is a path pattern plus an HTTP method. Handlers receive a **context** object usually named `c`: you read the request with `c.req` and build the response with helpers like `c.json()`, `c.text()`, or `c.html()`. The **Context `c` — response helpers (reference)** section above has a table of the common `c.*` return helpers.

### Dummy in-memory data

This pattern is only for learning: data lives in a variable, so it resets when the server restarts.

```js
let nextId = 2;
const items = [
  { id: 1, label: "First item" },
];
```

### GET — read data

- **`app.get("/api/items", (c) => c.json(items))`**  
  A browser or `fetch` to `GET http://localhost:3000/api/items` returns the array as JSON.

- **`app.get("/api/items/:id", (c) => { … })`**  
  `:id` is a path parameter. Read it with `c.req.param("id")` and return one object or `404`.

```js
app.get("/api/items", (c) => c.json(items));

app.get("/api/items/:id", (c) => {
  const id = Number(c.req.param("id"));
  const item = items.find((i) => i.id === id);
  if (!item) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(item);
});
```

### POST — create data

For `POST` with a JSON body, use **`await c.req.json()`** (returns a JavaScript object). Validate or shape the data as needed, push into your in-memory list, and respond with the new resource and status **`201`**.

```js
app.post("/api/items", async (c) => {
  const body = await c.req.json();
  const label = typeof body.label === "string" ? body.label : "Untitled";
  const item = { id: nextId++, label };
  items.push(item);
  return c.json(item, 201);
});
```

### Try it

With `serve({ fetch: app.fetch, port: 3000 })` in place, you can use:

- **GET** list: open `http://localhost:3000/api/items` in a browser, or:  
  `curl http://localhost:3000/api/items`
- **POST** create:  
  `curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d '{"label":"New"}'`

---

## One combined shape (order matters)

A single file that has both the dummy API and static files might look like this. Comments mark where the real handler bodies from the previous sections go:

```js
const app = new Hono();

// A) Dummy API: GET and POST
app.get("/api/items", (c) => c.json(items));
app.get("/api/items/:id", (c) => { /* ... */ });
app.post("/api/items", async (c) => { /* await c.req.json() ... */ });

// B) Static files last
app.get("*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: 3000 });
```

`public/index.html` can load data from the same origin, for example `fetch("/api/items")`, because the page and the API are served by the same Hono app.

---

## Run this project

From the `01-basic-server` directory in a terminal. If `node_modules/` is missing (for example you just cloned the repo) or you changed dependencies, **install the packages from `package.json` first** (downloads into `node_modules/`—see the command above in **How Hono connects to Node**):

```bash
npm install
```

Then start the dev script:

```bash
npm run dev
```

You should see the server start; in a browser, open `http://localhost:3000` for the route defined in `src/server.js` (for example the root `GET /` that returns the `c.text(…)` message). If a script **never** calls `serve(…)`, Node runs the file once and then exits, so there is nothing listening on a port.

---

## Project breakdown

**Now the important part (don’t skip this).** After the sections above, here is a mental model for what this project is and what each piece of `src/server.js` is doing—so you can tie the details back to the big picture.

Let’s break down what you built.

### What is `new Hono()`? 🧠

```js
const app = new Hono();
```

This line creates the Hono app object: the **one place** where you register routes and middleware. It does not open a port by itself—that is `serve()` later. Think of it as a **request handler** that, once wired up, will choose what to return for each URL and method.

### What is `app.get("/", (c) => {`? 🧠

This means: **when someone visits `/` using `GET`, run this function.**

### What is `c`? 🧠

`(c)` is the **context** object. It contains:

- **Request data** — for example `c.req` (path, method, body helpers, etc.)
- **Response helpers** — `c.text`, `c.json`, `c.html`, and the rest
- **Other request context** — headers, route params, and values you or middleware set with `c.set` / `c.get`

### What is happening in `return c.text("Hono is running 🚀");`? 🧠

You are returning an HTTP response. In practice that means:

- **Status:** `200` (default when you don’t pass a different status)
- **`Content-Type`:** `text/plain` (with charset as set by Hono for `c.text`)
- **Body:** `Hono is running 🚀`

### What is `serve()`? 🧠

```js
serve({
  fetch: app.fetch,
  port: 3000,
});
```

This **connects Hono to Node.js**: it starts an HTTP server and passes each incoming request into Hono’s `fetch` handler (`app.fetch`), so your routes and middleware actually run.

### Full flow (very important) 🔁

When you open `http://localhost:3000` in a browser:

1. The browser sends a request: **`GET /`**
2. **Node** accepts the connection (via `@hono/node-server`)
3. **Hono** matches the route `/` to your `app.get("/", …)` handler
4. Your function runs and **`return`s** a `Response` (from `c.text(…)`)
5. That response is sent back to the browser
6. The browser **displays** the text body
