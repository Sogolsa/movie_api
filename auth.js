/*Authenticate login requests using basic HTTP authentication 
and generate a JWT for the user.*/
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken'),
  passport = require('passport');

// Local passport file
require('./passport');

/********************************************************************
Create a JWT based on the username and password and then send back
 as a response to the client, if the username and password doesn't
exist, return the error message received from the LocalStrategy back
 to the client.******************************************************/
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Name, //username encoded in the JWT
    expiresIn: '7d', // Token will expire in 7 days.
    algorithm: 'HS256', // algorithm used to sign or encode the values of the JWT
  });
};

// POST LOGIN //
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(400).json('login error ' + error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
