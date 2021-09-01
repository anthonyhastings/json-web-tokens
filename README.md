# JSON Web Tokens

## Introduction
This repository is a demonstration of how JSON Web Tokens (JWTs) can be used to add a layer of authentication to an application, ensuring only authorized users can access certain endpoints. It also shows how downstream services can utilize JSON Web Key Sets (JWKS) to verify a received token.

There are two services used in this example:

**Auth Service** - Registers a new user, logs that user in, generates a JWT and has an authenticated endpoint to retrieve user information.

**Downstream Service** - Contains an authenticated endpoint to retrieve user information.

## Installation
The entire application is dockerized so ensure that _Docker_ and _Docker Compose_ are installed and then run the following command:

```
docker-compose up
```

Watch for terminal output to indicate that web services, proxy services and the database service have started. Services can be accessed in the following ways:

| Service            | Port (Direct) | Port (Proxy) | Proxy (Web Viewer) |
| ------------------ | ------------- | ------------ | ------------------ |
| Auth Service       | 49802         | 49801        | 5000               |
| Downstream Service | 49804         | 49803        | 5001               |
| Database Service   | 49800         | N/A          | N/A                |

Accessing the web services via the proxy port will mean you can see and example the traffic by visiting the proxy web viewer port in your browser.

## Explanation / Demonstration
The Auth Service loads in a dummy private RSA-encoded PEM (not indicative of how a private key in a production environment would be loaded) and uses it to generate a JSON Web Key. This JWK is made available at a JWKS endpoint for other services to load and use for token verification purposes. If downstream services were to use the private key for verification that was used to originally sign the token, then downstream services would also be able to mint their own tokens, which is not ideal. We want that privilege to live only with our Auth service. This is how JWKS can ensure our Auth Service is the only service that can mint tokens (as it is the only service with access to the private key), but that every other service can verify tokens by generating a public key for the relevant JWK exposed via the JWKS endpoint.

To make interacting with the API easier, it's recommended to use a tool such as [Postman](https://www.postman.com/). Postman makes setting headers and request bodies much easier to deal with. I have exported all necessary requests into Postman, available below:

[Postman Collection](https://www.getpostman.com/collections/fa7a31a47fea849412d0)

The flow for running these commands should be as follows:

1. Trigger the "Auth Service (Proxy) - Myself" call and observe the resulting `401` response due to supplying an expired JWT.
1. Trigger the "Auth Service (Proxy) - Register" endpoint (which is pre-populated with credentials) to make a `User` record.
1. Trigger the "Auth Service (Proxy) - Authenticate" (which is pre-populated with credentials) to generate a JWT token with a lifespan of 30s, containing the relevant `User` record.
1. Take the token returned from the "Auth Service (Proxy) - Authenticate" endpoint and set it as the `x-access-token` header of the "Auth Service (Proxy) - Myself" call. Run the call and see the `User` record returned.
1. Use the same token from above and set it as the `x-access-token` header of the "Downstream Service (Proxy) - Myself" call. Run the call and see the `User` record returned.
1. Wait over 30 seconds and re-run the above "Downstream Service (Proxy) - Myself" call. You will now see a `401` error because the JWT token has expired and is invalid.

## Further Information
- [JSON Web Token Introduction](https://jwt.io/introduction/)
- [JSON Web Key Set](https://auth0.com/docs/tokens/concepts/jwks)
- [JSON Web Key Set Properties](https://auth0.com/docs/tokens/references/jwks-properties)
- [JWT using RSA Public/Private Key Pairs](https://www.youtube.com/watch?v=F0HLIe3kNvM)
- [Navigating RS256 and JWKS](https://auth0.com/blog/navigating-rs256-and-jwks/)
- [Generating Public and Private Keys Using OpenSSL](https://lunar.lyris.com/help/lm_help/12.0/Content/generating_public_and_private_keys.html)
- [Managing a Secure JSON Web Token Implementation](https://cursorblog.com/managing-a-secure-json-web-token-implementation/)
