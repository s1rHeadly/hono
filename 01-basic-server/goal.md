# Project 01 — Basic Server

The goal isn't to build a real API yet. It's to understand **how a Hono server works** — what happens from the moment a browser sends a request to the moment it gets a response back.

---

## Where we are in the progression

```text
01 Basic Server     ← we're here
        ↓
02 Routing
        ↓
03 Request Data
        ↓
04 API Design
        ↓
05 Mini API Project
        ↓
06 Structured App
```

---

## What I'll teach you

### 1. What Hono actually is

We'll start with the core object:

```js
const app = new Hono();
```

This creates the app — the place where routes live. It does **not** open a port by itself. That's `serve()` later.

You'll understand that Hono is a routing layer: it matches incoming HTTP requests to the functions you've registered.

### 2. Routes and handlers

We'll learn the most basic route pattern:

```js
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
```

Meaning:

> "When someone visits `/` using GET, run this function."

We'll add a second route (`/about`) so you see that each URL can have its own handler.

### 3. The context object (`c`)

Every route handler receives `(c)` — the **context**:

- **Request data** — `c.req` (path, method, body helpers, etc.)
- **Response helpers** — `c.text`, `c.json`, `c.html`, and more
- **Other context** — headers, route params, values set with `c.set` / `c.get`

You'll learn that `c` is how you read the incoming request and build the outgoing response.

### 4. Returning responses

We'll use `c.text()` to send plain-text responses:

```js
return c.text("Hello Hono!");
```

This returns:

- **Status:** `200` (default)
- **`Content-Type`:** `text/plain`
- **Body:** the string you passed in

We'll touch on the idea that different helpers (`c.text`, `c.json`, `c.html`) produce different response types — but we'll only use `c.text` in this project.

### 5. Connecting Hono to Node.js

We'll use `@hono/node-server` to start listening:

```js
serve({
  fetch: app.fetch,
  port: 2000,
});
```

You'll understand that `serve()` connects Hono to Node.js: it starts an HTTP server and passes each incoming request into Hono's `fetch` handler.

### 6. The full request flow

When you open `http://localhost:2000` in a browser:

1. Browser sends `GET /`
2. Node accepts the connection (via `@hono/node-server`)
3. Hono matches `/` to your `app.get("/", …)` handler
4. Your function `return`s a `Response` (from `c.text(…)`)
5. Response sent back to the browser
6. Browser displays the text body

This mental model — request in, handler runs, response out — is the foundation for everything that follows.

### 7. Handling unknown URLs

We'll add a catch-all for routes that don't exist:

```js
app.notFound((c) => {
  return c.text("Sorry, this page does not exist");
});
```

So you see that Hono has a default behaviour you can override.

### 8. Development workflow

We'll use **nodemon** so the server restarts automatically when you save changes:

```bash
npm run dev
```

Node does not reload code on its own — without a watcher, you'd stop the server, run it again, and refresh after every edit. nodemon removes that friction during learning.

---

## What I DON'T want to do yet

I don't want to throw these at you:

- route parameters (`/bands/:id`)
- query parameters (`?genre=metal`)
- JSON APIs (`c.json`)
- POST, PATCH, DELETE
- request bodies
- validation or status codes
- databases or persistent data

Those all come in later projects. This one is about the mechanics of a running server.

---

## The project we'll build

A minimal Hono app with two text routes:

```text
              BASIC SERVER
                  │
        ┌─────────┴─────────┐
        │                   │
      GET /              GET /about
        │                   │
   "Hello Hono!"    "This is the about page"
```

You'll run it locally, visit both URLs in a browser, and see text responses come back.

The important part is that you'll understand **what each line of `server.js` is doing** — not just copy it and hope it works.

---

## One important distinction from later projects

This project teaches you:

> How a **server listens and responds**.

Later projects will teach you:

> How to **design and build an API**.

Right now, we're not building an API. We're building the foundation — the request/response loop that every API sits on top of.
