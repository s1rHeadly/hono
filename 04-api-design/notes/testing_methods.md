# Testing CRUD Methods

You can't send a `POST`, `PATCH`, or `DELETE` request from the browser address bar — only `GET`. But JavaScript can send any HTTP method.

Open the browser console and use `fetch()`.

Rule of thumb: when you use `fetch()` with anything other than `GET` (so `POST`, `PATCH`, or `DELETE`), the request result you see in the browser is not always the full story. To confirm the server’s current state, immediately “refetch” with a follow-up `GET` (either `GET /bands` or `GET /bands/:id`) and compare what the server returns.

**Important:** Even though you're running these commands in the browser, the server-side `console.log` output appears in your **IDE terminal** (where you started the Hono server), not in the browser console. Check both places — the browser shows the HTTP response; the terminal shows what your route handlers logged.

Make sure your server is running first:

```bash
node src/server.js
```

Base URL: `http://localhost:2000`

---

## Mental model

| Client | What it sends |
|--------|----------------|
| Browser address bar | `GET` only |
| Browser `fetch()` | Any HTTP method |

Same URL, different HTTP method = a completely different Hono route.

Example — `http://localhost:2000/bands/3`:

- Address bar → `GET /bands/3` (no route for this yet — you'd get a 404)
- `fetch(..., { method: "PATCH" })` → `PATCH /bands/3`
- `fetch(..., { method: "DELETE" })` → `DELETE /bands/3`

That's essentially Postman — you're just using the browser as the client.

---

## GET — Read

### List all bands

**Address bar** (easiest for GET):

```
http://localhost:2000/bands
```

**Browser console:**

```javascript
fetch("http://localhost:2000/bands")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```javascript
// Latest result (refetch)
fetch("http://localhost:2000/bands")
  .then((response) => response.json())
  .then((data) => console.log("Latest bands:", data));
```

**IDE terminal** — not the browser console. Look at the terminal in your IDE where you ran `node src/server.js`. You should see:

```
getting { bands: [...] }
```

### Query parameters

**Address bar:**

```
http://localhost:2000/bands?genre=rock
http://localhost:2000/bands?sort=name
http://localhost:2000/bands?search=beatles
```

**Browser console:**

```javascript
fetch("http://localhost:2000/bands?genre=rock")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```javascript
// Latest result (refetch)
fetch("http://localhost:2000/bands?genre=rock")
  .then((response) => response.json())
  .then((data) => console.log("Latest bands (genre=rock):", data));
```

---

## POST — Create

You can't do this from the address bar. Use the browser console:

```javascript
fetch("http://localhost:2000/bands", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "The Beatles",
    genre: "Rock",
  }),
});
```

That sends:

```
POST /bands
```

**IDE terminal** — not the browser console. Look at the terminal in your IDE where you ran `node src/server.js`. You should see the full request flow:

```
Context: ...
Content-Type: application/json
1. body: { name: 'The Beatles', genre: 'Rock' }
2. Validation passed
bands.length BEFORE: ...
newBand.id: ...
3. newBand: { id: ..., name: 'The Beatles', genre: 'Rock' }
...
6. bands after push: [...]
```

**Browser console** — see the response:

```javascript
fetch("http://localhost:2000/bands", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "The Beatles",
    genre: "Rock",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```javascript
// Latest result (refetch list)
fetch("http://localhost:2000/bands")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

Tip: After a successful `POST`, run the refetch snippet immediately to confirm the newly created band is actually present on the server.

You should get back the new band object with a `201` status.

---

## PATCH — Update

Partially update a band by ID. Again, only via `fetch()`:

```javascript
fetch("http://localhost:2000/bands/3", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "New Band Name",
  }),
});
```

```javascript
// Latest result (refetch updated band)
fetch("http://localhost:2000/bands/3")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

That sends:

```
PATCH /bands/3
```

**IDE terminal** — not the browser console. Look at the terminal in your IDE where you ran `node src/server.js`. Less logging on this route for now, but the handler runs and returns the updated band.

**Browser console** — see the response:

```javascript
fetch("http://localhost:2000/bands/3", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    genre: "Jazz",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```javascript
// Latest result (refetch updated band)
fetch("http://localhost:2000/bands/3")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

You can send `name`, `genre`, or both. Only the fields you include get updated. Refetching `GET /bands/3` right after helps you verify that only those fields changed.

---

## DELETE — Remove

```javascript
fetch("http://localhost:2000/bands/3", {
  method: "DELETE",
});
```

```javascript
// Latest result (refetch deleted band)
fetch("http://localhost:2000/bands/3")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

That sends:

```
DELETE /bands/3
```

**IDE terminal** — not the browser console. Look at the terminal in your IDE where you ran `node src/server.js`. You should see:

```
3
get band { band: ... }
```

**Browser console** — see the response (once the route returns JSON):

```javascript
fetch("http://localhost:2000/bands/3", {
  method: "DELETE",
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```javascript
// Latest result (refetch deleted band)
fetch("http://localhost:2000/bands/3")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

If your `DELETE` route returns no JSON body (or you temporarily haven’t wired a response yet), keep the delete call simple. Either way, the refetch should confirm the band is gone (often you should see a `404` / missing result when fetching `GET /bands/3`):

```javascript
fetch("http://localhost:2000/bands/3", {
  method: "DELETE",
});
```

```javascript
// Latest result (refetch deleted band)
fetch("http://localhost:2000/bands/3")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

---

## Quick reference

| Method | URL | Address bar? | Body needed? |
|--------|-----|--------------|--------------|
| `GET` | `/bands` | Yes | No |
| `GET` | `/bands?genre=rock` | Yes | No |
| `POST` | `/bands` | No — use `fetch()` | Yes — `{ name, genre }` |
| `PATCH` | `/bands/:id` | No — use `fetch()` | Yes — `{ name }` or `{ genre }` |
| `DELETE` | `/bands/:id` | No — use `fetch()` | No |

---

## Where to look

| What you're checking | Where to look |
|----------------------|---------------|
| `console.log` from your route handlers | **IDE terminal** |
| HTTP response body and status | **Browser console** (use `.then((response) => response.json())`) |
| Network request details | Browser DevTools → **Network** tab |
