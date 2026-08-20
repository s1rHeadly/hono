# Hono — 04 API Design

## 1. What is API Design?

API design is deciding how clients communicate with your API **before** implementing the code.

We decide:

- What resources exist
- What URLs represent those resources
- Which HTTP methods are used
- How resources relate to each other
- How filtering, sorting and pagination work
- What HTTP status codes should be returned
- What the response format should look like

A good API should be **predictable** and **consistent**.

---

## 2. Resources

A **resource** is the thing our API manages.

For a music API:

- `bands`
- `albums`
- `songs`

A resource collection is represented by a **noun**:

```http
/bands
/albums
/songs
```

Avoid action-based URLs such as:

```http
/getBands
/createBand
/deleteBand
```

The HTTP method already describes the action.

---

## 3. HTTP Method + Resource

The **URL** describes what we're working with.

The **HTTP method** describes what we're doing.

**Example:**

```http
GET /bands
```

Get the bands.

```http
POST /bands
```

Create a band.

```http
DELETE /bands/5
```

Delete band 5.

### Common methods

| Method | Purpose            |
| ------ | ------------------ |
| GET    | Retrieve           |
| POST   | Create             |
| PUT    | Replace            |
| PATCH  | Partially update   |
| DELETE | Delete             |

---

## 4. Collections vs Individual Resources

### Collection

```http
/bands
```

Means:

The collection of bands.

### Individual resource

```http
/bands/5
```

Means:

Band with ID 5.

The route pattern would be:

```http
/bands/:id
```

The actual request would be:

```http
/bands/5
```

So:

```text
Route pattern:  /bands/:id
Actual URL:     /bands/5
```

---

## 5. Nested Resources

Resources can have relationships.

For example:

```text
Band
 └── Albums
```

We can represent that relationship with:

```http
/bands/5/albums
```

Meaning:

Albums belonging to band 5.

### Examples

```http
GET /bands/5/albums
```

Get all albums belonging to band 5.

```http
POST /bands/5/albums
```

Create an album belonging to band 5.

```http
GET /bands/5/albums/12
```

Get album 12 belonging to band 5.

```http
DELETE /bands/5/albums/12
```

Delete album 12 belonging to band 5.

### Important

Nested resources express a **relationship**.

The albums don't necessarily have to physically exist inside the band object.

For example:

```javascript
const bands = [
  {
    id: 5,
    name: "Pantera"
  }
];
```

```javascript
const albums = [
  {
    id: 12,
    bandId: 5,
    name: "Vulgar Display of Power"
  }
];
```

The URL:

```http
/bands/5/albums
```

expresses the relationship between them.

---

## 6. Route Parameters vs Query Parameters

This is an important distinction.

### Route parameter

Used to **identify a specific resource**.

```http
/bands/5
```

Route pattern:

```http
/bands/:id
```

Meaning:

Get band 5.

In Hono:

```javascript
const id = c.req.param("id");
```

### Query parameter

Used to **modify how a collection is retrieved**.

```http
/bands?genre=metal
```

The resource is still:

```http
/bands
```

But we're saying:

Only return bands where the genre is metal.

In Hono:

```javascript
const genre = c.req.query("genre");
```

---

## 7. Filtering

Query parameters are commonly used for filtering.

```http
GET /bands?genre=metal
```

Possible result:

```json
[
  {
    "id": 1,
    "name": "Pantera",
    "genre": "Metal"
  },
  {
    "id": 3,
    "name": "Metallica",
    "genre": "Metal"
  }
]
```

The resource hasn't changed:

```http
/bands
```

We've simply changed how we're querying the collection.

---

## 8. Sorting

A query parameter can specify how results should be sorted.

```http
GET /bands?sort=name
```

Meaning:

Return bands sorted by name.

---

## 9. Multiple Query Parameters

Query parameters can be combined with `&`.

```http
GET /bands?genre=metal&sort=name
```

This means:

```text
genre = metal
sort  = name
```

The server could:

1. Filter to Metal bands
2. Sort them alphabetically
3. Return the result

---

## 10. Pagination

Large collections shouldn't necessarily return thousands of records at once.

We can use query parameters such as:

```http
GET /bands?page=3&limit=20
```

Meaning:

```text
page  = 3
limit = 20
```

Return page 3 with 20 bands per page.

---

## 11. Search

Search can also be represented with a query parameter.

For example:

```http
GET /bands?search=pantera
```

Meaning:

Search the bands collection for `"pantera"`.

Another API might use:

```http
GET /bands?q=pantera
```

Both are possible.

The important thing is **consistency**.

---

## 12. Are `page`, `limit`, `search`, `sort`, etc. Built-in?

**No.**

This is an important lesson.

Query parameters such as:

- `page`
- `limit`
- `search`
- `sort`
- `genre`

are **not** default HTTP or Hono parameters.

They are names that **we choose** as API designers.

For example:

```http
/bands?page=3&limit=20
```

doesn't automatically give us page 3.

Our code has to implement that behaviour.

In Hono we can retrieve them:

```javascript
const page = c.req.query("page");
const limit = c.req.query("limit");
```

But we decide what they mean and how they work.

### Query parameter conventions

Common conventions include:

```http
?page=3
?limit=20
?sort=name
?search=pantera
?genre=metal
```

These aren't mandatory.

We could technically create:

```http
/bands?currentPage=3&amount=20
```

The important thing is that our API defines the meaning and uses it consistently.

---

## 13. Mental Model

A useful way to think about API design — from the URL the client sends to the JavaScript you write in Hono:

```text
API Design
    │
    ├── Resource
    │       └── /bands
    │
    ├── Path parameters
    │       ├── /bands/:id          → identify a specific resource
    │       └── c.req.param("id")
    │
    ├── Query parameters
    │       ├── /bands?genre=metal  → modify how a collection is retrieved
    │       ├── variables             → c.req.query()
    │       ├── Filtering             → .filter()
    │       └── Sorting               → .sort()
    │
    ├── Validation
    │       └── if / guard clauses
    │
    ├── Results
    │       └── arrays / .length
    │
    └── Transforming data
            └── .map()
```

**Design side:** the URL tells the client what resource they're working with and how to query it.

**Implementation side:** your handler reads those values and uses array methods to shape the response.

---

## 14. Quick Decision Rule

When designing an endpoint, ask:

**Am I identifying a specific resource?**

Use a route parameter:

```http
/bands/5
```

**Am I filtering, sorting, searching or paginating a collection?**

Use a query parameter:

```http
/bands?genre=metal
/bands?sort=name
/bands?search=pantera
/bands?page=3&limit=20
```

---

## 15. Examples

| Requirement                    | API design                          |
| ------------------------------ | ----------------------------------- |
| Get all bands                  | `GET /bands`                        |
| Get band 10                    | `GET /bands/10`                     |
| Get Metal bands                | `GET /bands?genre=metal`            |
| Sort bands by name             | `GET /bands?sort=name`              |
| Metal bands sorted by name     | `GET /bands?genre=metal&sort=name`  |
| Search for Pantera             | `GET /bands?search=pantera`         |
| Page 3, 20 results             | `GET /bands?page=3&limit=20`        |
| Get albums for band 5          | `GET /bands/5/albums`               |
| Create album for band 5        | `POST /bands/5/albums`              |
| Get album 12 for band 5        | `GET /bands/5/albums/12`            |
| Delete album 12 for band 5     | `DELETE /bands/5/albums/12`         |

### Key takeaway

The **HTTP method** describes the operation. The **URL** describes the resource. **Route parameters** identify resources. **Query parameters** modify how collections are retrieved.

And perhaps the most important API-design lesson so far:

`page`, `limit`, `search`, `sort`, `genre`, etc. aren't magic parameters. They are **conventions** that the API designer defines and the application implements.
