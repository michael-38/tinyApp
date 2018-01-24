var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; // .env file yet to be created
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var exportedFunctions = require("./app.js");

app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id };
//   // console.log(templateVars);
//   res.render("urls_show", templateVars);
// });


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];;
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  // console.log(req);
  console.log(req.params.id);
  console.log(urlDatabase);
  console.log("app post id/delete");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // add new key-value pair to urlDatabase
  randomString = exportedFunctions.generateRandomString();
  urlDatabase[randomString] = req.body.longURL;

  // console.log(randomString);
  // console.log(req.body.longURL);
  console.log(urlDatabase);
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  // res.redirect(301, `http://localhost:8080/urls/${randomString}`);
});





app.listen(PORT, () => {
  console.log(`Currently listening on port ${PORT}!`);
});