# Project 03 — CRUD API

This project builds a small bands CRUD API with Hono. Work through the sections below in order — each concept section ends with a short Postman checkpoint so you can test what you just built.

For setup and core Hono concepts, see [`docs/hono.md`](../docs/hono.md).

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
mkdir 03-crud-api
cd 03-crud-api
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
npm pkg set scripts.dev="nodemon --watch src --exec node src/server.js"
```

### 6. Create `data/bands.js`

```bash
mkdir data
```

Create `data/bands.js` with:

```js
const bands = [
  { id: 1, name: "Pantera", genre: "Metal", formed: 1981 },
  { id: 2, name: "Korn", genre: "Nu Metal", formed: 1993 },
  { id: 3, name: "Gojira", genre: "Progressive Metal", formed: 1996 },
  { id: 4, name: "Sleep Token", genre: "Alternative Metal", formed: 2016 },
];

export default bands;
```

### 7. Create `src/server.js`

```bash
mkdir src
```

Create `src/server.js` with the CRUD routes. Start with the GET routes, then add POST, PATCH, and DELETE as you work through this readme — or copy the full file from the repo if you want everything at once.

Minimal starting point (GET routes only):

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import bands from "../data/bands.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Bands Crud API");
});

app.get("/bands", (c) => {
  return c.json(bands);
});

app.get("/bands/:id", (c) => {
  const id = c.req.param("id");

  if (isNaN(Number(id))) {
    return c.json({ error: "ID must be a number" }, 400);
  }

  const getBandById = bands.find((band) => band.id === Number(id));

  if (!getBandById) {
    return c.json({ error: `The band id: ${id} is not found` }, 404);
  }

  return c.json(getBandById);
});

serve({
  fetch: app.fetch,
  port: 2000,
});
```

Add POST, PATCH, and DELETE handlers as you reach each section below. The completed `src/server.js` in the repo has all routes in place.

### 8. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:2000`.

---

## Run this project (existing folder)

If you cloned the repo or already have this folder with a `package.json`, from the `03-crud-api` directory:

```bash
npm install
npm run dev
```

`npm install` with no package names reads `package.json` (and `package-lock.json` if present) and downloads everything into `node_modules/`.

Server runs at `http://localhost:2000`. Open Postman and click **+** to create a request. Pick the HTTP method from the **dropdown left of the URL** — do not type `GET` or `POST` into the URL box.

For POST and PATCH bodies, use **Body → raw → JSON**. Postman sets `Content-Type: application/json`, which your server needs for `await c.req.json()`.

---

## How to work through this project

```text
1. Start the server (see setup above)
2. Confirm GET routes work (Postman steps 1–2, or skip if already done)
3. Read "The API data flow" → test POST in Postman
4. Read "PATCH an existing band" → test PATCH in Postman
5. Read "DELETE a band" → test DELETE in Postman
6. Run the full 8-step test order to confirm everything works together
7. Try the error cases, then read the Summary
```

**Examples used throughout this readme** (so you always know which band to pick):

| Band | Id | Used for |
| --- | --- | --- |
| Pantera | `1` | GET one, PATCH |
| Korn | `2` | DELETE |
| Tool | *(new)* | POST — not in seed data |

Seed data also includes Gojira (`3`) and Sleep Token (`4`).

---

## The API data flow (POST)

### 1. Client sends a request

Example: Postman

```http
POST /bands
```

Body:

```json
{
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

The client is saying:

> "I want you to create a band using this information."

### 2. Hono receives it

```js
const body = await c.req.json();
```

Now:

```js
body = {
  name: "Tool",
  genre: "Progressive Metal",
  formed: 1990
}
```

This is **untrusted input**.

### 3. Server validates it

```js
if (!body.name || !body.genre || !body.formed) {
  return c.json(
    { error: "Missing required fields" },
    400
  );
}
```

The server asks:

> "Is this data acceptable?"

### 4. Server creates the resource

```js
const bandObj = {
  id: Date.now(),
  name: body.name,
  genre: body.genre,
  formed: body.formed,
};
```

Now the server owns the final shape:

```js
{
  id: 1785811295468,
  name: "Tool",
  genre: "Progressive Metal",
  formed: 1990
}
```

### 5. Server stores it

Currently:

```js
bands.push(bandObj);
```

Later:

```js
database.insert(bandObj);
```

Same idea.

### 6. Server responds

```js
return c.json(bandObj, 201);
```

Client receives:

```json
{
  "id": 1785811295468,
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

---

### Checkpoint — test your GET routes

If you have not tested read routes yet:

1. **GET** `http://localhost:2000/bands` — array of bands
2. **GET** `http://localhost:2000/bands/1` — single Pantera object

Details: [Testing in Postman → steps 1–2](#1-read--get-all-bands).

### Checkpoint — test your POST route

When your `app.post("/bands", ...)` handler is in place:

1. **POST** `http://localhost:2000/bands` with body:

```json
{
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

2. **GET** `http://localhost:2000/bands` — Tool should appear in the array.

Details and expected responses: [Testing in Postman → CREATE](#3-create--add-a-band).

---

## One more important backend idea

The **request shape** and the **response shape** do not have to be identical.

For example, the client sends:

```json
{
  "name": "Tool"
}
```

The server might return:

```json
{
  "id": 12345,
  "name": "Tool",
  "createdAt": "2026-08-04",
  "message": "Band created successfully"
}
```

The server is responsible for the API contract.

This also explains why the earlier thought about:

> "Do we need to create the JSON data first?"

was actually a good instinct.

The answer is:

- **For a real API** → you define the data model/schema first.
- **For this learning project** → our `bands.js` array is acting as our temporary database.

---

## PATCH an existing band

First, let's think like an API.

We have this existing data:

```json
{
  "id": 1,
  "name": "Pantera",
  "genre": "Metal",
  "formed": 1981
}
```

A user wants to change only the genre.

They send:

```http
PATCH /bands/1
```

Body:

```json
{
  "genre": "Groove Metal"
}
```

Notice something important:

They did not send:

```json
{
  "name": "Pantera",
  "genre": "Groove Metal",
  "formed": 1981
}
```

They only sent the thing they want changed.

That is the difference between:

| Method | Meaning |
| --- | --- |
| **PUT** | Replace the entire resource |
| **PATCH** | Modify part of the resource |

### Step 1 — Create the route

Add this below your POST route:

```js
app.patch("/bands/:id", async (c) => {

});
```

The `:id` means we need to find which band to update.

Example:

```http
PATCH /bands/1
```

Inside Hono:

```js
const id = c.req.param("id");
```

### Step 2 — Validate the ID

Same logic as your GET:

```js
if (isNaN(Number(id))) {
  return c.json(
    { error: "ID must be a number" },
    400
  );
}
```

### Step 3 — Find the band

We need the actual object in the array.

Remember `.find()`?

You already used it:

```js
const getBandById = bands.find(
  (band) => band.id === Number(id)
);
```

We do the same thing:

```js
const band = bands.find(
  (band) => band.id === Number(id)
);
```

### Step 4 — If it doesn't exist

Example:

```http
PATCH /bands/999
```

We need:

```json
{
  "error": "Band not found"
}
```

with status `404`.

### Your turn

If you are building along, write the first part of your PATCH handler:

```js
app.patch("/bands/:id", async (c) => {

});
```

Include:

- Get the `id`
- Check if it is a number
- Find the band
- Return `404` if it doesn't exist

If `server.js` already has the full PATCH route, skip ahead to the checkpoint below.

### Checkpoint — test your PATCH route

1. **PATCH** `http://localhost:2000/bands/1` with body:

```json
{
  "genre": "Groove Metal"
}
```

2. **GET** `http://localhost:2000/bands/1` — genre should be `Groove Metal`; `name` and `formed` stay the same.

Details: [Testing in Postman → UPDATE](#5-update--patch).

---

## DELETE a band

DELETE removes a resource by id. No JSON body is needed.

Your route `app.delete("/bands/:id", ...)` follows the same pattern as GET and PATCH:

1. Read `id` from the URL
2. Validate it is a number
3. Find the band's **index** in the array with `findIndex()`
4. If index is `-1`, return `404`
5. Remove it with `splice(index, 1)`
6. Return the remaining bands

```text
Get id → findIndex() → find band → splice(index, 1) → remove band
```

### Checkpoint — test your DELETE route

1. **DELETE** `http://localhost:2000/bands/2` (Korn)
2. **GET** `http://localhost:2000/bands` — Korn should be gone.

Details: [Testing in Postman → DELETE](#7-delete--remove-a-band).

---

## Testing in Postman

Use this section as your full reference. If you hit the checkpoints above while reading, steps 3–8 will feel familiar — run the **recommended test order** below once to walk through the complete CRUD lifecycle.

Seed data: ids **1–4** (Pantera, Korn, Gojira, Sleep Token).

### Recommended test order

```text
① GET  /bands        → see existing data
② GET  /bands/1      → get one band
③ POST /bands        → create Tool
④ GET  /bands        → confirm Tool was created
⑤ PATCH /bands/1     → change Pantera's genre
⑥ GET  /bands/1      → confirm the change
⑦ DELETE /bands/2    → remove Korn
⑧ GET  /bands        → confirm Korn is gone
```

---

### 1. READ — Get all bands

1. Select **GET**
2. URL: `http://localhost:2000/bands`
3. Click **Send**

You should get an array of all bands:

```json
[
  {
    "id": 1,
    "name": "Pantera",
    "genre": "Metal",
    "formed": 1981
  },
  {
    "id": 2,
    "name": "Korn",
    "genre": "Nu Metal",
    "formed": 1993
  }
]
```

Your list may include more bands (Gojira, Sleep Token, etc.).

---

### 2. READ — Get one band

Pick an id from your data. If Pantera has `"id": 1`:

1. Select **GET**
2. URL: `http://localhost:2000/bands/1`
3. Click **Send**

You should get just that band:

```json
{
  "id": 1,
  "name": "Pantera",
  "genre": "Metal",
  "formed": 1981
}
```

This matches your route `app.get("/bands/:id", ...)`. The `:id` in the URL becomes `1`, and Hono reads it with `c.req.param("id")`.

---

### 3. CREATE — Add a band

1. Select **POST**
2. URL: `http://localhost:2000/bands`
3. **Body → raw → JSON**
4. Paste:

```json
{
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

5. Click **Send**

This is the same body from [The API data flow](#the-api-data-flow-post). Your server parses it with `await c.req.json()`, then builds the band (adding `id` via `Date.now()`).

Expected response (your `id` will differ):

```json
{
  "id": 1785811295468,
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

---

### 4. Verify the POST worked

1. Select **GET**
2. URL: `http://localhost:2000/bands`
3. Click **Send**

Your new Tool entry should appear in the array.

Good habit after any create:

```text
POST → create something → GET → verify it exists
```

---

### 5. UPDATE — PATCH

Pick an existing id (e.g. `1` for Pantera):

1. Select **PATCH**
2. URL: `http://localhost:2000/bands/1`
3. **Body → raw → JSON**
4. Send only the field you want to change:

```json
{
  "genre": "Groove Metal"
}
```

5. Click **Send**

Matches the example in [PATCH an existing band](#patch-an-existing-band). Your code merges the partial update with `Object.assign(getBandById, body)`.

So Pantera goes from `"genre": "Metal"` to `"genre": "Groove Metal"` — `name` and `formed` stay the same.

Expected response:

```json
{
  "id": 1,
  "name": "Pantera",
  "genre": "Groove Metal",
  "formed": 1981
}
```

You did not need to send `name` or `formed`. That is what **PATCH** means — change part of a resource, not replace the whole thing.

---

### 6. Verify the PATCH worked

1. Select **GET**
2. URL: `http://localhost:2000/bands/1`
3. Click **Send**

Confirm the genre (or whatever you changed) is updated.

---

### 7. DELETE — Remove a band

Remove Korn (`id: 2`) so you do not delete Pantera, which you patched in step 5:

1. Select **DELETE**
2. URL: `http://localhost:2000/bands/2`
3. No body — click **Send**

See [DELETE a band](#delete-a-band) for how `findIndex()` and `splice()` work in your route.

You get the remaining bands back:

```json
{
  "bands": [
    { "id": 1, "name": "Pantera", "genre": "Metal", "formed": 1981 },
    { "id": 3, "name": "Gojira", "genre": "Progressive Metal", "formed": 1996 }
  ]
}
```

(Exact list depends on what you created or deleted earlier.)

---

### 8. Verify the DELETE worked

1. Select **GET**
2. URL: `http://localhost:2000/bands`
3. Click **Send**

The deleted band should no longer appear.

---

### Extra: root health check

| Field | Value |
| --- | --- |
| Method | `GET` |
| URL | `http://localhost:2000/` |

Expected response — plain text: `Bands Crud API`

---

### Extra: error cases to try

Once the happy path works, try these to see how your API handles bad input:

| Request | Expected |
| --- | --- |
| `GET /bands/abc` | `400` — `{ "error": "ID must be a number" }` |
| `GET /bands/999` | `404` — `{ "error": "The band id: 999 is not found" }` |
| `POST /bands` with missing `"formed"` | `400` — `{ "error": "Missing required fields" }` |
| `POST /bands` with duplicate name (e.g. Tool twice) | `409` — `{ "error": "Band already exists" }` |
| `PATCH /bands/999` | `404` — band not found |
| `DELETE /bands/999` | `404` — band not found |

---

## Summary

### The big concepts you have learned in Project 03

### 1. Hono routing

You now understand:

```js
app.get("/bands/:id", ...)
```

is not connected to your data.

The route just says:

> "If someone requests this URL pattern, run this function."

The data work happens inside:

```js
bands.find(...)
bands.filter(...)
Object.assign(...)
```

That distinction was one of your earlier questions, and you nailed it.

### 2. Request → Logic → Response

Your API now follows this pattern:

```text
HTTP Request
      |
      ↓
Hono Route
      |
      ↓
JavaScript Logic
      |
      ↓
JSON Response
```

Example:

```text
PATCH /bands/1
        ↓
Find band with id 1
        ↓
Apply changes
        ↓
Return updated JSON
```

This pattern is everywhere in backend development.

### 3. Client data vs server data

This was probably the biggest lightbulb moment.

Client sends:

```json
{
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

Server creates:

```json
{
  "id": 1785811295468,
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

The server is responsible for the final resource.

That idea will carry over when we eventually use databases.

### 4. HTTP status codes

You now have practical experience with:

**200 OK**

Successful request

**201 Created**

Resource created

(we can improve your POST to use this)

**400 Bad Request**

The client sent bad data

Example:

```json
{
  "name": ""
}
```

**404 Not Found**

Resource doesn't exist

Example:

```http
GET /bands/999
```

**409 Conflict**

Resource clashes with existing data

Example:

- Create Tool
- Tool already exists

### 5. JavaScript concepts used

You reinforced:

**`.find()`**

Find one item.

**`.filter()`**

Find many items.

**`.push()`**

Add an item.

**`Object.assign()`**

Merge objects.

**`async/await`**

Handle promises.
