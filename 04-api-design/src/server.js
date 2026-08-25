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
  // Get query parameters
  const genreQuery = c.req.query("genre");
  const sortQuery = c.req.query("sort");

  // Copy bands array to avoid mutation
  let results = [...bands];

  // GENRE QUERY
  if (genreQuery) {
    results = results.filter(
      (band) => band.genre.toLowerCase() === genreQuery.toLowerCase(),
    );
  }

  // SORT QUERY
  if (sortQuery) {
    results.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
  }

  // Return final results
  return c.json(results);
});

/**
 * post requests
 */

/**
 * patch requests
 */

/**
 * delete requests
 */

serve({
  fetch: app.fetch,
  port: 2000,
});

export default app;
