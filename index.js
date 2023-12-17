const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: 'John',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Bella',
    favoriteMovies: []
  }
];
let movies = [
  {
    title: 'Million Dollar Baby',
    director: 'Clint Eastwood',
    genre: {
      name: 'Drama',
      description: ''
    } 
  },
  {
    title: 'Fiddler On The Roof',
    director: 'Norman Jewison',
    genre: {
      name: 'Romance',
      description: ''
    }
  },
  {
    title: 'The Sound of Music',
    director: 'Robert Wise',
    genre: {
      name: 'Romance',
      description: ''
    }
  },
  {
    title: '10 Things I Hate About You',
    director: 'Gil Junger',
    genre: {
      name: 'Romance',
      description: ''
    }
  },
  {
    title: 'A beautiful Mind',
    director: 'Ron Howard',
    genre: {
      name: 'Drama',
      description: ''
    } 
  },
  {
    title: 'The Curious Case of Benjamin Button',
    director: 'David Fincher',
    genre: {
      name: 'Romance',
      description: ''
    }
  },
  {
    title: 'Forest Gump',
    director: 'Robert Zemeckis',
    genre: {
      name: 'Drama',
      description: ''
    }
  },
  {
    title: 'The Green Mile',
    director: 'Frank Darabont',
    genre: {
      name:'Mystery',
      description: ''
    }
  },
  {
    title: 'Catch Me If You Can',
    director: 'Steven Spielberg',
    genre: {
      name: 'Drama',
      description: ''
    }
  },
  {
    title: 'Bicentennial Man',
    director: 'Chris Columbus',
    genre: {
      name: 'Romance',
      description: ''

    }
  },
];

// CREATE //
app.post('/users', (req, res) => {
  const newUser = req.body;

  if(newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    const message = 'Users need names!';
    res.status(400).send(message);
  }
})

// UPDATE //
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user!')
  }
})

// CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s favorite movies`);
  } else {
    res.status(400).send('No such user!')
  }
})

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been deleted from user ${id}'s favorite movies`);
  } else {
    res.status(400).send('No such user!')
  }
})

// DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(` user ${id} has been deleted.`);
  } else {
    res.status(400).send('No such user!')
  }
})


// READ//
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

// READ //
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie!')
  }
})

// READ //
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre!')
  }
})

// READ //
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const directorByName = movies.find(movie => movie.director === directorName);

  if (directorByName) {
    res.status(200).json(directorByName);
  } else {
    res.status(400).send('No such director!');
  }
})

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
