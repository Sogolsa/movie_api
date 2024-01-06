const passport = require('passport'),
  // Defines basic HTTP authentication for login requests
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  // Allows you to authenticate users based on the JWT submitted alongside their request
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/*************************************************************************
LocalStrategy takes a takes a username and password from the request body,
and uses mongoose to check the database for a user with the same username.
If there is a match a callback function will be executed.
If error occurs, or if username can't be find in the database and error
message will be passed to the callback.***********************************/
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Name',
      passwordField: 'Password',
    },
    async (name, password, callback) => {
      console.log(`${name} ${password}`);
      await Users.findOne({ Name: name })
        .then((user) => {
          if (!user) {
            console.log('Incorrect Username');
            return callback(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          //Validating any password the user enters
          if (!user.validatePassword(password)) {
            console.log('Incorrect password');
            return callback(null, false, { message: 'Incorrect Password.'});
          }
          console.log('finished');
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            return callback(error);
          }
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      // JWT is extracted from the HTTP request
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      /*Secret key to verify the signature of the JWT, this signature verifies
        that the sender of the JWT is who says it is and also that JWT hasn't 
        been altered.*/
      secretOrKey: '28EDFAB6C466FEE32240574F22BAEC35D07FABD15C32DB3B4AC58EE07DAF1433',
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
