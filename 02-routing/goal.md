# Project 02 — Routing

The goal isn't to build a full API yet. It's to learn **how Hono connects URLs to JavaScript functions** — and how to read dynamic data from the request.

---

## Where we are in the progression

```text
01 Basic Server
        ↓
02 Routing          ← we're here
        ↓
03 CRUD API
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
| `/bands/pantera` | Find a single band |

### 7b. Nested resources — band **and** album (two route params)

This is a **different** URL shape from `/bands/:name` alone. The path names **two** resources: which band, then which album under that band.

#### Reading the route pattern vs the browser URL

You register a **pattern** in code. The browser sends a **concrete path**. Hono compares them segment by segment.

```js
app.get("/bands/:name/albums/:album", (c) => {
  // handler runs when the path matches the pattern above
});
```

Pattern in your editor:

```text
/bands/:name/albums/:album
```

Example request in the browser (or with curl):

```text
GET /bands/pantera/albums/cowboys-from-hell
```

Not everything in the pattern changes. Split it like this:

| Piece in pattern | What it is | Must match in the URL? | Example value from the request above |
| --- | --- | --- | --- |
| `bands` | **Fixed path segment** (literal text) | Yes — exact word `bands` | `bands` |
| `:name` | **Route parameter** (placeholder) | Any single segment — Hono saves it | `pantera` |
| `albums` | **Fixed path segment** (literal text) | Yes — exact word `albums` | `albums` |
| `:album` | **Route parameter** (placeholder) | Any single segment — Hono saves it | `cowboys-from-hell` |

- **Fixed segments** (`bands`, `albums`): you chose these words when you designed the API. Every matching request must include them spelled exactly that way. They are **not** variables and they do **not** use `:`.
- **Placeholders** (`:name`, `:album`): the `:` tells Hono “capture whatever the client put in this slot.” The label after `:` (`name`, `album`) is only for your code — you use the same label in `c.req.param("name")` and `c.req.param("album")`.

```text
Pattern:  /bands/:name/albums/:album
              │      │       │      │
              │      │       │      └── placeholder → album slug
              │      │       └── fixed word "albums"
              │      └── placeholder → band name
              └── fixed word "bands"

Request:  /bands/pantera/albums/cowboys-from-hell
```

After a match, read the captured placeholders inside the handler:

```js
const bandName = c.req.param("name");   // "pantera"
const albumSlug = c.req.param("album"); // "cowboys-from-hell"
```

The word `albums` in the **URL path** is just routing structure (“albums live under a band”). The `albums` **array** on each band in `data/bands.js` is your JSON data — same word, different job.

Another valid request (same pattern, different placeholder values):

```text
GET /bands/korn/albums/issues
```

| Segment in request | Matched against | Value Hono captures |
| --- | --- | --- |
| `korn` | `:name` | `"korn"` |
| `issues` | `:album` | `"issues"` |

Each band in `data/bands.js` has an `albums` array (real studio albums; `slug` matches the URL segment):

```js
{
  id: 2,
  name: "Korn",
  genre: "nu-metal",
  albums: [
    { id: 4, slug: "issues", title: "Issues", year: 1999 },
    // ...
  ],
}
```

Handler pattern in Hono (`server.js`):

```js
app.get("/bands/:name/albums/:album", (c) => {
  const bandName = c.req.param("name");
  const albumSlug = c.req.param("album");

  const band = bands.find(
    (b) => b.name.toLowerCase() === bandName.toLowerCase()
  );
  if (!band) {
    return c.json({ error: "Band not found" }, 404);
  }

  const album = band.albums.find(
    (a) => a.slug.toLowerCase() === albumSlug.toLowerCase()
  );
  if (!album) {
    return c.json({ error: "Album not found" }, 404);
  }

  return c.json(album);
});
```

| URL | What happens |
| --- | --- |
| `GET /bands/korn/albums/issues` | Resolve Korn, then find album with slug `issues` → return that album JSON |
| `GET /bands/pantera/albums/cowboys-from-hell` | Pantera + that album |
| `GET /bands/korn/albums/follow-the-leader` | Korn + that album |
| `GET /bands/pantera/albums/unknown` | Band exists, album slug missing → 404 |
| `GET /bands/not-a-band/albums/issues` | Band missing → 404 (album lookup never matters) |

```text
/bands/korn/albums/issues  = the "Issues" album resource belonging to Korn
```

Still **GET only** — you're navigating nested data, not creating albums.

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

Try these URLs (default `npm run dev` runs `server2.js`):

```text
GET /bands
GET /bands?genre=metal
GET /bands/korn
```

The nested album route lives in `server.js` only:

```text
GET /bands/korn/albums/issues
```

The important part is that you'll understand **why** each URL shape exists and **how** Hono extracts values from it.

---

## One important distinction from your CRUD project

This project teaches you:

> How to **read and filter** data based on the URL.

Project 03 will teach you:

> How to **create, update, and delete** data via HTTP methods.

Right now, every route is GET. You're learning to navigate data — not change it.
