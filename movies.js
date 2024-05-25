const passport = require('passport');
const Models = require('./models.js');
const express = require('express');
const app = express();
let auth = require('./auth')(app);

const Movies = Models.Movie;

/**
 * READ
 * Get list of all movies
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object[]} a JSON object array of all movies
 */
module.exports = function (app) {
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

  /**
   * READ
   * Get a movie by it's title
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {object} a JSON object about a movie info by title
   */
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

  /**
   * READ
   * Get genre info from movies
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {object} a data object about a genre by name
   */
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

  /**
   * READ
   * Get info on director by name
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {object} a JSON object data about a director by name
   */
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
