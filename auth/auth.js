module.exports = function(passport, fbStrategy, config, mongoose) {

  // define a model for "users" collection
  var user = new mongoose.Schema({
    fbID: String,
    name: String,
    profilePic: String
  });

  // creates a collection "users" based on "user" model defined above
  var userModel = mongoose.model("users", user);

  // To support persistent login sessions, Passport needs to be able to
  // serialize users into and deserialize them out of the session.
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    userModel.findById(id, function(error, user) {
      done(error, user);
    });
  });

  // FB strategy calls "verify" function which accepts fb credentials
  // and then invokes a callback with a user object
  passport.use(new fbStrategy({
    clientID: config.fb.appId,
    clientSecret: config.fb.appSecret,
    callbackURL: config.fb.callbackURL,
    profileFields: ["id", "displayName", "photos"]
  }, function(accessToken, refreshToken, profile, done) {
    userModel.findOne({fbID: profile.id}, function(error, isUser) {
      if(error) throw error;
      // if user already exists then just return it
      // else create a new one
      if(isUser) {
        done(null, isUser);
      } else {
        var newUser = new userModel({
          fbID: profile.id,
          name: profile.displayName,
          profilePic: profile.photos[0].value || ""
        });

        newUser.save(function(error) {
          done(null, newUser);
        });
      }
    });
  }));
};