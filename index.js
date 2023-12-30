/* Importing mongoose and models.js, and integrating models 
with the rest of the application */

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfMovieDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require('express'),
  bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* READ, a default text response */
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// CREATE, add a user //
/*Check if the user with the name provided by the client already exists,
if the user exists then send back the appropriate message,
if the user doesn't exist, create the new user with mongoose CREATE command.*/
app.post('/users', async (req, res) => {
  await Users.findOne({ Name: req.body.Name })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Name + 'already exists');
      } else {
        Users.create({
          Name: req.body.Name,
          Password: req.body.Password,
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
});

// UPDATE, Allow users to update their users info
app.put('/users/:Name', async (req, res) => {
  await Users.findOneAndUpdate(
    {
      Name: req.params.Name,
    },
    {
      $set: {
        Name: req.body.Name,
        Password: req.body.Password,
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
});

// CREATE, add a movie to user name's list
app.post('/users/:Name/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate(
    {
      Name: req.params.Name,
    },
    {
      $push: {
        favoriteMovies: req.params.MovieID
      }
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
});

// DELETE, allowing users to remove a movie from their list of favorites
app.delete('/users/:Name/movies/:MovieID', async (req, res) => {
  await Users.findOneAndDelete(
    {
      Name: req.params.Name,
    },
    {
      $pull: {
        favoriteMovies: req.params.MovieID
      }
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
});

// DELETE, allow users to deregister
/*Get the user's name from the endpoint, pass it through the req.params, check if the user exists,
if the user exists delete it, and if doesn't exist send a text the user was not
found.*/
app.delete('/users/:Name', async (req, res) => {
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
});

// READ, return JSON object of all movies when at /movies
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// // READ, returning a JSON movie info when looking for specific title //
app.get('/movies/:title', async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ, Get JSON genre info when looking for specific genre //
app.get('/movies/genres/:genreName', async (req, res) => {
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
});
// READ, Get info on director when looking for a specific director by name.
app.get('/movies/director/:directorName', async (req, res) => {
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
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
