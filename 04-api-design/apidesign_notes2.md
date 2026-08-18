# Hono — 04 API Design

## 1. HTTP Status Codes

HTTP status codes are part of an API's **contract** with the client.

They tell the client what happened when it made a request.

A response consists broadly of:

```text
Status code
    +
Headers
    +
Response body
```

For example:

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

---

## 2. Status Code Categories

HTTP status codes are grouped by their first digit:

| Range | Category      | Meaning                      |
| ----- | ------------- | ---------------------------- |
| 1xx   | Informational | Request is being processed   |
| 2xx   | Success       | Request succeeded            |
| 3xx   | Redirection   | Further action/redirect      |
| 4xx   | Client error  | Problem with the request     |
| 5xx   | Server error  | Problem on the server        |

For API development, the most important groups initially are:

- **2xx** → Success
- **4xx** → Client/request problem
- **5xx** → Server problem

---

## 3. 200 — OK

The request was successfully processed.

Commonly used for successful GET requests.

**Example:**

```http
GET /bands
```

Response:

```http
200 OK
```

In Hono:

```javascript
return c.json(bands);
```

Hono will return **200** by default.

**Think:**

"The request succeeded and I'm returning something."

---

## 4. 201 — Created

The request successfully created a new resource.

Most commonly used with **POST**.

**Example:**

```http
POST /bands
```

If a new band is created:

```http
201 Created
```

In Hono:

```javascript
return c.json(bandObj, 201);
```

**Think:**

"The request succeeded and a new resource was created."

---

## 5. 204 — No Content

The request succeeded, but there is **no response body** to return.

A common example is a successful **DELETE**.

```http
DELETE /bands/5
```

If band 5 was successfully deleted:

```http
204 No Content
```

### Important distinction

204 does **not** mean:

"The resource doesn't exist."

It means:

"The operation succeeded, but there is no content to return."

---

## 6. 400 — Bad Request

The client sent a request that is invalid or cannot be processed because of the request data.

**Example:**

```http
GET /bands/hello
```

Our API expects a numeric ID.

```javascript
if (isNaN(Number(id))) {
  return c.json(
    { error: "ID must be a number" },
    400
  );
}
```

Response:

```http
400 Bad Request
```

**Think:**

"The request itself isn't valid."

Other examples:

- Missing required fields
- Invalid data format
- Invalid parameter value
- Malformed request

---

## 7. 404 — Not Found

The request is understood, but the requested resource doesn't exist.

**Example:**

```http
GET /bands/999
```

If band 999 doesn't exist:

```http
404 Not Found
```

In Hono:

```javascript
return c.json(
  { error: `The band id: ${id} is not found` },
  404
);
```

**Think:**

"I understand what you're asking for, but it doesn't exist."

---

## 8. 409 — Conflict

The request is valid, but it conflicts with the current state of the resource.

A common example is attempting to create a duplicate resource.

```http
POST /bands
```

If "Pantera" already exists:

```http
409 Conflict
```

In Hono:

```javascript
return c.json(
  { error: "Band already exists" },
  409
);
```

**Think:**

"Your request is valid, but it conflicts with existing data."

---

## 9. 500 — Internal Server Error

Something went wrong on the server while processing the request.

For example:

```text
GET /bands
       ↓
Database connection fails
       ↓
500 Internal Server Error
```

The request itself might be perfectly valid.

**Think:**

"The client made a valid request, but the server failed while handling it."

---

## 10. 4xx vs 5xx

This is one of the most useful debugging distinctions.

```text
4xx
 ↓
Problem with the client's request
```

versus:

```text
5xx
 ↓
Problem on the server
```

**Example:**

```text
GET /bands/banana
        ↓
400
        ↓
Invalid ID supplied by client
```

Whereas:

```text
GET /bands
        ↓
Database crashes
        ↓
500
        ↓
Server-side problem
```

---

## 11. Important Status Codes for Our Hono Projects

| Code | Name                  | Typical API use                        |
| ---- | --------------------- | -------------------------------------- |
| 200  | OK                    | Successful GET/PATCH                   |
| 201  | Created               | Successful POST                        |
| 204  | No Content            | Successful DELETE with no body         |
| 400  | Bad Request           | Invalid request/input                  |
| 401  | Unauthorized          | Authentication required/failed         |
| 403  | Forbidden             | Request understood but not permitted   |
| 404  | Not Found             | Resource doesn't exist                 |
| 409  | Conflict              | Duplicate/conflicting resource         |
| 500  | Internal Server Error | Server-side failure                    |

For now, concentrate on:

- 200
- 201
- 204
- 400
- 404
- 409
- 500

We'll deal with **401** and **403** when authentication/authorization becomes relevant.

---

## 12. Status Codes as an API Contract

Status codes allow the client to programmatically understand what happened.

For example:

```javascript
const response = await fetch("/bands/999");

if (response.status === 404) {
  // Show "Band not found"
}
```

Or:

```javascript
if (response.status === 400) {
  // Show validation error
}
```

The status code therefore isn't just information for humans.

It's part of the **API contract**.

---

## 13. 404 vs 204 — Important Distinction

This was the tricky one from the exercise.

**Resource doesn't exist**

```http
GET /bands/999
404 Not Found
```

Meaning:

The requested resource doesn't exist.

**Operation succeeded with nothing to return**

```http
DELETE /bands/5
204 No Content
```

Meaning:

Band 5 was successfully deleted and there's no response body.

### Remember

- **404** → Nothing was found.
- **204** → Something succeeded, but there's nothing to return.

---

## 14. Example CRUD API

A typical bands API might use:

```text
GET /bands
    → 200

GET /bands/5
    → 200
    → 404 if band doesn't exist

POST /bands
    → 201
    → 400 if request is invalid
    → 409 if band already exists

PATCH /bands/5
    → 200
    → 400 if request is invalid
    → 404 if band doesn't exist

DELETE /bands/5
    → 204
    → 404 if band doesn't exist
```

---

## 15. Mental Model

When choosing a status code, ask:

```text
Did the request succeed?
        │
   ┌────┴────┐
   YES       NO
    │         │
   2xx       4xx/5xx
    │
    └── Was something created?
          │
       201 Created
```

For errors:

```text
Was the request itself invalid?
        │
       YES
        ↓
      400

Does the requested resource exist?
        │
       NO
        ↓
      404

Does the request conflict with existing data?
        │
       YES
        ↓
      409

Did the server fail?
        │
       YES
        ↓
      500
```

---

## 16. Key Takeaways

| Code | Meaning                                              |
| ---- | ---------------------------------------------------- |
| 200  | Successful request                                   |
| 201  | Successful request that created a resource           |
| 204  | Successful request with no response body             |
| 400  | The request is invalid                               |
| 404  | The requested resource doesn't exist                 |
| 409  | The request conflicts with existing data             |
| 500  | Something went wrong on the server                   |

### The most important distinction

```text
4xx → Look at the request/client.

5xx → Look at the server.

404 → Resource doesn't exist.

204 → Operation succeeded, but there's no content to return.
```

And remember:

Status codes are part of your API's contract. A well-designed API doesn't just return data; it clearly communicates what happened.
