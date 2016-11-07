# JSON Web Tokens

## Introduction
The repository is a demonstration of how JSON web tokens can be used to add
an authentication layer to an API, and ensure only authorized users can access
certain endpoints.

## Installation
The API server uses Express and the database server uses MongoDB. Both servers
are created and run via Docker. Ensure that _Docker_ and _Docker Compose_ are installed and then run the following:

```
docker-compose up
```

Watch for terminal output to indicate that both servers have started. The API
will be port-forwarded onto the host machine at
[http://localhost:49876](http://localhost:49876).

## Demonstration

To make interacting with the API easier, it's recommended to use a tool such
as [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) to make the calls; it makes setting headers and request bodies much
easier to deal with.

You can ensure that the API server is working and responding to requests by hitting the root of the server, which should return some JSON:

```
GET / HTTP/1.1
Host: localhost:49876
Cache-Control: no-cache
Content-Type: application/x-www-form-urlencoded
```

Once the server has been confirmed as working, create a user account using the helper endpoint as demonstrated below:

```
GET /setup HTTP/1.1
Host: localhost:49876
Cache-Control: no-cache
Content-Type: application/x-www-form-urlencoded
```

With a user now setup, try hitting the `/users` endpoint:

```
GET /api/users HTTP/1.1
Host: localhost:49876
Cache-Control: no-cache
Content-Type: application/x-www-form-urlencoded
```

It will be forbidden as it is an authenticated endpoint and requires the user supply a JSON Web Token. To retrieve one, post the users name and password to the authentication endpoint:

```
POST /api/authenticate HTTP/1.1
Host: localhost:49876
Cache-Control: no-cache
Content-Type: application/x-www-form-urlencoded

name=Geralt+of+Rivia&password=y3nn3f3r
```

This shall return a token that can now be used for the `/users` endpoint earlier. Send it as a header and data will now be returned:

```
GET /api/users HTTP/1.1
Host: localhost:49876
x-access-token: PUT_TOKEN_HERE
Cache-Control: no-cache
Content-Type: application/x-www-form-urlencoded
```
