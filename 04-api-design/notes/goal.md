# Project 04 — API Design

The goal isn't to learn lots of new Hono syntax. It's to learn **how to design a good API**.

---

## Where we are in the progression

```text
01 Basic Server
        ↓
02 Routing
        ↓
03 Request Data
        ↓
04 API Design       ← we're here
        ↓
05 Mini API Project
        ↓
06 Structured App
```

---

## What I'll teach you

### 1. What makes an API "well designed"

We'll look at questions like:

**What should my URLs look like?**

Instead of randomly creating:

```text
/getBands
/getBand
/createBand
/deleteBand
```

we'll learn the REST-style approach:

```text
GET    /bands
GET    /bands/:id
POST   /bands
PATCH  /bands/:id
DELETE /bands/:id
```

The HTTP method describes the action, while the URL describes the resource.

That's an important API design principle.

### 2. Resources

We'll introduce the concept of a **resource**.

For your music API:

- bands
- albums
- songs

These become resources:

```text
/bands
/albums
/songs
```

Then individual resources:

```text
/bands/1
/albums/25
/songs/100
```

You'll start thinking:

> "What is the resource I'm working with?"

rather than:

> "What function should I make?"

### 3. HTTP methods

You've already used these, but we'll look at them from an API design perspective:

- GET
- POST
- PUT
- PATCH
- DELETE

We'll distinguish:

| Method | Action |
| --- | --- |
| GET | retrieve |
| POST | create |
| PUT | replace |
| PATCH | partially update |
| DELETE | remove |

You've already used PATCH in your CRUD API, so this will reinforce what you've done.

### 4. Status codes

This is a big one.

You've already used:

```js
return c.json(..., 400);
```

and:

```js
return c.json(..., 404);
```

We'll build a mental model around HTTP status codes:

| Range | Meaning |
| --- | --- |
| 2xx | Success |
| 4xx | Client/request problem |
| 5xx | Server problem |

And specifically:

**Success**

- 200 OK
- 201 Created
- 204 No Content

**Client errors**

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict

**Server errors**

- 500 Internal Server Error

We'll discuss when you'd use each rather than memorising numbers.

### 5. Consistent responses

We'll look at why APIs should return predictable structures.

For example, don't have:

```json
{ "error": "Band not found" }
```

in one endpoint and:

```json
{ "message": "Couldn't find that band" }
```

in another.

Instead, establish a consistent pattern. For example:

```json
{ "error": "Band not found" }
```

This becomes especially important when a frontend consumes your API.

### 6. Validation

You've already started doing this:

```js
if (!body.name || !body.genre || !body.formed)
```

In API design we'll ask:

**What makes a request valid?**

For example:

```json
{
  "name": "Pantera",
  "genre": "Metal",
  "formed": 1981
}
```

What happens if someone sends:

```json
{ "name": "Pantera" }
```

Or:

```json
{ "formed": "banana" }
```

Or:

```json
{}
```

We'll design rules for those situations.

### 7. URL design

We'll explore why these:

```text
/bands
/bands/1
/bands/1/albums
```

are generally preferable to:

```text
/getBands
/getBandById
/getAlbumsForBand
```

You'll learn to think about URLs as **nouns/resources**, while HTTP methods provide the action.

### 8. Query parameters

You already understand the difference between:

```text
/bands/:id
```

and:

```text
/bands?genre=metal
```

Now we'll use that knowledge for actual API design.

For example:

```text
GET /bands?genre=metal
```

could mean: return bands where genre is metal.

And:

```text
GET /bands?sort=name
```

could mean: return bands sorted by name.

And:

```text
GET /bands?limit=10
```

could mean: return at most 10 bands.

This is where query parameters become genuinely useful.

### 9. Filtering, sorting and pagination

We'll look at patterns such as:

```text
/bands?genre=metal
/bands?sort=name
/bands?page=2&limit=10
```

And potentially combining them:

```text
/bands?genre=metal&sort=name&page=2&limit=10
```

This is a major real-world API pattern.

### 10. Nested resources

Since we're building around music, this will be particularly useful.

For example:

```text
/bands/1/albums
```

means: give me the albums belonging to band 1.

And:

```text
/bands/1/albums/5
```

means: give me album 5 belonging to band 1.

We'll discuss when nested routes make sense and when they become unnecessarily complicated.

### 11. API design before Hono code

This is probably the biggest lesson of this project.

We'll eventually start with something like:

```text
Resource: bands

GET    /bands
GET    /bands/:id
POST   /bands
PATCH  /bands/:id
DELETE /bands/:id
```

**before** writing:

```js
app.get(...)
app.post(...)
app.patch(...)
```

That's an important professional habit.

You design the interface first, then implement it.

---

## What I DON'T want to do yet

I don't want to throw these at you:

- authentication
- databases
- JWT
- middleware
- OpenAPI
- Swagger
- controllers
- services
- advanced validation libraries

Those are useful eventually, but they'd distract from the core lesson.

---

## The project we'll build

I'd like to use your music/band API again because you've already got a mental model for it.

We'll design something like:

```text
              BANDS API
                  │
        ┌─────────┴─────────┐
        │                   │
      /bands            /bands/:id
        │                   │
   collection            resource
        │                   │
   GET / POST          GET / PATCH / DELETE
```

Then we'll add:

```text
/bands?genre=metal
```

and eventually:

```text
/bands/:id/albums
```

The important part is that we'll **design each endpoint together** and discuss why it should look that way **before** implementing it.

---

## One important distinction from your CRUD project

Your CRUD API taught you:

> How to **implement** CRUD.

This project is going to teach you:

> How to **decide** what your API should look like.

That's a subtle but important difference.

You can have an API that technically works but is badly designed.

Our goal here is to get you to the point where, when someone says:

> "I need an API for bands, albums and songs."

you can sit down and design the endpoints **before** opening your editor.
