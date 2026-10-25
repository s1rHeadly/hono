You've now covered the core CRUD behaviour and API query design, which was the point of this project.

Project 04 — API Design
Method	Route	What you learned
GET	/bands	Query params, filtering, sorting
POST	/bands	Request body, validation, creating resources
PATCH	/bands/:id	Route params, finding & updating resources
DELETE	/bands/:id	findIndex() + splice()
GET	/bands?genre=metal&sort=name	Combining query parameters

And you've learned some really important underlying concepts, not just Hono syntax:

c.req.query() → query parameters
c.req.param() → route parameters
c.req.json() → incoming JSON body
c.json() → outgoing JSON response
find() → give me the object
findIndex() → give me its position
filter() → give me matching items
some() → does one exist?
slice() → copy/extract without changing the original
splice() → modify the original array
HTTP method + URL together define the API operation
400, 404, 409, 201, etc.
testing APIs with fetch() from the browser console

And probably my favourite bit from today:

URL = which resource
HTTP method = what action

That was a genuine light-bulb moment. 💡

One thing I wouldn't do

I wouldn't add another bunch of features just to make Project 04 "bigger."

The purpose was API design, and you've got the concepts.

Save your notes, commit the project if you're using Git, and close Project 04. ✅

Then we move to Project 05 — Mini API Project, where we get to put these pieces together into something that feels more like a real little API.

And this time, same rules:

requirements → pseudocode → you write it → test → debug.

