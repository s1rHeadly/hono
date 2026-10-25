# Project 04 — API Design

This project is about **how to design a good API** — not new Hono syntax. You work through the notes and design endpoints before (or alongside) implementing them.

For background, see [Project 03 — CRUD API](../03-crud-api/readme.md) (the API you built there is the reference implementation) and [`docs/hono.md`](../docs/hono.md).

Study materials in this folder:

| File | Purpose |
| --- | --- |
| [`notes/goal.md`](notes/goal.md) | What this project covers and why |
| [`notes/apidesign_notes1.md`](notes/apidesign_notes1.md) | API design notes (part 1) |
| [`notes/apidesign_notes2.md`](notes/apidesign_notes2.md) | API design notes (part 2) |

GET is already implemented in `src/server.js`. Next we add POST, PATCH, and DELETE. Use [Project 03](../03-crud-api/) as the reference CRUD implementation.

---

## Prerequisites

Install [Node.js](https://nodejs.org/) (LTS is fine). This folder uses Hono the same way as the earlier projects.

Check Node and npm are available:

```bash
node -v
npm -v
```

---

## Create this project from scratch

Assume you are setting up the `04-api-design` folder with no files yet.

### 1. Create the project folder

```bash
mkdir 04-api-design
cd 04-api-design
```

### 2. Initialize npm

Creates a `package.json` so the folder matches the other numbered projects.

```bash
npm init -y
npm install hono @hono/node-server
npm install --save-dev nodemon
npm pkg set type=module
npm pkg set scripts.dev="nodemon --watch src --exec node src/server.js"
mkdir data src notes
```

If you cloned the repo, `package.json` already exists — skip this and run `npm install` instead.

### 3. Add the study files and starter code

Create or copy these files into `notes/`:

- `notes/goal.md`
- `notes/apidesign_notes1.md`
- `notes/apidesign_notes2.md`

Also add `data/bands.js` and `src/server.js` (GET routes first — POST, PATCH, and DELETE come later). If you cloned `hono-learning`, they are already here.

### 4. Work through the material

1. Read [`notes/goal.md`](notes/goal.md) for the learning goals.
2. Work through [`notes/apidesign_notes1.md`](notes/apidesign_notes1.md) and [`notes/apidesign_notes2.md`](notes/apidesign_notes2.md).
3. Implement and test against this project's server (`npm run dev` in `04-api-design`).

---

## Run this project

```bash
cd 04-api-design
npm install
npm run dev
```

That starts `src/server.js` at `http://localhost:2000`.

To compare against the finished CRUD API from Project 03, run that server instead. Both use port 2000, so only one at a time:

```bash
cd ../03-crud-api
npm install
npm run dev
```

---

## What you'll learn

- REST-style URL and HTTP method conventions
- Resources vs actions in URL design
- Designing collections vs single resources
- Query parameters for filtering and sorting
- Status codes and error response shapes
- Designing the API contract **before** implementing it

See [`notes/goal.md`](notes/goal.md) for the full outline.

---

## POST, PATCH, and DELETE

GET reads data. These three methods **change** it:

| Method | What it does | Typical URL |
| --- | --- | --- |
| POST | Create a new resource | `/bands` |
| PATCH | Update part of an existing resource | `/bands/:id` |
| DELETE | Remove a resource | `/bands/:id` |

Today we start with POST. PATCH and DELETE come next.

### POST — how it works

POST adds a new item to a collection. The collection is `bands`. The new item is a band object.

**Before POST**

```text
bands
 ↓
[band, band, band, band]
```

**The request**

```text
POST /bands
 ↓
new band object
 ↓
add it to bands
```

**After POST**

```text
bands
 ↓
[band, band, band, band, NEW BAND]
```

The collection grew by one. That is the job of POST: take a new resource from the client, add it to the collection, and return what was created.

Later we will also validate the body and let the server set fields like `id`. Those steps do not change this picture — they happen *before* the new band is pushed.

### POST — the request flow

Now let's do this the way we've been learning.

Imagine the client sends:

```json
{
  "name": "Tool",
  "genre": "Alternative Metal"
}
```

Your Hono endpoint needs to:

```text
POST /bands
      ↓
Get the data from the request
      ↓
Create the new band object
      ↓
Add it to the bands array
      ↓
Return the newly created band
```

And there's one important question:

**Where does the data come from?**

With GET, we were getting information from the URL/query string:

```js
c.req.query("genre")
```

But with POST, the new band's data will normally be in the **request body**.

In Hono, you'll encounter:

```js
await c.req.json()
```

So our pseudocode becomes:

```text
POST /bands
     ↓
Get the request body
     ↓
Create/add the new band
     ↓
Return the new band
```

The first step — get the request body — in Hono is:

```js
const body = await c.req.json();
```

Because the body we're expecting is JSON.

For example, the client sends:

```json
{
  "name": "Tool",
  "genre": "Alternative Metal"
}
```

Then:

```js
const body = await c.req.json();
```

gives us an object:

```js
body.name   // "Tool"
body.genre  // "Alternative Metal"
```

That's the **client's** data. Existing bands in `data/bands.js` also have `id` and `formed`. The server will usually add those when it creates the resource — we are not there yet.

We're not replacing the existing bands array.

We're modifying it by adding one new object to it.

Think of it like this:

```text
SERVER
  │
  ├── bands array
  │
  │   [
  │     Pantera,
  │     Korn,
  │     Metallica,
  │     Nirvana,
  │     Slayer
  │   ]
  │
  │
  │   POST /bands
  │        ↓
  │   request body
  │        ↓
  │      Tool
  │
  │        ↓
  │   bands.push(...)
  │
  └── bands array
      [
        Pantera,
        Korn,
        Metallica,
        Nirvana,
        Slayer,
        Tool        ← NEW
      ]
```

So:

```js
bands.push(body);
```

means:

> Take the existing bands array and add this new band to it.

That line is the **idea** of POST: append one object. When we write the handler, we will probably push a new band object built *from* `body` (with an `id`, and any other fields the server owns) rather than the raw body as-is.

It does not mean:

```js
bands = body;
```

which would replace the whole array. In this project that would also fail in JavaScript: `bands` is an imported binding, so you can mutate it with `.push()`, but you cannot reassign it.

So the mental model is:

```text
GET
Client → "Give me bands"
Server → bands


POST
Client → "Here's a new band"
Server → adds it to bands
```

That's a really important distinction between GET and POST.
