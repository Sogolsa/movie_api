/* Importing mongoose and models.js, and integrating models 
with the rest of the application */
const express = require('express'); //Creating web application
const bodyParser = require('body-parser'); // For parsing the bodies of HTTP request
const morgan = require('morgan'); //logging middleware that generates server request logs
const fs = require('fs'); // built-in node modules
const path = require('path'); // built-in node modules
const uuid = require('uuid'); // Generating unique identifiers
const mongoose = require('mongoose'); // For interacting with mongoDB
const Models = require('./models.js'); //Importing custom data models

const Movies = Models.Movie; // Get data models from model.js file
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/cfMovieDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

require('dotenv').config();
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**********************************************************************
 Cross-origin resource sharing, for restricting and allowing access from
 different origins to the API.
CORS allows you to control which domains have access to the API's server,
and to keep it protected from malicious entities.************************/
const cors = require('cors');

// Allowing all the domains make request to the API
app.use(cors());

//Server-side input validation for the app
/*************************************************************************
 validating inputs, acting as a security measure and preventing
 bugs to minimize the risk of those inputs containing malicious scripts.
 And ensuring only only expected types of data within the database will be
  stored.*****************************************************************/
const { check, validationResult } = require('express-validator');

/* Importing auth.js file into the project, ensuring that
Express is available in auth.js */
let auth = require('./auth')(app);
let movies = require('./movies')(app);
let users = require('./users')(app);

// Requiring and importing Passport module //
const passport = require('passport');
require('./passport');

/* Create a write stream. 'a' flag is used for appending a new data to the file */
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// Setup the logger //
app.use(morgan('combined', { stream: accessLogStream }));

/* READ, a default text response */
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

/*******************************************************************
Error handling middleware, to catch errors during the processing of
a request. Information about the current error will be logged to the
terminal using err.stack. This middleware should be last defined, but
before the app.listen().**********************************************/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

/* process.env.PORT looks for a pre-configured port number in the environment
 variable, and, if nothing is found, sets the port to a certain port number */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});
