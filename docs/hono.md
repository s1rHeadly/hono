# Hono — Tutorial & Cheat Sheet

A guide for developers with **zero Hono experience**. Read it top to bottom like a tutorial, or jump to any section when you need a quick reference.

---

## Glossary

| Term | Meaning |
|------|---------|
| Browser | The client making the request (Chrome, Edge, Firefox, etc.) |
| Server | A program that listens for requests and sends responses |
| Request | "Can I have this resource?" |
| Response | "Here you go." |
| Route | A URL that your server knows how to handle (like `/about`) |
| HTTP Method | The *action* in a request (like `GET`, `POST`, or `DELETE`) |
| Hono | A lightweight web framework that helps you write server code |
| Runtime | The environment where your code runs (Node.js, Cloudflare Workers, Deno, Bun, …) |
| Adapter | A small package that connects Hono to a specific runtime (e.g. `@hono/node-server` for Node) |
| Context (`c`) | The object passed to every route handler — request data, response helpers, and more |
| Middleware | Extra functions that run before (or around) your route handler |

---

## What is Hono?

[Hono](https://hono.dev/) is a small, fast web framework for building servers and APIs. You register routes (URL + HTTP method → handler function), and Hono matches incoming requests to the right handler.

Hono runs on many runtimes. The core library is not tied to one way of opening a network port — you add an **adapter** for the runtime you use. In these learning projects we use **Node.js** with `@hono/node-server`.

---

## How Hono connects to Node

Two packages work together:

1. **`hono`** — the application layer: `Hono` class, routing, middleware, request/response handling.
2. **`@hono/node-server`** — the binding layer: provides `serve()` so your app listens on a TCP port on your machine.

`package.json` should set `"type": "module"` so Node treats `.js` files as **ES modules** and you can use `import` instead of `require`.

```json
{
  "type": "module",
  "dependencies": {
    "@hono/node-server": "^2.0.0",
    "hono": "^4.12.0"
  }
}
```

---

## Project setup

### Folder structure (typical project)

Based on `01-basic-server/` — one self-contained Hono project per numbered folder:

```
01-basic-server/
├── package.json              # Project name, npm scripts, dependencies
├── package-lock.json         # Locked versions from npm install
├── README.md                 # How to run this project
├── src/
│   └── server.js             # Hono app: routes, middleware, serve()
├── public/                   # (Optional) Static files the browser loads by URL
│   └── index.html
├── data/                     # (Optional) Dummy JSON for API routes to return
│   ├── items.json
│   └── categories.json
└── node_modules/             # Installed packages — created by npm install, not committed
```

| Path | Purpose |
|------|---------|
| `package.json` | Project name, npm scripts, and dependencies |
| `package-lock.json` | Pins exact package versions for reproducible installs |
| `README.md` | Run instructions and a short breakdown of the code |
| `src/server.js` | The Hono app: imports, routes, and `serve()` |
| `public/` | Static files (HTML, CSS, images) served to the browser |
| `data/` | Stand-in data while you learn — JSON files your routes read and send back with `c.json()` |
| `node_modules/` | Downloaded packages — created by `npm install`, not committed to Git |

When a route needs to return JSON before you have a real database, keep sample payloads in `data/` instead of hard-coding them in `server.js`:

```js
import items from "../data/items.json" with { type: "json" };

app.get("/api/items", (c) => c.json(items));
```

`01-basic-server` does not include `data/` yet — it only returns plain text. Add the folder when you start building JSON API routes.

### Install dependencies

You need [Node.js](https://nodejs.org/) (which includes `npm`) on your machine.

**Starting from scratch** in a new folder:

```bash
npm init -y
npm install hono @hono/node-server
```

**Cloning or opening an existing project** that already lists dependencies in `package.json`:

```bash
npm install
```

With no package names after the command, npm reads `package.json`, resolves versions from `package-lock.json`, and downloads everything into `node_modules/`.

### Install nodemon (development)

While building and testing, you'll restart the server often. **nodemon** watches your files and restarts automatically when you save a change.

```bash
npm install --save-dev nodemon
```

The `--save-dev` flag tells npm this is a development tool, not something your application needs in production.

### Update `package.json` scripts

```json
"scripts": {
  "dev": "nodemon --watch src --exec node src/server.js"
}
```

Now `npm run dev` starts the server and restarts it when you edit files — instead of running `node src/server.js` manually every time.

---

## Your first Hono app

### Create `src/server.js`

1. Create a `src` folder (keeps code separate from config at the project root).
2. Import `Hono` from `hono` and `serve` from `@hono/node-server`.
3. Create the app with `const app = new Hono()`.
4. Add routes with `app.get`, `app.post`, etc.
5. Call `serve({ fetch: app.fetch, port: 3000 })` at the bottom so the process **stays running** and keeps answering requests.

A minimal server looks like this:

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve({
  fetch: app.fetch,
  port: 3000,
});

export default app;
```

> **Important:** If your file never calls `serve(…)`, Node runs the file once and exits — there is nothing listening on a port.

### Read it line by line

**Line 1 — import Hono**

```js
import { Hono } from "hono";
```

Brings the Hono constructor into your project. Before this, your JavaScript has no web-server abilities. After this, it does.

**Line 2 — import the Node adapter**

```js
import { serve } from "@hono/node-server";
```

Loads `serve`, which starts the HTTP server on Node and forwards each request into your app.

**Line 3 — create the app**

```js
const app = new Hono();
```

Creates the application object — the one place where you register routes and middleware. It does **not** open a port by itself; that is `serve()` later.

```
app
 |
 ├── Can receive requests
 ├── Can create routes
 └── Can send responses
```

**Lines 4–6 — register a route**

```js
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
```

Tells Hono: "If a `GET` request comes in for `/`, run this function."

```
GET /  →  run this function  →  return "Hello Hono!"
```

**Lines 7–10 — start listening**

```js
serve({
  fetch: app.fetch,
  port: 3000,
});
```

Connects Hono to Node.js. Each incoming request is passed to `app.fetch`, so your routes actually run.

The app object exposes a **`fetch`** function — the same "take a `Request`, return a `Response`" idea as the browser's `fetch` API. Adapters like `@hono/node-server` plug that into real HTTP traffic.

**Final line — export**

```js
export default app;
```

Makes the Hono application available to other modules or deployment tools.

### The complete request journey

When you visit `http://localhost:3000/`:

```
1. Browser sends: GET /
        ↓
2. Node accepts the connection (@hono/node-server)
        ↓
3. Hono checks registered routes — GET / ✅ found
        ↓
4. Your handler runs: return c.text("Hello Hono!")
        ↓
5. Response sent back to the browser
        ↓
6. Browser displays: Hello Hono!
```

Think of it as a conversation:

```
Browser:  "Can I have / ?"
Server:   "Let me check..."
Hono:     "I've got a route for that."
Your code: "Return 'Hello Hono!'"
Browser:  "Thanks!"
```

Every website and API follows this same request–response pattern.

### Who does what?

**The server does not know what `/about` means. Hono does the route matching.**

- The server is the building.
- Hono is the receptionist inside the building.
- Your code is the worker who handles the request.

```
                Server
                  |
                Hono
                  |
        ---------------------
        |                   |
      Route              Route
       "/"              "/about"
        |                   |
   Your function      Your function
        |                   |
   return c.text()    return c.text()
```

### Where does the response come from?

At this stage, Hono returns whatever your function creates — it doesn't fetch existing data.

```js
app.get("/about", (c) => {
  return c.text("About page");
});
```

The text `"About page"` doesn't exist anywhere before the request. Your function creates it on the fly and sends it back.

Later, when you build APIs, the flow changes:

```
Browser  →  GET /bands  →  Hono route  →  Read JSON/database  →  Return data
```

---

## Part 1 — How a request works (detailed)

You've seen what the code looks like. Now let's trace what happens step by step.

### Step 1 — You type a URL

```
http://localhost:3000/
```

Nothing has happened yet.

### Step 2 — The browser creates an HTTP request

```
GET / HTTP/1.1
Host: localhost:3000
```

The important part is `GET /` — "I'd like the homepage." `GET` is the **HTTP method** (the action). We'll dig into methods in Part 2.

### Step 3 — The server is listening

A server spends most of its life waiting. The moment a request arrives, it wakes up.

```
          Waiting...

Browser  -------------------->  Server
           GET /
```

### Step 4 — Hono receives the request

Hono has a list of routes:

```
GET /
GET /about
GET /contact
```

When it receives `GET /`, it asks: "Do I know how to handle this?" If yes, it runs your function.

### Step 5 — Your JavaScript runs

```js
app.get("/", (c) => {
  return c.text("Hello!");
});
```

Hono runs that function. The function creates a response.

### Step 6 — The response goes back

```
Browser → GET / → Server → Hono → Your code → "Hello!" → Browser
```

### Part 1 checkpoint

- ✅ Browser sends requests
- ✅ Server receives requests
- ✅ Hono matches routes
- ✅ Your functions create responses
- ✅ Browser displays responses

---

## Context `c` — cheat sheet

In route handlers, `c` is the [Context](https://hono.dev/docs/api/context) object.

- **Read the request** via `c.req` (path, method, body, params, headers).
- **Send a reply** by `return`ing a `Response` — usually through one of the helpers below.

Most helpers accept an optional status and headers: `c.method(data, status, headers)` or `c.method(data, { status, headers })`.

| Helper | Default `Content-Type` | Role |
|--------|------------------------|------|
| `c.text(string)` | `text/plain; charset=UTF-8` | Plain text body |
| `c.json(object)` | `application/json` | JSON-encoded body |
| `c.html(…)` | `text/html; charset=UTF-8` | HTML string (or async `Promise`) |
| `c.body(data)` | *None* — set with `c.header()` | Raw body: string, `ArrayBuffer`, `Uint8Array`, `ReadableStream`, or `null` |
| `c.newResponse(data, init?)` | Same as `c.body` | Builds a `Response` from raw data |
| `c.redirect(url, status?)` | Redirect (`Location` header) | HTTP redirect; default **302** |
| `c.notFound()` | *App-defined* | Triggers the not-found handler (default **404**) |
| `c.render(content)` | *Depends on renderer* | Wraps content in a layout when a renderer is set |
| `c.header(name, value)` | *(response header)* | Set a response header |
| `c.status(code)` | *(response status)* | Set status before `c.body` or other helpers |

**Example — plain text:**

```js
app.get("/", (c) => {
  return c.text("Hono is running 🚀");
});
```

**Example — JSON with status:**

```js
return c.json({ error: "Not found" }, 404);
```

**Reading the request:**

| What you need | How to get it |
|---------------|---------------|
| Path parameter `:id` | `c.req.param("id")` |
| Query string `?q=hello` | `c.req.query("q")` |
| JSON body (POST) | `await c.req.json()` |
| Request header | `c.req.header("authorization")` |

**Streaming** (import separately from `hono/streaming`):

```js
import { stream, streamSSE } from "hono/streaming";

// stream(c, async (s) => { ... })
// streamSSE for server-sent events
```

Full API: [Context — Hono documentation](https://hono.dev/docs/api/context)

---

## Part 2 — HTTP methods

In Part 1 you kept seeing `GET` in requests like `GET /about`. Every request has a **method + path**:

```
GET     /about
│       │
│       └── The path
└── The action
```

### Methods in Hono

Each HTTP method has its own function on `app`:

**GET** — read or fetch something:

```js
app.get("/books", (c) => {
  return c.text("List books");
});
```

**POST** — create something new:

```js
app.post("/books", (c) => {
  return c.text("Create book");
});
```

**DELETE** — remove something:

```js
app.delete("/books/:id", (c) => {
  return c.text("Delete book");
});
```

The method tells Hono **what type of request** this route responds to. Hono matches on **method + path** together — it won't run a GET handler for a DELETE request, even if the path is identical.

### Same URL, different action

```
GET /users/david     →  "Give me David's profile."
DELETE /users/david  →  "Remove David's profile."
```

```js
app.get("/users/david", handler);    // runs on GET only
app.delete("/users/david", handler); // runs on DELETE only
```

### Part 2 checkpoint

- ✅ Every request has a method and a path
- ✅ Hono matches routes on **both**
- ✅ `app.get()`, `app.post()`, `app.delete()` register different handlers for the same path

---

## Building a simple API

A **route** is a path pattern plus an HTTP method. Handlers receive context `c`: read with `c.req`, respond with `c.json()`, `c.text()`, etc.

### Dummy in-memory data

For learning only — data resets when the server restarts.

```js
let nextId = 2;
const items = [
  { id: 1, label: "First item" },
];
```

### GET — read data

```js
// List all items
app.get("/api/items", (c) => c.json(items));

// Get one item by :id path parameter
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

```js
app.post("/api/items", async (c) => {
  const body = await c.req.json();
  const label = typeof body.label === "string" ? body.label : "Untitled";
  const item = { id: nextId++, label };
  items.push(item);
  return c.json(item, 201);
});
```

### Try it with curl

```bash
# GET list
curl http://localhost:3000/api/items

# POST create
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"label":"New"}'
```

---

## Serving static files

For HTML, CSS, and client JavaScript, keep files in a `public/` folder. Hono does not read that folder by default — you add **middleware** to serve files from disk.

On Node:

```js
import { serveStatic } from "@hono/node-server/serve-static";
```

### How a URL maps to a file

With `root` set to the folder on disk, the path part of the URL is joined to that folder:

| File on disk | URL in the browser |
|--------------|-------------------|
| `public/index.html` | `http://localhost:3000/index.html` |
| `public/index.html` | `http://localhost:3000/` (directory requests look for `index.html` by default) |
| `public/app.css` | `http://localhost:3000/app.css` |

The `root` option is relative to the **current working directory** (usually the project folder when you run `npm run dev`).

### Register API routes before the static catch-all

Hono matches routes **in order**. Register `/api/...` handlers first, then a wide pattern for static files, so JSON endpoints aren't treated as missing files.

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

// 1) API routes first
app.get("/api/items", (c) => c.json(items));
app.post("/api/items", async (c) => { /* ... */ });

// 2) Static files last
app.get("*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: 3000 });
```

`public/index.html` can call `fetch("/api/items")` because the page and API share the same origin.

---

## Putting it all together

A single file with API + static files — **order matters**:

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

let nextId = 2;
const items = [{ id: 1, label: "First item" }];

// A) API routes
app.get("/api/items", (c) => c.json(items));
app.get("/api/items/:id", (c) => {
  const id = Number(c.req.param("id"));
  const item = items.find((i) => i.id === id);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});
app.post("/api/items", async (c) => {
  const body = await c.req.json();
  const label = typeof body.label === "string" ? body.label : "Untitled";
  const item = { id: nextId++, label };
  items.push(item);
  return c.json(item, 201);
});

// B) Static files last
app.get("*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: 3000 });
```

---

## Mental model — quick recap

| Piece | What it does |
|-------|-------------|
| `new Hono()` | Creates the app — registers routes and middleware. Does **not** open a port. |
| `app.get("/", (c) => { … })` | "When someone visits `/` with `GET`, run this function." |
| `c` | Context — request data (`c.req`), response helpers (`c.text`, `c.json`, …), headers, params |
| `return c.text("…")` | Sends HTTP 200, `Content-Type: text/plain`, body text |
| `serve({ fetch: app.fetch, port: 3000 })` | Connects Hono to Node — starts listening and forwards requests to `app.fetch` |

**Full flow when you open `http://localhost:3000`:**

1. Browser sends `GET /`
2. Node accepts the connection
3. Hono matches the route to your handler
4. Your function `return`s a `Response`
5. Response sent to the browser
6. Browser displays the body

---

## npm commands cheat sheet

| Command | What it does |
|---------|-------------|
| `npm init -y` | Create a new `package.json` |
| `npm install hono @hono/node-server` | Add Hono + Node adapter |
| `npm install` | Install all dependencies from `package.json` |
| `npm install --save-dev nodemon` | Add nodemon for auto-restart during development |
| `npm run dev` | Start the server with your dev script |
