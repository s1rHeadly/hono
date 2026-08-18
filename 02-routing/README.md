# Hono Project 02 — Routing Reference Guide

This project builds on [Project 01](../01-basic-server/) and explores how Hono connects URLs to JavaScript functions.

For setup and core Hono concepts, see [`docs/hono.md`](../docs/hono.md) and the [Project 01 README](../01-basic-server/readme.md).

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
mkdir 02-routing
cd 02-routing
```

### 2. Initialize npm

```bash
npm init -y
```

### 3. Install Hono and the Node adapter

```bash
npm install hono @hono/node-server
```

### 4. Install nodemon (development only)

```bash
npm install --save-dev nodemon
```

### 5. Configure `package.json`

```bash
npm pkg set type=module
npm pkg set scripts.dev="nodemon --watch src --exec node src/server2.js"
```

The default `dev` script runs `src/server2.js` — the complete version with band data, genre filtering, and single-band lookup. To experiment with route parameters only, point the script at `src/server.js` instead:

```bash
npm pkg set scripts.dev="nodemon --watch src --exec node src/server.js"
```

### 6. Create `data/bands.js`

```bash
mkdir data
```

Create `data/bands.js` with:

```js
const bands = [
  { id: 1, name: "Pantera", genre: "metal" },
  { id: 2, name: "Korn", genre: "nu-metal" },
  { id: 3, name: "Slayer", genre: "thrash" },
  { id: 4, name: "Metallica", genre: "thrash" },
  { id: 5, name: "Megadeth", genre: "thrash" },
  { id: 6, name: "Iron Maiden", genre: "heavy" },
  { id: 7, name: "Black Sabbath", genre: "classic" },
];

export default bands;
```

### 7. Create `src/server2.js`

```bash
mkdir src
```

Create `src/server2.js` with:

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import bands from "../data/bands.js";

const app = new Hono();

app.get("/bands", (c) => {
  const genre = c.req.query("genre");

  const filteredGenre = genre
    ? bands.filter((band) => band.genre === genre)
    : [...bands];

  return c.json(filteredGenre);
});

app.get("/bands/:name", (c) => {
  const bandName = c.req.param("name");

  const band = bands.find(
    (band) => band.name.toLowerCase() === bandName.toLowerCase(),
  );

  if (!band) {
    return c.json({ error: `The band: ${bandName} is not found` }, 404);
  }

  return c.json(band);
});

serve({
  fetch: app.fetch,
  port: 2000,
});
```

`src/server.js` in the repo is an earlier learning file for route and query parameters (including the duplicate-route gotcha). You can add it later while working through the guide below.

### 8. Start the server

```bash
npm run dev
```

Try these URLs in a browser:

- `http://localhost:2000/bands` — all bands (JSON)
- `http://localhost:2000/bands?genre=metal` — bands filtered by genre
- `http://localhost:2000/bands/korn` — one band by name

---

## Run this project (existing folder)

If you cloned the repo or already have this folder with a `package.json`, from the `02-routing` directory:

```bash
npm install
npm run dev
```

`npm install` with no package names reads `package.json` (and `package-lock.json` if present) and downloads everything into `node_modules/`.

This runs `src/server2.js` by default. To experiment with route parameters only, change the `dev` script in `package.json` to point at `src/server.js` instead.

Try these URLs in a browser:

- `http://localhost:2000/bands` — all bands (JSON)
- `http://localhost:2000/bands?genre=metal` — bands filtered by genre
- `http://localhost:2000/bands/korn` — one band by name (`server2.js`)
- `http://localhost:2000/bands/pantera` — route param example (`server.js`)

### Files in this project

| File | Purpose |
|---|---|
| `src/server.js` | Route parameters — dynamic path segments like `/bands/:name` |
| `src/server2.js` | Query parameters, filtering, and finding a single band |
| `data/bands.js` | Dummy band data used by `server2.js` |

---

## Overview

Routing is the process of telling the server:

> "When a request comes to this URL, run this function."

In Hono, routes connect:

```
HTTP Request
      |
      ↓
Hono Route
      |
      ↓
JavaScript Logic
      |
      ↓
Response (JSON / HTML / Text)
```

Example:

```js
app.get("/", (c) => {
  return c.text("Hello Hono");
});
```

This means:

```
GET http://localhost:2000/
```

will run that function.

The `(c)` argument is the **context** object. It gives you access to the incoming request (`c.req`) and response helpers (`c.text`, `c.json`, etc.).

---

## 1. Basic routes

### GET route

```js
app.get("/bands", (c) => {
  return c.json(bands);
});
```

The URL:

```
/bands
```

is called the **route path**.

The variable:

```js
bands
```

is just JavaScript data. They are **not** connected because they have the same name.

Example:

```js
const musicGroups = [
  { name: "Pantera" }
];

app.get("/bands", (c) => {
  return c.json(musicGroups);
});
```

The URL is still `/bands`, but the returned data comes from `musicGroups`.

---

## 2. Route parameters

Route parameters are dynamic values **inside the URL path**.

From `src/server.js`:

```js
app.get("/bands/:name", (c) => {
  const bandName = c.req.param("name");
  return c.text(`Band requested: ${bandName}`);
});
```

Request:

```
/bands/pantera
```

Hono extracts:

```js
bandName = "pantera"
```

The `:name` is a placeholder. The value in the URL replaces it.

| Request | What Hono captures |
|---|---|
| `GET /bands/pantera` | `bandName = "pantera"` |
| `GET /bands/korn` | `bandName = "korn"` |

**Remember:** route params identify **which resource** you want.

`/bands/pantera` = the Pantera band resource.

### Multiple route parameters

```js
app.get("/bands/:name/albums/:album", (c) => {
  const bandName = c.req.param("name");
  const albumName = c.req.param("album");

  return c.text(`${bandName} - ${albumName}`);
});
```

Request:

```
/bands/korn/albums/issues
```

Returns:

```
korn - issues
```

---

## 3. Query parameters

Query parameters are optional values added **after `?`**.

Example:

```
/bands?genre=metal
```

The route is still `/bands`. The query changes **how** the data is returned.

Read a query inside the handler:

```js
const genre = c.req.query("genre");
```

Example:

```js
app.get("/bands", (c) => {
  const genre = c.req.query("genre");

  return c.json({
    requestedGenre: genre
  });
});
```

Request:

```
/bands?genre=metal
```

Result:

```json
{
  "requestedGenre": "metal"
}
```

### Route params vs query params

| | Route parameter | Query parameter |
|---|---|---|
| **Purpose** | Identify a specific resource | Filter, sort, or modify results |
| **Example URL** | `/bands/pantera` | `/bands?genre=metal` |
| **Meaning** | Give me the Pantera resource | Give me bands, but only metal ones |
| **How to read** | `c.req.param("name")` | `c.req.query("genre")` |

Do not confuse them:

```
/bands/pantera        ← route param (part of the path)
/bands?genre=metal    ← query param (after ?)
```

### Using both together

```js
app.get("/bands/:name/albums", (c) => {
  const bandName = c.req.param("name");   // from the path
  const sort = c.req.query("sort");       // from the query string

  return c.json({ band: bandName, sortOrder: sort });
});
```

Request: `GET /bands/pantera/albums?sort=latest`

- `bandName = "pantera"` (route param)
- `sort = "latest"` (query param)

### Q: Why read the query inside `app.get()`?

The query belongs to a **specific incoming request**. Hono only gives you access to that request inside the route handler through `c`.

When you visit `http://localhost:2000/bands?genre=metal`:

1. The browser sends `GET /bands?genre=metal`
2. Hono finds `app.get("/bands", (c) => { ... })`
3. Hono runs that function
4. Inside the function, `c` represents **this specific request**

```
Browser
   |
   |  GET /bands?genre=metal
   v
Hono router
   |
   v
app.get("/bands", (c) => { ... })
                    ^
                    |
             this request
```

This would **not** work at the top of the file:

```js
const genre = c.req.query("genre");  // no request exists yet

app.get("/bands", (c) => {
  // ...
});
```

At that point, no browser has requested anything. There is no `c`. There is no query string.

The server handles many requests over time — each with a different query. The handler must read the query **for that request, when it arrives**.

Route params work the same way — you read `c.req.param("name")` inside the handler because `name` comes from the specific request that matched `/bands/:name`.

### Q: What if there is no `genre` query parameter?

With the approach in `src/server2.js`:

```js
const genre = c.req.query("genre");

const filteredGenre = genre
  ? bands.filter((band) => band.genre === genre)
  : [...bands];
```

| Request | What happens |
|---|---|
| `GET /bands` | No `genre` — `c.req.query("genre")` returns `undefined` → return all bands |
| `GET /bands?genre=metal` | `genre = "metal"` → filter and return metal bands |
| `GET /bands?genre=` | Empty string `""` → still falsy → return all bands |

Later you may want to decide what to do when someone requests a genre that does not exist — return `[]`, a 404, or a validation error.

---

## 4. Filtering data

When working with query parameters, we usually use JavaScript array methods.

```js
const filteredBands = bands.filter(
  (band) => band.genre === genre
);
```

`filter()` returns **multiple matches**:

```json
[
  { "name": "Pantera", "genre": "metal" },
  { "name": "Metallica", "genre": "metal" }
]
```

### Complete filtering example

From `src/server2.js`:

```js
app.get("/bands", (c) => {
  const genre = c.req.query("genre");

  const filteredGenre = genre
    ? bands.filter((band) => band.genre === genre)
    : [...bands];

  return c.json(filteredGenre);
});
```

Flow:

```
GET /bands
       |
       ↓
No genre
       |
       ↓
Return all bands


GET /bands?genre=metal
       |
       ↓
Read genre from query
       |
       ↓
Filter bands
       |
       ↓
Return matches
```

---

## 5. Finding one resource

When using a route parameter like `/bands/pantera`, we usually use `find()` instead of `filter()`.

From `src/server2.js`:

```js
app.get("/bands/:name", (c) => {
  const bandName = c.req.param("name");

  const band = bands.find(
    (band) => band.name.toLowerCase() === bandName.toLowerCase()
  );

  if (!band) {
    return c.json({ error: `The band: ${bandName} is not found` }, 404);
  }

  return c.json(band);
});
```

| Method | Purpose |
|---|---|
| `filter()` | Return many items |
| `find()` | Return one item (or `undefined`) |

Request: `GET /bands/korn` → returns the Korn object.

Request: `GET /bands/unknown` → returns a 404 with an error message.

---

## 6. Copying arrays

Avoid accidentally changing your original data.

Bad:

```js
const newBands = bands;
```

Both variables point to the **same array**. If you change one, you change both.

Good:

```js
const newBands = [...bands];
```

Creates a **new array**. The route always returns a copy, so later code cannot accidentally mutate your source data.

Used in `server2.js` when returning all bands:

```js
: [...bands]
```

---

## 7. Nullish coalescing (`??`)

Used when you want a fallback for **missing** values.

```js
const genre = c.req.query("genre") ?? "all";
```

Meaning:

```
If genre is null or undefined → use "all"
Otherwise                   → use genre
```

`??` only handles `null` and `undefined`. It does **not** handle an empty string:

```
/bands?genre=
```

`c.req.query("genre")` returns `""`, and `??` will **not** replace it with `"all"`.

An alternative approach (used in `server2.js`) is a simple truthy check:

```js
const genre = c.req.query("genre");

const filteredGenre = genre
  ? bands.filter((band) => band.genre === genre)
  : [...bands];
```

This treats `undefined`, `null`, and `""` the same way — all return all bands.

---

## 8. Ternary operator

A short version of if/else.

Syntax:

```js
condition ? valueIfTrue : valueIfFalse
```

Example:

```js
const result =
  genre !== "all"
    ? bands.filter((band) => band.genre === genre)
    : [...bands];
```

Equivalent:

```js
let result;

if (genre !== "all") {
  result = bands.filter((band) => band.genre === genre);
} else {
  result = [...bands];
}
```

Used throughout `server2.js` for the genre filter logic.

---

## 9. Error handling

A route parameter may not match anything in your data.

Example:

```
/bands/unknown
```

`find()` returns `undefined`. Handle it:

```js
if (!band) {
  return c.json(
    { error: "Band not found" },
    404
  );
}
```

The second argument `404` sets the HTTP status code. Without it, Hono would return `200` even for an error.

---

## 10. Duplicate routes (a gotcha from `server.js`)

In `src/server.js`, two handlers are registered for `GET /bands`:

```js
app.get("/bands", (c) => {
  return c.text("List of Bands");
});

// ... later in the file ...

app.get("/bands", (c) => {
  const genreQuery = c.req.query("genre");
  return c.text(`Genre filter: ${genre}`);
});
```

Hono uses the **first** matching route. So `GET /bands?genre=metal` still hits the first handler and returns `"List of Bands"` — the query handler never runs.

That is why `server2.js` was created: one clean file with a single `GET /bands` route that handles filtering properly.

---

## Final mental model

When a request arrives:

```
Browser
   |
GET /bands/pantera
   |
   ↓
Hono matches route
   |
   ↓
Read params / query (inside handler)
   |
   ↓
JavaScript finds or filters data
   |
   ↓
Return response
```

| URL | What happens |
|---|---|
| `/bands` | Return the full collection |
| `/bands?genre=metal` | Filter the collection |
| `/bands/pantera` | Find a single item |

### Quick reference

| Concept | Where in the URL | How to read in Hono |
|---|---|---|
| Route param | Part of the path: `/bands/:name` | `c.req.param("name")` |
| Query param | After `?`: `/bands?genre=metal` | `c.req.query("genre")` |

Both are read **inside** the route handler, because both belong to the incoming request that `c` represents.

---

## Project 02 skills completed

- Hono route creation
- GET routes
- Route parameters
- Multiple parameters
- Query parameters
- Filtering collections
- Finding single resources
- Ternary operators
- Nullish coalescing
- Array copying
- Basic API thinking
- 404 responses

---

## Next project

### Project 03 — Building a CRUD API

Topics:

- POST requests
- Request bodies
- Creating data
- Updating data
- Deleting data
- Validation
- Status codes
- Better project structure
