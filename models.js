// Importing the mongoose package //
const mongoose = require('mongoose');

//Importing the bcrypt module
const bcrypt = require('bcrypt');

/**
 * Defining the schema for movie collections, in order to keep documents
 * in collections uniform, and structured.
 *  Title and Description are required in all movie documents,
 * @typedef {object} movieSchema
 * @property {string} Title
 * @property {string} Description
 * @property {string} ImagePath
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Description: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/**
 * Schema for users
 * Name, Password and Email are required in all users documents.
 * @typedef {object} userSchema
 * @property {string} Name
 * @property {string} Password
 * @property {string} Email
 * @property {Date} Birthday
 */
let userSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Birthday: Date,
  FavoriteMovies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    },
  ],
});

// Adding hashPassword function for hashing passwords
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Adding validatePassword to compare submitted hashed passwords
 * with the hashed passwords stored in the database
 * @param {string} password - hashed password
 * @return {boolean} - true if they match
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Creating the models //
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Exporting the models //
module.exports.Movie = Movie;
module.exports.User = User;
