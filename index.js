const express = require('express'),
  morgan = require('morgan'),
  // Importing built in node modules//
  fs = require('fs'),
  path = require('path');

const app = express();

/* Create a write stream. 'a' flag is used for appending a new data to the file */

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// Setup the logger //
app.use(morgan('combined', {stream: accessLogStream}));


let top10Movies = [
  {
    title: 'Million Dollar Baby',
    director: 'Clint Eastwood',
  },

  {
    title: 'Fiddler On The Roof',
    director: 'Norman Jewison',
  },
  {
    title: 'The Sound of Music',
    director: 'Robert Wise',
  },
  {
    title: '10 Things I Hate About You',
    director: 'Gil Junger',
  },
  {
    title: 'A beautiful Mind',
    director: 'Ron Howard',
  },
  {
    title: 'The Curious Case of Benjamin Button',
    director: 'David Fincher',
  },
  {
    title: 'Forest Gump',
    director: 'Robert Zemeckis',
  },
  {
    title: 'The Green Mile',
    director: 'Frank Darabont',
  },
  {
    title: 'Catch Me If You Can',
    director: 'Steven Spielberg',
  },
  {
    title: 'Bicentennial Man',
    director: 'Chris Columbus',
  },
];

app.get('/', (req, res) => {
  res.send('Welcome to my top 10 movies!');
});

app.get('/movies', (req, res) => {
  res.json(top10Movies);
});

app.use('/documentation.html', express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
