// Loading dependencies.
import express from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import mongoose from 'mongoose';
import morgan from 'morgan';
import config from './config.mjs';
import User from '../user.mjs';

// Creating client to fetch JWK.
const client = jwksClient({
  cache: true,
  jwksUri: config.jwksEndpoint,
  strictSsl: false
});

// Connect to the database.
mongoose.connect(config.database);

// Setting up Express application.
const app = express();
const port = process.env.PORT || 8080;
const apiRoutes = new express.Router();

// Attaching HTTP request logger.
app.use(morgan('dev'));

// Apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// Starting the server.
app.listen(port);

// GET: [PUBLIC] Root request.
app.get('/', (request, response) =>
  response.json({ message: 'Welcome to the Downstream Service' })
);

// Adding middleware for fetching JWKS, generating public PEM, and verifying token.
apiRoutes.use((request, response, next) => {
  const token = request.headers['x-access-token'];
  if (!token)
    return response
      .status(401)
      .send({ success: false, message: 'No token provided.' });

  client.getSigningKey(config.kid, (err, key) => {
    const publicPem = key.getPublicKey();

    jwt.verify(
      token,
      publicPem,
      { algorithms: ['RS256'] },
      (error, decoded) => {
        if (error)
          return response.status(401).json({
            success: false,
            message: `Failed to verify token; ${error.message}.`
          });

        response.locals.decodedToken = decoded;
        next();
      }
    );
  });
});

// GET: [PRIVATE] Return User.
apiRoutes.get('/users/myself', async (request, response) => {
  const { decodedToken: token } = response.locals;
  const existingUser = await User.findById(token._id);

  return response.json({ success: true, user: existingUser.toJSON() });
});
