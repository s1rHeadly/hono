# Change Select API — Dropdown demo

A small Hono API with a static HTML page: load categories from `/api/categories` and populate a `<select>` dropdown in the browser.

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
mkdir "change select api"
cd "change select api"
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
npm pkg set main=server/index.js
npm pkg set scripts.dev="nodemon --watch server --watch public --exec node server/index.js"
```

### 6. Create `server/data/dummydata.js`

```bash
mkdir -p server/data server/routes public
```

Create `server/data/dummydata.js` with:

```js
export const categories = [
  { id: 1, name: "Music" },
  { id: 2, name: "Movies" },
  { id: 3, name: "Books" },
];

export const items = {
  1: [
    { id: 101, name: "Rock" },
    { id: 102, name: "Jazz" },
    { id: 103, name: "Pop" },
  ],
  2: [
    { id: 201, name: "Action" },
    { id: 202, name: "Drama" },
  ],
  3: [
    { id: 301, name: "Fiction" },
    { id: 302, name: "Non-fiction" },
  ],
};
```

### 7. Create `server/routes/categories.js`

```js
export function categoryRoutes(app) {
  app.get("/api/categories", (c) => {
    return c.json([
      { id: 1, name: "Music" },
      { id: 2, name: "Movies" },
      { id: 3, name: "Books" },
    ]);
  });
}
```

### 8. Create `server/index.js`

```js
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categoryRoutes } from "./routes/categories.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const app = new Hono();

categoryRoutes(app);

app.get("/test", (c) => {
  return c.text("working");
});

app.use(
  "/public/*",
  serveStatic({
    root: publicDir,
    rewriteRequestPath: (path) => path.replace(/^\/public\//, ""),
  }),
);

app.get("/", serveStatic({ path: join(publicDir, "index.html") }));

serve({
  fetch: app.fetch,
  port: 5000,
});

console.log("Server running on http://localhost:5000");
```

### 9. Create `public/index.html`

```html
<!doctype html>
<html>
  <head>
    <title>Dropdown API Demo</title>
  </head>
  <body>
    <h2>Categories</h2>
    <select id="categorySelect">
      <option>Loading...</option>
    </select>

    <h2>Items</h2>
    <select id="itemSelect">
      <option>Select category first</option>
    </select>

    <script src="/public/app.js"></script>
  </body>
</html>
```

### 10. Create `public/app.js`

```js
const categorySelect = document.getElementById("categorySelect");
const itemSelect = document.getElementById("itemSelect");

async function loadCategories() {
  const res = await fetch("http://localhost:5000/api/categories");
  const data = await res.json();

  categorySelect.innerHTML = '<option value="">Select category</option>';

  data.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

loadCategories();
```

### 11. Start the server

```bash
npm run dev
```

Open in a browser:

- `http://localhost:5000` — dropdown demo page
- `http://localhost:5000/test` — plain-text health check
- `http://localhost:5000/api/categories` — categories JSON

---

## Run this project (existing folder)

If you cloned the repo or already have this folder with a `package.json`, from the `change select api` directory:

```bash
npm install
npm run dev
```

If `package.json` has no `dev` script yet, add it:

```bash
npm pkg set scripts.dev="nodemon --watch server --watch public --exec node server/index.js"
```

Then run `npm run dev` and open `http://localhost:5000`.

---

## Project structure

| Path | Purpose |
| --- | --- |
| `server/index.js` | Hono app, static file serving, `serve()` on port 5000 |
| `server/routes/categories.js` | `GET /api/categories` route |
| `server/data/dummydata.js` | Sample categories and items (for future routes) |
| `public/index.html` | Page with category and item dropdowns |
| `public/app.js` | Fetches categories from the API and fills the first dropdown |
