import { Hono } from "hono";
import { serve } from "@hono/node-server";
import bands from "../data/bands.js";

const app = new Hono();

// app.get("/bands", (c) => {
//   // lets create the genre query - remember /bands/ gives us the bands json data
//   // we want something like http://localhost:2000/bands?genre=metal
//
//   //the genre query
//   const genre = c.req.query("genre") ?? "all"; // this is the hono query with a fallback of 'all'
//
//   const filteredByGenre =
//     genre !== "all" ? bands.filter((band) => band.genre === genre) : bands;
//   return c.json(filteredByGenre);
// });

// instead of using a fallback of all we can just do this

app.get("/bands", (c) => {
  const genre = c.req.query("genre");

  const filteredGenre = genre
    ? bands.filter((band) => band.genre === genre)
    : [...bands];

  return c.json(filteredGenre);
});

// lets look for a band in the data
// somthing like http://localhost:2000/bands/korn

app.get("/bands/:name", (c) => {
  const bandName = c.req.param("name");

  const band = bands.find(
    (band) => band.name.toLowerCase() === bandName.toLowerCase(),
  );

  if (!band) {
    return c.json({ error: `The band: ${bandName} is not found` }, 404);
  }

  return c.json(band);
});

// serve http://localhost:2000
serve({
  fetch: app.fetch,
  port: 2000,
});
