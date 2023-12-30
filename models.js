// Importing the mongoose package //
const mongoose = require('mongoose');
/* Defining the schema for movie and user collections, in order to keep
documents in both collections uniform, Title and Description are required
in all movie documents, Name, Password and Email are required in
all users documents.*/
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Description: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Name: {
        type: String, 
        required: true
    },
    Password: {
        type: String,
         required: true
        },
    Email: {
        type: String,
         required: true
        },
    Birthday: Date,
    FavoriteMovies: [{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Movie'
        }]
});

// Creating the models //
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Exporting the models //
module.exports.Movie = Movie;
module.exports.User = User;

