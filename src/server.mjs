// Loading dependencies.
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import config from './config.mjs';
import User from './user.mjs';

// Connect to the database.
mongoose.connect(config.database);

// Setting up Express application.
const app = express();
const port = process.env.PORT || 8080;
const apiRoutes = new express.Router();

// Parsing incoming urlencoded or JSON request bodies.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Attaching HTTP request logger.
app.use(morgan('dev'));

// Apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// Starting the server.
app.listen(port);

// GET: [PUBLIC] Root request.
app.get('/', (request, response) => response.json({ message: 'Welcome!' }));

// POST: [PUBLIC] Create a User.
apiRoutes.post('/register', async (request, response) => {
  const existingUser = await User.findOne({ username: request.body.username });
  if (existingUser)
    return response
      .status(409)
      .json({ success: false, message: 'User already exists.' });

  const newUser = await new User({
    username: request.body.username,
    password: bcrypt.hashSync(request.body.password, 10),
    admin: true
  }).save();

  response.status(201).json({ success: true, user: newUser.toJSON() });
});

// POST: [PUBLIC] Authenticate User.
apiRoutes.post('/authenticate', async (request, response) => {
  const existingUser = await User.findOne({
    username: request.body.username
  });

  if (!existingUser)
    return response
      .status(404)
      .json({ success: false, message: 'User not found.' });

  const passwordMatches = bcrypt.compareSync(
    request.body.password,
    existingUser.password
  );

  if (!passwordMatches)
    return response
      .status(401)
      .json({ success: false, message: 'Incorrect password.' });

  response.json({
    success: true,
    token: jwt.sign(existingUser.toJSON(), config.privateKey, {
      expiresIn: '30s'
    })
  });
});

// Adding middleware for token verification to make routes below private.
apiRoutes.use((request, response, next) => {
  const token = request.headers['x-access-token'];
  if (!token)
    return response
      .status(401)
      .send({ success: false, message: 'No token provided.' });

  jwt.verify(token, config.privateKey, (error, decoded) => {
    if (error)
      return response.status(401).json({
        success: false,
        message: `Failed to verify token; ${error.message}.`
      });

    response.locals.decodedToken = decoded;
    next();
  });
});

// GET: [PRIVATE] Return User.
apiRoutes.get('/users/myself', async (request, response) => {
  const { decodedToken: token } = response.locals;
  const existingUser = await User.findById(token._id);

  return response.json({ success: true, user: existingUser.toJSON() });
});
