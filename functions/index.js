"use strict";

const functions = require("firebase-functions");

const express = require("express");
const cors = require("cors")({ origin: true });
const bodyParser = require("body-parser");

const app = express();

const {
  createAccount,
  updateAccount,
  findAccount,
  findAccounts,
  addImage,
  removeImage,
  updateGuestbook,
  validateFirebaseIdToken
} = require("./middleware/");

app.use(cors);
// app.use(validateFirebaseIdToken);

app.get("/", (req, res) => {
  return res
    .status(200)
    .send(
      "please contact balla media (admin@ballamedia.com) for more information."
    );
});
app.get("/a/:id", findAccount);

app.post("/account", bodyParser.json(), createAccount);
app.patch("/account/:aid", bodyParser.json(), updateAccount);
app.get("/account", bodyParser.json(), findAccounts);

app.patch("/guestbook/:aid", bodyParser.json(), updateGuestbook);

app.post("/image/:aid", addImage);
app.delete("/image", bodyParser.json(), removeImage);

// app.get("/photo/:pid",validateFirebaseIdToken,  findImage);

exports.app = functions.https.onRequest(app);
