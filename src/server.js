// Loading dependencies.
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import morgan from 'morgan';
import config from './config';
import User from './user';

// Connect to the database.
mongoose.connect(config.database);

// Setting up Express application.
const app = express();
const port = process.env.PORT || 8080;
const apiRoutes = express.Router();

// Setting variable onto the applciation instance.
app.set('privateKey', config.privateKey);

// Parsing incoming urlencoded or JSON request bodies.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Attaching HTTP request logger.
app.use(morgan('dev'));

// GET: [PUBLIC] Root request.
app.get('/', function(request, response) {
    response.json({message: 'Welcome to the root.'});
});

// GET: [PUBLIC] Setup user.
app.get('/setup', function(request, response) {
    User.findOne({
        name: 'Geralt of Rivia'
    }, function(error, user) {
        if (error) {
            throw error;
        }

        if (user) {
            response.json({success: false, message: 'User already exists.'});
        } else {
            const sampleUser = new User({
                name: 'Geralt of Rivia',
                password: 'y3nn3f3r',
                admin: true
            });

            sampleUser.save(function(error) {
                if (error) {
                    throw error;
                }

                response.statusCode = 201;
                response.json({success: true});
            });
        }
    });
});

// GET: [PUBLIC] API root request.
apiRoutes.get('/', function(request, response) {
    response.json({message: 'Welcome to the API.'});
});

// POST: [PUBLIC] Authenticate User.
apiRoutes.post('/authenticate', function(request, response) {
    User.findOne({
        name: request.body.name
    }, function(error, user) {
        if (error) {
            throw error;
        }

        if (!user) {
            response.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {
            if (user.password !== request.body.password) {
                response.json({success: false, message: 'Authentication failed. Incorrect password.'});
            } else {
                const token = jwt.sign(user, app.get('privateKey'), {
                    expiresIn: '1h'
                });

                response.json({
                    success: true,
                    message: 'Authentication completed. Token issued.',
                    token: token
                });
            }
        }
    });
});

// Adding middleware for token verification to make routes below private.
apiRoutes.use(function(request, response, next) {
    const token = request.body.token || request.query.token || request.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('privateKey'), function(error, decoded) {
            if (error) {
                response.status(403).json({success: false, message: 'Failed to authenticate token.'});
            } else {
                request.decoded = decoded;
                next();
            }
        });
    } else {
        response.status(403).send({success: false, message: 'No token provided.'});
    }
});

// GET: [PRIVATE] Return all Users.
apiRoutes.get('/users', function(request, response) {
    User.find({}, function(error, users) {
        console.log(typeof(users), users);
        response.json(users);
    });
});

// Apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// Starting the server.
app.listen(port);
