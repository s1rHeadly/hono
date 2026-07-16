import { Hono } from "hono";
import { serve } from "@hono/node-server";

//? creates new hono app
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/about", (c) => {
  return c.text("This is the about page");
});

app.notFound((c) => {
  return c.text("Sorry, this page does not exist");
});

//? starts the app
serve({
  fetch: app.fetch,
  port: 2000,
});

export default app;
