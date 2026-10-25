// our hono imports
import { Hono } from "hono";
import { serve } from "@hono/node-server";

// the imported bands data
import bands from "../data/bands.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("API Design Project");
});

/**
 * get requests
 */

app.get("/bands", (c) => {
  console.log("getting", { bands });

  //! Query parameters operate on the resource identified by the URL path. In this case the resource is bands /bands -> anthing after are queries params which modify the resourse
  // Get query parameters
  const genreQuery = c.req.query("genre");
  const sortQuery = c.req.query("sort");
  const searchQuery = c.req.query("search");

  // Copy bands array to avoid mutation
  let results = [...bands];

  // GENRE QUERY
  if (genreQuery) {
    results = results.filter(
      (band) => band.genre.toLowerCase() === genreQuery.toLowerCase(),
    );

    if (results.length === 0) {
      return c.json({ error: `Genre "${genreQuery}" does not exist` }, 404);
    }
  }

  // SORT QUERY
  if (sortQuery) {
    if (sortQuery === "name") {
      results.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
    } else {
      return c.json({ error: `Cannot sort by ${sortQuery}` }, 400);
    }
  }

  if (searchQuery) {
    results = results.filter((band) =>
      band.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (results.length === 0) {
      return c.json({ error: `No bands found matching "${searchQuery}"` }, 404);
    }
  }

  // Return final results
  return c.json(results);
});

/**
 * post requests
 */
app.post("/bands", async (c) => {
  console.log("Context:", c);

  console.log("Content-Type:", c.req.header("Content-Type"));

  // Get the body
  const body = await c.req.json();
  console.log("1. body:", body);

  if (!body.name || !body.genre) {
    console.log("2. Validation failed");
    return c.json({ error: "Missing required fields" }, 400);
  }

  console.log("2. Validation passed");

  // Create band object
  console.log("bands.length BEFORE:", bands.length);

  const newBand = {
    id: bands.length + 1,
    name: body.name,
    genre: body.genre,
  };

  console.log("newBand.id:", newBand.id);

  console.log("3. newBand:", newBand);

  console.log("Band name:", body.name);
  console.log("Genre:", body.genre);

  // Check if band exists
  const isExistingBand = bands.some(
    (band) => band.name.toLowerCase() === newBand.name.toLowerCase(),
  );

  console.log("4. isExistingBand:", isExistingBand);

  if (isExistingBand) {
    console.log("5. Duplicate band!");
    return c.json({ error: "Band already exists" }, 409);
  }

  bands.push(newBand);

  console.log("6. bands after push:", bands);

  return c.json(newBand, 201);
});

/**
 * patch requests
 *
 */

app.patch("/bands/:id", async (c) => {
  const bandId = Number(c.req.param("id"));

  const band = bands.find((band) => Number(band.id) === bandId);

  if (!band) {
    return c.json({ error: "No band exists by that number" }, 404);
  }

  const body = await c.req.json();

  if (body.name) {
    band.name = body.name;
  }

  if (body.genre) {
    band.genre = body.genre;
  }

  return c.json(band);
});

/**
 * delete requests
 */

app.delete("/bands/:id", async (c) => {
  const bandId = Number(c.req.param("id"));
  console.log(bandId);

  const bandIndex = bands.findIndex((band) => Number(band.id) === bandId); // just a recheck here - check the data to see if we are getting a string as a number - we are not - but its good for practice

  // if there is no band
  if (bandIndex === -1) {
    // means the band was not found (-1) means not in the array
    return c.json(
      {
        error: "Sorry the band you want to remove does not exist",
      },
      404,
    );
  }

  // if there IS a band get it from the array bands[2] etc
  const band = bands[bandIndex];
  console.log("get band", { band });

  // splice changes the original array remember
  bands.splice(bandIndex, 1);

  return c.json({ message: "Band deleted", band });
});

serve({
  fetch: app.fetch,
  port: 2000,
});

export default app;
