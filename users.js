const passport = require('passport');
const Models = require('./models.js');
const Users = Models.User;

module.exports = function (app) {
  //Get all the users
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
          res.status(500).send('Unable to retrieve users: ' + err);
        });
    }
  );

  //Get the users by name
  app.get(
    '/users/:Name',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
      await Users.findOne({ Name: req.params.Name })
        .then((users) => {
          res.status(201).json(users);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Unable to retrieve user Name: ' + err);
        });
    }
  );

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
                res.status(500).send('Error creating user: ' + error);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Something went wrong: ' + error);
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
          res.status(500).send('User not found: ' + err);
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
          res.status(500).send('Name not found: ' + err);
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
          res.status(500).send('Name not found: ' + err);
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
          res.status(500).send('Something went wrong: ' + err);
        });
    }
  );
};
