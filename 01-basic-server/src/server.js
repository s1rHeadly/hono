import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono(); // this creates the new hono app for endpoints

// Root route -localhost:3000
app.get("/", (c) => {
  return c.text("Hono is running 🚀");
});

//api route for the json data returned  => localhost:3000/api
// app.get("/api", (c) => {
//   return c.json([
//     {
//       id: 1,
//       name: "David",
//       location: "Sydney",
//     },
//     {
//       id: 2,
//       name: "Kevin",
//       location: "Queensland",
//     },
//   ]);
// });

/**
    query strings (?name=)
    dynamic input to your API
   eg: http://localhost:3000/api?name=David
*/

app.get("/search", (c) => {
  const nameQuery = c.req.query("name");

  return c.json({
    message: "Search result",
    searchedFor: nameQuery,
  });
});

// http://localhost:3000/api?location=Sydney
app.get("/api", (c) => {
  const location = c.req.query("location");

  const users = [
    { name: "David", location: "Sydney" },
    { name: "Kevin", location: "Queensland" },
  ];

  if (location) {
    const filtered = users.filter(
      (user) => user.location.toLowerCase() === location.toLowerCase(),
    );

    return c.json(filtered);
  }

  return c.json(users);
});

// http://localhost:3000/search?name=David

serve({
  fetch: app.fetch,
  port: 3000,
});
