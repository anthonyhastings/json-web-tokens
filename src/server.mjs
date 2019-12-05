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

// Setting variable onto the applciation instance.
app.set('privateKey', config.privateKey);

// Parsing incoming urlencoded or JSON request bodies.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Attaching HTTP request logger.
app.use(morgan('dev'));

// GET: [PUBLIC] Root request.
app.get('/', function(request, response) {
  response.json({ message: 'Welcome to the root.' });
});

// POST: [PUBLIC] Create a User.
apiRoutes.post('/register', async (request, response) => {
  const existingUser = await User.findOne({ username: request.body.username });
  if (existingUser)
    return response.json({ success: false, message: 'User already exists.' });

  await new User({
    username: request.body.username,
    password: bcrypt.hashSync(request.body.password, 10),
    admin: true
  }).save();

  response.statusCode = 201;
  response.json({ success: true });
});

// POST: [PUBLIC] Authenticate User.
apiRoutes.post('/authenticate', async (request, response) => {
  const existingUser = await User.findOne({ username: request.body.username });
  if (!existingUser)
    return response.json({ success: false, message: 'User not found.' });

  const passwordMatches = bcrypt.compareSync(
    request.body.password,
    existingUser.password
  );

  if (!passwordMatches)
    return response.json({ success: false, message: 'Incorrect password.' });

  const token = jwt.sign(
    {
      _id: existingUser._id,
      username: existingUser.username,
      admin: existingUser.admin
    },
    app.get('privateKey'),
    {
      expiresIn: '1h'
    }
  );

  response.json({
    success: true,
    message: 'Token issued.',
    token
  });
});

// Adding middleware for token verification to make routes below private.
apiRoutes.use(function(request, response, next) {
  const token =
    request.body.token ||
    request.query.token ||
    request.headers['x-access-token'];

  if (token) {
    jwt.verify(token, app.get('privateKey'), function(error, decoded) {
      if (error) {
        response
          .status(403)
          .json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        request.decoded = decoded;
        next();
      }
    });
  } else {
    response
      .status(403)
      .send({ success: false, message: 'No token provided.' });
  }
});

// GET: [PRIVATE] Return all Users.
apiRoutes.get('/users', function(request, response) {
  User.find({}, function(error, users) {
    console.log(typeof users, users);
    response.json(users);
  });
});

// Apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// Starting the server.
app.listen(port);
