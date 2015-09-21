var express = require("express"),
    app = express(),
    server = require("http").Server(app),
    io = require("socket.io").listen(server),
    views = __dirname + "/views",
    hogan = require("hogan-express"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    config = require("./config/config.js"),
    mongoose = require("mongoose").connect(config.url),
    db = mongoose.connection,
    MongoClient = require("mongodb").MongoClient,
    MongoConnect = require("connect-mongo")(session),
    passport = require("passport"),
    fbStrategy = require("passport-facebook").Strategy,
    chatRooms = [];

// MongoClient.connect("mongodb://localhost:27017/nodechat", function(error, db) {
  // if(error) throw error;
db.on('error', console.error.bind(console, "database connection error"));
db.once("open", function() {

  app.engine("html", hogan);
  app.set("view engine", "html");
  app.use(express.static("public"));
  app.use(cookieParser());

  var env = process.env.NODE_ENV || "dev";
  app.set("port", process.env.PORT || 3000);

  // in development it's fine to use in-browser session
  // while in production we must store sessions in DB to prevent memory leaks
  if(env === "dev") {
    app.use(session({
      secret: config.secret
    }));
  } else {
    app.use(session({
      secret: config.secret,
      store: new MongoConnect({
        // url: config.url,
        mongooseConnection: db,
        stringify: true
      })
    }));
  }

  app.use(passport.initialize());
  app.use(passport.session());

  require("./auth/auth.js")(passport, fbStrategy, config, mongoose);
  require("./routes/route.js")(express, app, passport, config, chatRooms);
  require("./socket/socket.js")(io, chatRooms);

  server.listen(app.get("port"), function() {
    console.log("running on port " + app.get("port"));
    console.log("environment: " + env);
  });

  // app.listen(3000, function() {
  //   console.log("running on port 3000");
  //   console.log("environment: " + env);
  // });
});

