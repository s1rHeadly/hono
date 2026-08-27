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
