module.exports = function (express, app, passport, config, chatRooms) {
  var router = express.Router();

  router.get("/", function (req, res, next) {
    res.render("index", {title: "Welcome"});
  });

  // route to facebook.com to authenticate the request
  router.get("/auth/facebook", passport.authenticate("facebook"));

  // if auth is successful redirect back to the app
  router.get("/auth/facebook/callback", passport.authenticate("facebook", {
    successRedirect: "/chatrooms",
    failureRedirect: "/"
  }));

  router.get("/chatrooms", secureAccess, function (req, res, next) {
    res.render("chatrooms", {
      title: "Chat Rooms",
      user: req.user, /* req.user object is returned from facebook callback */
      config: config
    });
  });

  router.get("/room/:name", secureAccess, function (req, res, next) {
    res.render("room", {
      user: req.user,
      roomName: req.params.name,
      config: config
    });
  });

  router.get("/logout", function (req, res, next) {
    req.logout();
    res.redirect("/");
  });

  // router.get("/color", function(req, res, next) {
  //   res.send("color is " + (req.session.color === undefined ? "none" : req.session.color));
  // });

  // router.get("/red", function(req, res, next) {
  //   req.session.color = "blue";
  //   res.send("session of color is set to blue");
  // });

  // allows access to internal pages of the app only for auth'ed users
  function secureAccess (req, res, next) {
    if(req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/");
    }
  }

  app.use("/", router);
};













