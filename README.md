# JSON Web Tokens

## Introduction
This repository is a demonstration of how JSON web tokens (JWTs) can be used to add a layer of authentication to an application, and ensure only authorized users can access certain endpoints.

## Installation
The API server uses Express and the database server uses MongoDB. The entire application is dockerized so ensure that _Docker_ and _Docker Compose_ are installed and then run the following:

```
docker-compose up
```

Watch for terminal output to indicate that both servers have started. The API will be port-forwarded onto the host machine at
[http://localhost:49876](http://localhost:49876).

## Demonstration

To make interacting with the API easier, it's recommended to use a tool such as [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) to make the calls; it makes setting headers and request bodies much
easier to deal with. I have exported a starting set of Postman calls available below:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/1ea58c6930a22e603a8e)

The flow for running these commands should be as follows:

1. Trigger the "Myself (Unauthenticated)" call and observe the resulting `401` response due to not supplying a valid JWT.
1. Trigger the "Register" endpoint (which is pre-populated with credentials) to make a `User` record.
1. Trigger the "Authenticate" endpoint (which is pre-populated with credentials) to generate a 30 second JWT token containing the relevant `User` record.
1. Take the token returned from the "Authenticate" endpoint and set it as the `x-access-token` header of the "Myself (Authenticated)" call. Run the call and see the `User` record returned.
1. Wait over 30 seconds and re-run the call to the "Authenticate" endpoint. You will now see a `401` error because the JWT token has expired and is invalid.
