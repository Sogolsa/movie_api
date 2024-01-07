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

mongoose.connect('mongodb://localhost:27017/cfMovieDB', {
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

// CREATE, add a user //
/***************************************************************************
Check if the user with the name provided by the client already exists,
if the user exists then send back the appropriate message,
if the user doesn't exist, create the new user with mongoose CREATE command.
*****************************************************************************/
app.post(
  '/users',
  [
    // Validation logic
    check('Name', 'Name is required').isLength({ min: 4 }), //Minimum value of 5 character only is allowed
    check(
      'Name',
      'Name contains non alphanumeric characters-not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(), // Is not empty
    check('Email', 'Email does not appear to be valid.').isEmail(),
  ],
  async (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    // Search to see if a user with the requested Name already exists
    await Users.findOne({ Name: req.body.Name })
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Name + 'already exists');
        } else {
          Users.create({
            Name: req.body.Name,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// UPDATE, Allow users to update their users info
app.put(
  '/users/:Name',
  passport.authenticate('jwt', { session: false }),
  [
    // Validation logic
    check(
      'Name',
      'Name contains non alphanumeric characters-not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(), 
    check('Email', 'Email does not appear to be valid.').isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    if (req.user.Name !== req.params.Name) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
      {
        Name: req.params.Name,
      },
      {
        $set: {
          Name: req.body.Name,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// CREATE, add a movie to user name's list
app.post(
  '/users/:Name/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      {
        Name: req.params.Name,
      },
      {
        $push: {
          FavoriteMovies: req.params.MovieID,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// DELETE, allowing users to remove a movie from their list of favorites
app.delete(
  '/users/:Name/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      {
        Name: req.params.Name,
      },
      {
        $pull: {
          FavoriteMovies: req.params.MovieID,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// DELETE, allow users to deregister
/**********************************************************************
Get the user's name from the endpoint, pass it through the req.params,
check if the user exists, if the user exists delete it, and if doesn't
exist send a text the user was not found.******************************/
app.delete(
  '/users/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ Name: req.params.Name })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Name + 'was not found');
        } else {
          res.status(200).send(req.params.Name + 'was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ, return JSON object of all movies when at /movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get(
  '/users/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOne({Name: req.params.Name})
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// // READ, returning a JSON movie info when looking for specific title //
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ, Get JSON genre info when looking for specific genre //
app.get(
  '/movies/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({
      'Genre.Name': req.params.genreName,
    })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);
// READ, Get info on director when looking for a specific director by name.
app.get(
  '/movies/director/:directorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({
      'Director.Name': req.params.directorName,
    })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

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
  console.log('Listening on port' + port);
})
