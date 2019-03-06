require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");

// run the code inside of the passport-setup.js file
require("./config/passport-setup.js");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Allow Cross-Origin Resource Sharing – CORS
// (allows access to the API from other domains/origins)
app.use(
  cors({
    // receive cookies from other domains/origins
    credentials: true,
    // only these domains/origins can access the API – the REACT domain!
    origin: ["http://localhost:3000"]
  })
);
// make our app create sessions & cookies for every browser/device
app.use(
  session({
    // set these default settings to avoid warnings
    resave: true,
    saveUninitialized: true,
    // session secret must be different for every app
    secret: process.env.SESSION_SECRET,
    // save session information inside our MongoDB
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
// activate some of the passport methods in our routes
app.use(passport.initialize());
// load the logged-in user's information once we are logged-in
app.use(passport.session());

const phone = require("./routes/phone-router.js");
// all routes in the phone router will start with "/api"
// (example: "/phones" -> "/api/phones")
app.use("/api", phone);

const auth = require("./routes/auth-router.js");
// all routes in the auth router will start with "/api"
// (example: "/logout" -> "/api/logout")
app.use("/api", auth);

const file = require("./routes/file-router.js");
app.use("/api", file);

module.exports = app;
