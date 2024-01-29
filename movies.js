const passport = require('passport');
const Models = require('./models.js');
let auth = require('./auth')(app);

const Movies = Models.Movie;

module.exports = function (app) {
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
          res.status(500).send('Unable to retrieve movies: ' + err);
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
          res.status(500).send('Unable to retrieve movie title: ' + err);
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
          res.status(500).send('Something went wrong: ' + err);
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
          res.status(500).send('Something is not right ' + err);
        });
    }
  );
};
