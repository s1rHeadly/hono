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
  //query
  const genreQuery = c.req.query("genre");
  // console.log(genreQuery); => preview http://localhost:2000/bands?genre=metal and view the result in the terminal window

  if (genreQuery) {
    const genreResults = bands.filter(
      (band) => band.genre.toLowerCase() === genreQuery.toLowerCase(),
    );
    if (genreResults.length === 0) {
      // nested if
      return c.json(
        { error: `No bands found for that genre ${genreQuery}` },
        404,
      );
    }
    return c.json(genreResults);
  }
  return c.json(bands);
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
