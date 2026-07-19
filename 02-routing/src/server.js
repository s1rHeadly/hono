import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

//! ROUTE PARAMETERS
app.get("/", (c) => {
  return c.text("Routing Project");
});

app.get("/bands", (c) => {
  return c.text("List of Bands");
});

//? :name is a dynamic route parameter (also called a path parameter) -> /bands/[value]. eg /bands/pantera - /bands/korn
//? dont mistake this for a query paramater ie /bands/korn?album=issues?track=counting

/**
 * :name is a placeholder in the URL.
 * Hono captures whatever appears there.
 * c.req.param("name") retrieves that captured value.
 */
app.get("/bands/:name", (c) => {
  // -> think of :name as a variable name
  //? How do we get the value that replaces :name?
  //? Hono compares the request to the pattern.
  const bandName = c.req.param("name"); // -> retrieves that captured value.
  return c.text(`You requested the band ${bandName}`);
  /**
   * Pattern:  /bands/:name
   * Request:  /bands/pantera (from localhost -> thats the request -> then the returned response value)
   */
});

// now create a route param for say bands/pantera/cowboysfromhell or bands/korn/followtheleader
app.get("/bands/:name/albums/:album", (c) => {
  const bandName = c.req.param("name"); // gets the :name variable
  const albumName = c.req.param("album"); // gets the "album variable"

  return c.text(`Band: ${bandName} | album: ${albumName}`);
});

//! QUERY PARAMETERS
//? example: /bands?genre=metal

// http://localhost:2000/bands?genre=metal
app.get("/bands", (c) => {
  const genreQuery = c.req.query("genre");
  return c.text(`Genre filter: ${genre}`);
});

//! BUT this will cause a problem as we already have a route for "/bands" in our earlier coded route paramater
//! visiting  http://localhost:2000/bands?genre=metal will just show the route param we created earlier for '/bands/' and we get returned 'list of bands'
//! im goin to create a file called server2.js and refer to that to continue on with query params and adding dummy data
serve({
  fetch: app.fetch,
  port: 2000,
});
