# Project 03 — CRUD API

The goal isn't to learn API design theory yet. It's to learn **how to implement CRUD** — create, read, update, and delete resources using HTTP methods, request bodies, and status codes.

---

## Where we are in the progression

```text
01 Basic Server
        ↓
02 Routing
        ↓
03 Request Data    ← we're here
        ↓
04 API Design
        ↓
05 Mini API Project
        ↓
06 Structured App
```

---

## What I'll teach you

### 1. Full CRUD operations

We'll build a bands API with all four operations:

| Method | Route | Action |
| --- | --- | --- |
| GET | `/bands` | List all bands |
| GET | `/bands/:id` | Get one band |
| POST | `/bands` | Create a band |
| PATCH | `/bands/:id` | Partially update a band |
| DELETE | `/bands/:id` | Remove a band |

You've already used GET in Project 02. Now you'll add the write operations.

### 2. Reading request bodies

For POST and PATCH, the client sends data in the body:

```http
POST /bands
```

```json
{
  "name": "Tool",
  "genre": "Progressive Metal",
  "formed": 1990
}
```

We'll parse it:

```js
const body = await c.req.json();
```

You'll learn that this is **untrusted input** — the server must validate it before using it.

### 3. Async route handlers

Reading a request body returns a Promise, so POST and PATCH handlers are `async`:

```js
app.post("/bands", async (c) => {
  const body = await c.req.json();
  // ...
});
```

This is the first time you'll use `async/await` in a Hono route.

### 4. Validation

Before creating or updating, we'll check the data:

```js
if (!body.name || !body.genre || !body.formed) {
  return c.json({ error: "Missing required fields" }, 400);
}
```

The server asks:

> "Is this data acceptable?"

We'll also validate route params — rejecting non-numeric IDs:

```js
if (isNaN(Number(id))) {
  return c.json({ error: "ID must be a number" }, 400);
}
```

### 5. Client data vs server data

This is a big idea.

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

The server is responsible for the **final resource shape** — including fields the client didn't send (like `id`). That idea carries over when you eventually use databases.

### 6. HTTP status codes in practice

You'll use status codes with real meaning:

**Success**

- `200` — successful read, update, or delete
- `201` — resource created (POST)

**Client errors**

- `400` — bad request (missing fields, invalid ID format)
- `404` — resource not found
- `409` — conflict (duplicate band name)

Example conflict:

```js
if (existingBand) {
  return c.json({ error: "Band already exists" }, 409);
}
```

### 7. PATCH — partial updates

PATCH modifies **part** of a resource, not the whole thing:

```js
Object.assign(getBandById, body);
```

Send only the fields you want to change:

```json
{ "genre": "Groove Metal" }
```

The rest of the band object stays intact.

### 8. DELETE — removing resources

We'll find the band's index and remove it:

```js
bands.splice(bandIndex, 1);
```

You'll learn the difference between `find()` (returns the item) and `findIndex()` (returns the position) — and why DELETE needs the index.

### 9. In-memory data storage

For now, data lives in a JavaScript array:

```js
bands.push(bandObj);      // create
Object.assign(band, body); // update
bands.splice(index, 1);    // delete
```

Data resets when the server restarts. That's fine — the patterns are the same whether you use an array or a database later.

### 10. Testing with Postman

We'll test every operation with Postman:

1. GET all bands
2. GET one band
3. POST a new band
4. PATCH an existing band
5. DELETE a band
6. Error cases (400, 404, 409)

You'll learn to pick the HTTP method from the dropdown — not type `GET` or `POST` into the URL box.

---

## What I DON'T want to do yet

I don't want to throw these at you:

- API design theory (REST conventions, URL naming debates)
- authentication or authorization
- databases (SQLite, PostgreSQL, etc.)
- JWT or sessions
- middleware
- OpenAPI / Swagger
- controllers, services, or layered architecture
- advanced validation libraries (Zod, etc.)

Those are useful eventually, but they'd distract from the core lesson: **implementing CRUD with HTTP**.

---

## The project we'll build

A bands CRUD API using seed data (Pantera, Korn, Gojira, Sleep Token):

```text
              BANDS CRUD API
                  │
        ┌─────────┴─────────┐
        │                   │
      /bands            /bands/:id
        │                   │
   collection            resource
        │                   │
   GET / POST          GET / PATCH / DELETE
```

Seed data for testing:

| Band | Id | Used for |
| --- | --- | --- |
| Pantera | `1` | GET one, PATCH |
| Korn | `2` | DELETE |
| Tool | *(new)* | POST — not in seed data |

The important part is that you'll **implement each operation yourself** and test it in Postman before moving on.

---

## One important distinction from Project 04

This project teaches you:

> How to **implement** CRUD.

Project 04 will teach you:

> How to **decide** what your API should look like.

You can have an API that technically works but is badly designed. CRUD implementation comes first; design thinking comes next.

Our goal here is to get you comfortable with the full request lifecycle — body parsing, validation, creating resources, returning the right status codes — so that when we talk about API design, you already know how to build what we design.
