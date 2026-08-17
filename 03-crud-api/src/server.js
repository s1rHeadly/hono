// Hono is the web framework; serve starts an HTTP server on Node.js
import { Hono } from "hono";
import { serve } from "@hono/node-server";

// In-memory band data used by the CRUD routes below
import bands from "../data/bands.js";

// Create the Hono app instance — all routes hang off this object
const app = new Hono();

// GET
// ==================
// GET / — root route; c is the Context (request + response helpers)
app.get("/", (c) => {
  // c.text() sends a plain-text response with Content-Type: text/plain
  return c.text("Bands Crud API");
});

// GET /bands — return the full list of bands as JSON
app.get("/bands", (c) => {
  // c.json() serializes the value and sets Content-Type: application/json
  return c.json(bands);
});

// GET /bands/:id — :id is a path parameter (e.g. /bands/2)
app.get("/bands/:id", (c) => {
  // c.req.param("id") reads the dynamic segment from the URL
  const id = c.req.param("id");

  // Reject non-numeric ids with a 400 Bad Request
  if (isNaN(Number(id))) {
    // Second argument to c.json() is the HTTP status code
    return c.json({ error: "ID must be a number" }, 400);
  }

  // Find the matching band in the in-memory array
  const getBandById = bands.find((band) => band.id === Number(id));

  // 404 Not Found if no band matches that id
  if (!getBandById) {
    return c.json({ error: `The band id: ${id} is not found` }, 404);
  }

  return c.json(getBandById);
});

// POST
// ==================
// POST /bands — create a new band from a JSON request body
// async because reading the body with c.req.json() returns a Promise
app.post("/bands", async (c) => {
  // Parse the incoming JSON body into a plain object
  const body = await c.req.json();

  // Validate required fields before creating
  if (!body.name || !body.genre || !body.formed) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Build the new band object; Date.now() gives a unique numeric id
  // this is the json template we use in the post request
  // use postman with the url http://localhost:2000/ and a Post request with some dummy data
  const bandObj = {
    id: Date.now(),
    name: body.name,
    genre: body.genre,
    formed: body.formed,
  };

  // Case-insensitive duplicate check by name
  const existingBand = bands.find(
    (band) => band.name.toLowerCase() === bandObj.name.toLowerCase(),
  );

  // 409 Conflict if a band with that name already exists
  if (existingBand) {
    return c.json({ error: "Band already exists" }, 409);
  }

  // Persist to the in-memory array (resets when the server restarts)
  bands.push(bandObj);

  console.log(bands);

  // Return the created band (typically you'd also use status 201)
  return c.json(bandObj);
});

// ===============================

// PATCH
// ===========

// Patch modifies part of the resource

app.patch("/bands/:id", async (c) => {
  const id = c.req.param("id");

  // band URL path must be a number
  if (isNaN(Number(id))) {
    return c.json({ error: "ID must be a number" }, 400);
  }

  // find the band object by its ID
  const getBandById = bands.find((band) => band.id === Number(id));

  // if the number in the URL is not found
  if (!getBandById) {
    return c.json({ error: `The band id: ${id} is not found` }, 404);
  }

  // data received from Postman when a request is made
  const body = await c.req.json();

  // apply updates to existing object
  //   Object.assign(
  //     thing to change,
  //     changes to apply
  // )
  Object.assign(getBandById, body);

  return c.json(getBandById);
});

// ===============================

// DELETE -
// ===========

// remove a band by its index

app.delete("/bands/:id", (c) => {
  const id = c.req.param("id");

  // band URL path must be a number
  if (isNaN(Number(id))) {
    return c.json({ error: "ID must be a number" }, 400);
  }

  // get the index of the band given the ID of the chosen band
  const bandIndex = bands.findIndex((band) => band.id === Number(id));

  // guard clause if this returned value is -1, ie the bands id doesnt exist
  if (bandIndex === -1) {
    return c.json({ error: `The band id: ${id} is not found` }, 404);
  }

  // pull the band from the bands array by its index value
  bands.splice(bandIndex, 1);

  //return the remaining bands object in json
  return c.json({ bands });
});

// Start the Node server
serve({
  fetch: app.fetch,
  port: 2000,
});
