require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const cors = require("cors");

mongoose
  .connect("mongodb://localhost/ironphones-server-starter", {
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

const phone = require("./routes/phone-router.js");
// all routes in the phone router will start with "/api"
// (example: "/phones" -> "/api/phones")
app.use("/api", phone);

module.exports = app;
