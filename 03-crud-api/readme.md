# Project 03 — CRUD API

This project builds a small bands CRUD API with Hono. The walkthrough below follows what happens on a `POST /bands` request — from the client, through validation, into storage, and back as a response.

---

## The API data flow

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

Write only this first part:

```js
app.patch("/bands/:id", async (c) => {

});
```

Include:

- Get the `id`
- Check if it is a number
- Find the band
- Return `404` if it doesn't exist

### Testing PATCH in Postman

Check your Postman URL field.

You probably have something like:

```http
PATCH http://localhost:2000/bands/1
```

in the URL box.

The method should not be typed there.

You should have:

- **Method dropdown** (left side) → `PATCH`
- **URL box** → `http://localhost:2000/bands/1`

Like:

```text
[ PATCH ▼ ]  http://localhost:2000/bands/1
```

Then check your Body.

Go to:

```text
Body
  ↓
raw
  ↓
JSON
```

Add:

```json
{
  "genre": "Groove Metal"
}
```

#### Expected response

You should get:

```json
{
  "id": 1,
  "name": "Pantera",
  "genre": "Groove Metal",
  "formed": 1981
}
```

#### If you get a different error after fixing that

The next likely ones would be:

**404**

```json
{
  "error": "The band id: 1 is not found"
}
```

means your ID doesn't exist.

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
