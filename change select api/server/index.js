// Import the Hono class from the "hono" package — this is the web framework we're using to build our API
import { Hono } from "hono";

// Import the serve function from "@hono/node-server" — this starts an HTTP server on Node.js for our Hono app
import { serve } from "@hono/node-server";

// Import serveStatic — middleware that serves files from a folder (our public HTML/JS)
import { serveStatic } from "@hono/node-server/serve-static";

// Node path helpers so we can find the public folder reliably no matter where we run the command from
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Import our category routes from a separate file — keeps route logic organized instead of putting everything here
import { categoryRoutes } from "./routes/categories.js";

// __dirname equivalent in ES modules — points to the server/ folder this file lives in
const __dirname = dirname(fileURLToPath(import.meta.url));

// Absolute path to public/ (one level up from server/)
const publicDir = join(__dirname, "../public");

// Create a new Hono application instance — "app" is our main server object where we register routes and middleware
const app = new Hono();

// Call categoryRoutes and pass in our app — this registers all the /categories endpoints defined in that file
categoryRoutes(app);

// Define a GET route at "/test" — when someone visits http://localhost:5000/test, this handler runs
app.get("/test", (c) => {
  // "c" is the context object — it has helpers like .text(), .json(), etc. to send a response back to the client
  return c.text("working");
});

// Serve files under /public/* (e.g. /public/app.js) from the public folder
app.use(
  "/public/*",
  serveStatic({
    root: publicDir,
    rewriteRequestPath: (path) => path.replace(/^\/public\//, ""),
  })
);

// Serve index.html at the root URL so http://localhost:5000/ loads the dropdown demo page
app.get("/", serveStatic({ path: join(publicDir, "index.html") }));

// Start the server — tell Node to listen for incoming HTTP requests and hand them off to our Hono app
serve({
  // app.fetch is Hono's request handler — Node calls this for every incoming request
  fetch: app.fetch,
  // The port number our server listens on — clients connect to http://localhost:5000
  port: 5000,
});

// Log a message to the terminal so we know the server started successfully and which URL to open
console.log("Server running on http://localhost:5000");
