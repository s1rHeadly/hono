# Project 02 — Routing

The goal isn't to build a full API yet. It's to learn **how Hono connects URLs to JavaScript functions** — and how to read dynamic data from the request.

---

## Where we are in the progression

```text
01 Basic Server
        ↓
02 Routing          ← we're here
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

### 1. What routing means

Routing is telling the server:

> "When a request comes to this URL, run this function."

In Hono:

```text
HTTP Request
      │
      ↓
Hono Route
      │
      ↓
JavaScript Logic
      │
      ↓
Response (JSON / HTML / Text)
```

You'll see that the route path (`/bands`) and the variable name in your code (`bands`) are **not** connected — the URL is just a string you choose.

### 2. Route parameters (dynamic path segments)

We'll introduce placeholders in the URL:

```js
app.get("/bands/:name", (c) => {
  const bandName = c.req.param("name");
  return c.text(`Band requested: ${bandName}`);
});
```

Request: `GET /bands/pantera` → `bandName = "pantera"`

Route params identify **which resource** you want:

```text
/bands/pantera  = the Pantera band resource
```

We'll also cover multiple params:

```text
/bands/:name/albums/:album
```

### 3. Query parameters (optional filters after `?`)

We'll introduce query strings:

```text
/bands?genre=metal
```

The route is still `/bands`. The query changes **how** the data is returned.

```js
const genre = c.req.query("genre");
```

### 4. Route params vs query params

This distinction is critical:

| | Route parameter | Query parameter |
| --- | --- | --- |
| **Purpose** | Identify a specific resource | Filter, sort, or modify results |
| **Example URL** | `/bands/pantera` | `/bands?genre=metal` |
| **Meaning** | Give me the Pantera resource | Give me bands, but only metal ones |
| **How to read** | `c.req.param("name")` | `c.req.query("genre")` |

```text
/bands/pantera        ← route param (part of the path)
/bands?genre=metal    ← query param (after ?)
```

### 5. Why params are read inside the handler

You'll learn that query and route params belong to a **specific incoming request**. Hono only gives you access through `c` inside the route handler — not at the top of the file where no request exists yet.

### 6. Filtering collections

With query parameters, we'll filter band data:

```js
const filteredBands = bands.filter(
  (band) => band.genre === genre
);
```

```text
GET /bands              → return all bands
GET /bands?genre=metal  → filter and return metal bands
```

`filter()` returns **multiple matches**.

### 7. Finding a single resource

With route parameters, we'll find one band:

```js
const band = bands.find(
  (band) => band.name.toLowerCase() === bandName.toLowerCase()
);
```

`find()` returns **one item** (or `undefined`).

| URL | What happens |
| --- | --- |
| `/bands` | Return the full collection |
| `/bands?genre=metal` | Filter the collection |
| `/bands/pantera` | Find a single item |

### 8. Error handling with status codes

When a route param doesn't match anything:

```js
if (!band) {
  return c.json({ error: "Band not found" }, 404);
}
```

The second argument to `c.json()` sets the HTTP status. Without it, Hono returns `200` even for an error.

### 9. JavaScript patterns used in routing

We'll reinforce:

- **Ternary operator** — short if/else for filter logic
- **Nullish coalescing (`??`)** — fallback for missing values
- **Array copying (`[...bands]`)** — avoid mutating source data
- **`filter()` vs `find()`** — many items vs one item

### 10. A routing gotcha — duplicate routes

In `server.js`, two handlers are registered for `GET /bands`. Hono uses the **first** match — the second never runs.

That's why `server2.js` exists: one clean file with a single `GET /bands` route that handles filtering properly.

You'll learn that route order matters.

---

## What I DON'T want to do yet

I don't want to throw these at you:

- POST, PATCH, DELETE (creating, updating, deleting)
- request bodies (`await c.req.json()`)
- full CRUD operations
- validation of incoming data
- status codes beyond basic 404
- databases or persistent storage
- API design theory (REST conventions, etc.)

Those come in Project 03 and beyond. This project is about **reading** data from URLs — not changing it.

---

## The project we'll build

We'll use a music/bands theme with dummy data in `data/bands.js`.

```text
              BANDS ROUTING
                  │
        ┌─────────┴─────────┐
        │                   │
   GET /bands          GET /bands/:name
        │                   │
   collection            resource
        │                   │
  all or filtered      find one band
```

Two server files:

| File | Purpose |
| --- | --- |
| `src/server.js` | Route parameters — dynamic path segments like `/bands/:name` |
| `src/server2.js` | Query parameters, filtering, and finding a single band |

Try these URLs:

```text
GET /bands
GET /bands?genre=metal
GET /bands/korn
GET /bands/pantera/albums/issues
```

The important part is that you'll understand **why** each URL shape exists and **how** Hono extracts values from it.

---

## One important distinction from your CRUD project

This project teaches you:

> How to **read and filter** data based on the URL.

Project 03 will teach you:

> How to **create, update, and delete** data via HTTP methods.

Right now, every route is GET. You're learning to navigate data — not change it.
