# Hono Project 02 — Routing Reference Guide

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

---

# 1. Basic Routes

## GET Route

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

is just JavaScript data.

They are not connected because they have the same name.

Example:

```js
const musicGroups = [
  {
    name: "Pantera"
  }
];

app.get("/bands", (c) => {
  return c.json(musicGroups);
});
```

The URL is still:

```
/bands
```

but the returned data comes from:

```
musicGroups
```

---

# 2. Route Parameters

Route parameters are dynamic values inside the URL.

Example:

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

The `:name` is a placeholder.

The value after it replaces the placeholder.

---

## Multiple Route Parameters

Example:

```js
app.get("/bands/:name/albums/:album", (c) => {

  const bandName = c.req.param("name");
  const albumName = c.req.param("album");

  return c.text(
    `${bandName} - ${albumName}`
  );

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

# 3. Query Parameters

Query parameters are optional values added after `?`.

Example:

```
/bands?genre=metal
```

The route is still:

```
/bands
```

The query changes how the data is returned.

---

Read a query:

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

---

# Route Params vs Query Params

## Route Parameter

Used to identify a specific resource.

Example:

```
/bands/pantera
```

Meaning:

> Give me the Pantera resource

Code:

```js
c.req.param("name")
```

---

## Query Parameter

Used to filter, sort, or modify results.

Example:

```
/bands?genre=metal
```

Meaning:

> Give me bands, but only metal ones

Code:

```js
c.req.query("genre")
```

---

# 4. Filtering Data

When working with query parameters, we usually use JavaScript array methods.

Example:

```js
const filteredBands = bands.filter(
  (band) => band.genre === genre
);
```

`filter()` returns multiple matches.

Example:

```js
[
  {
    name: "Pantera",
    genre: "metal"
  },
  {
    name: "Metallica",
    genre: "metal"
  }
]
```

---

# 5. Finding One Resource

When using a route parameter:

```
/bands/pantera
```

we usually use:

```js
find()
```

Example:

```js
const band = bands.find(
  (band) => band.name === bandName
);
```

Difference:

| Method   | Purpose           |
| -------- | ----------------- |
| filter() | Return many items |
| find()   | Return one item   |

---

# 6. Complete Filtering Example

```js
app.get("/bands", (c) => {

  const genre = c.req.query("genre");

  const filteredBands =
    genre
      ? bands.filter(
          (band) => band.genre === genre
        )
      : [...bands];

  return c.json(filteredBands);

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
Find genre
       |
       ↓
Filter bands
       |
       ↓
Return matches
```

---

# 7. Copying Arrays

Avoid accidentally changing your original data.

Bad:

```js
const newBands = bands;
```

Both variables point to the same array.

Good:

```js
const newBands = [...bands];
```

Creates a new array.

---

# 8. Nullish Coalescing (??)

Used for missing values.

Example:

```js
const genre =
  c.req.query("genre") ?? "all";
```

Meaning:

```
If genre exists:
    use it

Otherwise:
    use "all"
```

Only handles:

* undefined
* null

It does not handle:

```
""
```

(empty string)

---

# 9. Ternary Operator

Short version of if/else.

Syntax:

```js
condition
  ? value if true
  : value if false
```

Example:

```js
const result =
  genre !== "all"
    ? bands.filter(
        (band) => band.genre === genre
      )
    : [...bands];
```

Equivalent:

```js
let result;

if (genre !== "all") {
  result = bands.filter(
    (band) => band.genre === genre
  );
} else {
  result = [...bands];
}
```

---

# 10. Error Handling

A route parameter may not exist in your data.

Example:

```
/bands/unknown
```

`find()` returns:

```js
undefined
```

Handle it:

```js
if (!band) {

  return c.json(
    {
      error: "Band not found"
    },
    404
  );

}
```

---

# Final Project Mental Model

When a request arrives:

```
Browser
   |
   |
GET /bands/pantera
   |
   ↓
Hono matches route
   |
   ↓
Read params/query
   |
   ↓
JavaScript finds or filters data
   |
   ↓
Return response
```

Examples:

```
/bands
        ↓
Return collection


/bands?genre=metal
        ↓
Filter collection


/bands/pantera
        ↓
Find single item
```

---

# Project 02 Skills Completed

✅ Hono route creation
✅ GET routes
✅ Route parameters
✅ Multiple parameters
✅ Query parameters
✅ Filtering collections
✅ Finding single resources
✅ Ternary operators
✅ Nullish coalescing
✅ Array copying
✅ Basic API thinking
✅ 404 responses

Next project:

# Project 03 — Building a CRUD API

Topics:

* POST requests
* Request bodies
* Creating data
* Updating data
* Deleting data
* Validation
* Status codes
* Better project structure
