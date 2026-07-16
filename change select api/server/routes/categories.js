export function categoryRoutes(app) {
  app.get("/api/categories", (c) => {
    return c.json([
      { id: 1, name: "Music" },
      { id: 2, name: "Movies" },
      { id: 3, name: "Books" },
    ]);
  });
}
