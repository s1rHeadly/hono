# Project 04 — API Design

This project is about **how to design a good API** — not new Hono syntax. You work through the notes and design endpoints before (or alongside) implementing them.

For background, see [Project 03 — CRUD API](../03-crud-api/readme.md) (the API you built there is the reference implementation) and [`docs/hono.md`](../docs/hono.md).

Study materials in this folder:

| File | Purpose |
| --- | --- |
| [`goal.md`](goal.md) | What this project covers and why |
| [`apidesign_notes1.md`](apidesign_notes1.md) | API design notes (part 1) |
| [`apidesign_notes2.md`](apidesign_notes2.md) | API design notes (part 2) |

There is **no runnable server** in this project — it is notes and design exercises. Use [Project 03](../03-crud-api/) when you want a live API to test ideas against.

---

## Prerequisites

Install [Node.js](https://nodejs.org/) (LTS is fine) if you plan to run Project 03 alongside these notes. This folder itself does not require any npm packages.

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

### 2. Initialize npm (optional)

Creates a `package.json` so the folder matches the other numbered projects. No dependencies are needed for the design notes.

```bash
npm init -y
```

### 3. Add the study files

Create or copy these files into the folder:

- `goal.md`
- `apidesign_notes1.md`
- `apidesign_notes2.md`

If you cloned `hono-learning`, they are already here.

### 4. Work through the material

1. Read [`goal.md`](goal.md) for the learning goals.
2. Work through [`apidesign_notes1.md`](apidesign_notes1.md) and [`apidesign_notes2.md`](apidesign_notes2.md).
3. When you want to try requests against a real API, run Project 03 (see below).

---

## Run a companion API (Project 03)

This project has no `npm run dev`. To test API design ideas against a live server, use the CRUD API from Project 03.

From the `03-crud-api` directory (sibling folder):

```bash
npm install
npm run dev
```

Server runs at `http://localhost:2000`. Use Postman or your browser to exercise the endpoints you designed on paper.

---

## Run this project (existing folder)

If you cloned the repo, open the markdown files listed above — no `npm install` is required in `04-api-design` itself.

To pair the notes with a running API:

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

See [`goal.md`](goal.md) for the full outline.
