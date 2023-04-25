# Lesson 8 - Functions As A Service (Serverless)

Lesson 8 goes over Functions As A Service (FAAS) also known as serverless. FAAS
let you host server functions without having to maintain an actual server. This
can be beneficial because it lets you scale your app quickly without having to
invest heavily in server architecture early in the project. Some important
points to note are the following.

- FAAS can be built on top of different programming languages.
- Functions setup using FAAS only run when called. That means a VM or some
compute environment needs to spin up the first time an endpoint is hit and
may or may not stay alive for a short period of time to handle subsequent
requests.
- By default FAAS is stateless, so you need some type of database service
to store data. Most providers offer some type of database service.

Lesson 8 has us use Cloudflare's FAAS infrastructure to replace the product
list API.

