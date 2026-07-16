# Hono Tutorial

## Glossary

| Term | Meaning |
|------|---------|
| Browser | The client making the request (Chrome, Edge, Firefox, etc.) |
| Server | A program that listens for requests and sends responses |
| Request | "Can I have this resource?" |
| Response | "Here you go." |
| Route | A URL that your server knows how to handle (like `/about`) |
| HTTP Method | The *action* in a request (like `GET`, `POST`, or `DELETE`) |
| Hono | A framework that helps you write server code |

---

## Your First Hono App

When we write:

```js
const app = new Hono();
```

…it is the thing that receives requests and decides what code should run.

A simple Hono application looks like this:

```js
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

export default app;
```

Now let's read it like a story.

### Line 1

```js
import { Hono } from "hono";
```

We bring the Hono tool into our project.

Before this:

```
Our JavaScript
     |
     |
     ▼
No web server abilities
```

After:

```
Our JavaScript
     |
     |
     ▼
Has access to Hono
```

### Line 2

```js
const app = new Hono();
```

We create the application.

Now we have:

```
app
 |
 ├── Can receive requests
 ├── Can create routes
 └── Can send responses
```

### Lines 3–5

```js
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
```

We register a route.

We are telling Hono:

> "If a GET request comes in for `/`, run this function."

We are adding a rule to the application.

After this line, Hono knows:

```
GET /

↓

run this function

↓

return "Hello Hono!"
```

### Final line

```js
export default app;
```

This makes the Hono application available to the environment running it.

Think of it like saying:

> "Here is my finished application. Start using it."

### The complete request journey

Now if you visit:

```
http://localhost:3000/
```

this happens:

```
1. Browser
   |
   | GET /
   |
   ▼

2. Server receives request
   |
   ▼

3. Hono app receives request
   |
   ▼

4. Hono checks routes

   GET /
   ✅ Found
   |
   ▼

5. Runs:

   (c) => {
       return c.text("Hello Hono!");
   }
   |
   ▼

6. Sends response

   Hello Hono!
   |
   ▼

7. Browser displays it
```

---

## Part 1 — How a Request Works

You've seen what the code looks like. Now let's trace what happens when someone visits your site — step by step.

### Step 1 — You type a URL

Suppose you type:

```
http://localhost:3000/
```

Nothing has happened yet.

### Step 2 — The browser creates an HTTP request

The browser packages up a request that looks roughly like this:

```
GET / HTTP/1.1
Host: localhost:3000
```

Don't worry about every line—we'll learn HTTP later.

The important part is:

```
GET /
```

This means:

> "I'd like the homepage (/)."

`GET` is the **HTTP method** — the action the browser wants to perform. We'll dig into that properly in Part 2. For now, just notice it's always there alongside the path.

The browser sends that request over the network (or to your own computer if you're using `localhost`).

### Step 3 — The server is listening

Imagine your server is sitting there waiting.

```
          Waiting...

Browser  -------------------->  Server
           GET /
```

A server spends most of its life doing... nothing.

It's just waiting.

The moment a request arrives, it wakes up and starts processing it.

### Step 4 — Hono receives the request

This is where Hono enters the picture.

Imagine Hono has a list of routes:

```
GET /
GET /about
GET /contact
GET /bands
```

When it receives:

```
GET /
```

it asks:

> "Do I know how to handle this?"

If the answer is yes, it runs the function you wrote.

### Step 5 — Your JavaScript runs

Eventually Hono reaches code like this:

```js
app.get("/", (c) => {
    return c.text("Hello!");
});
```

It runs that function.

That function creates a response.

### Step 6 — The response goes back

```
Browser
  ↓
GET /
  ↓
Server
  ↓
Hono
  ↓
Your code
  ↓
"Hello!"
  ↓
Browser
```

Finally, the browser displays:

```
Hello!
```

### The complete journey

Think of it as a conversation.

```
Browser:
"Can I have / ?"

↓

Server:
"Let me check..."

↓

Hono:
"I've got a route for that."

↓

Your code:
"Return 'Hello!'"

↓

Browser:
"Thanks!"
```

Every website and API follows this same pattern. Whether it's Google, Netflix, or a tiny Hono app, the request-response cycle is fundamentally the same.

### A more precise version

Here is the same flow, step by step:

1. The browser sends an HTTP request:

   ```
   GET /about
   ```

2. The request reaches the server.

3. Hono receives the request.

4. Hono checks its registered routes:

   > "Do I have a GET route for `/about`?"

5. If a matching route exists, Hono runs the JavaScript function attached to that route.

6. That function creates a response.

7. The server sends the response back.

8. The browser displays the result.

The key improvement is this:

**The server does not actually know what `/about` means. Hono does the route matching.**

- The server is more like the building.
- Hono is the receptionist inside the building.
- Your code is the worker who handles the request.

### Let's visualise the pieces

Imagine this file:

```js
import { Hono } from "hono";

const app = new Hono();

app.get("/about", (c) => {
    return c.text("About page");
});

export default app;
```

The pieces are:

```
                Server
                  |
                  |
                Hono
                  |
        ---------------------
        |                   |
      Route              Route
        |                   |
       "/"              "/about"
                            |
                            |
                     Your function
                            |
                            |
                   return c.text()
```

### Where does the response come from?

Hono doesn't return existing data yet.

At this stage, Hono returns whatever your function creates.

Example:

```js
app.get("/about", (c) => {
    return c.text("About page");
});
```

The text:

```
About page
```

doesn't exist anywhere before the request.

The request comes in:

```
GET /about
```

Hono says:

> "I have a function for this."

Then your function creates:

```
About page
```

and sends it back.

Later, when we build APIs, this changes:

```
Browser
  |
  | GET /bands
  |
  ▼
Hono route
  |
  ▼
Read JSON file/database
  |
  ▼
Return data
```

### Part 1 checkpoint

You now understand the first foundation:

- ✅ Browser sends requests
- ✅ Server receives requests
- ✅ Hono matches routes
- ✅ Your functions create responses
- ✅ Browser displays responses

This is the foundation everything else builds on.

---

## Part 2 — HTTP Methods

In Part 1, you kept seeing `GET` in requests like `GET /about`. Now let's understand what that actually means — and why Hono has `app.get()`, `app.post()`, and `app.delete()`.

### Methods in Hono

In Hono, each HTTP method has its own function:

**GET** — read or fetch something:

```js
app.get("/books", (c) => {
    return c.text("List books");
});
```

**POST** — create something new:

```js
app.post("/books", (c) => {
    return c.text("Create book");
});
```

**DELETE** — remove something:

```js
app.delete("/books/:id", (c) => {
    return c.text("Delete book");
});
```

The method (`get`, `post`, `delete`) tells Hono **what type of request** this route should respond to.

### Method + path = the full request

Let's slow that down, because this is a very important backend concept.

When the browser requests a URL, it doesn't just send:

```
/about
```

It sends a **method + URL**:

```
GET /about
```

The two important pieces are:

```
GET     /about
│       │
│       └── The path
│
└── The action we want to perform
```

### Why do we need the method?

Imagine a website with a user profile.

You might have:

```
GET /users/david
```

Meaning:

> "Give me David's profile."

But you could also have:

```
DELETE /users/david
```

Meaning:

> "Remove David's profile."

**Same URL. Different action.**

So Hono needs both pieces:

```js
app.get("/users/david", handler)
```

means:

> "When someone asks to **GET** this URL, run this function."

But:

```js
app.delete("/users/david", handler)
```

means:

> "When someone sends a **DELETE** request to this URL, run this different function."

Hono won't run the GET handler for a DELETE request — even if the path is identical. It always matches on **method + path** together.

### Part 2 checkpoint

You now also understand:

- ✅ Every request has a method (`GET`, `POST`, `DELETE`, …) and a path (`/about`, `/books`, …)
- ✅ Hono matches routes on **both** — not just the URL
- ✅ `app.get()`, `app.post()`, and `app.delete()` register different handlers for the same path
