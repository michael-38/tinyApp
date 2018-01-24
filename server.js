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
  let templateVars = { urls: urlDatabase }; //declare a variable that is an object (with a key urls) containing another object (urlDatabase)
  res.render("urls_index", templateVars); //render urls_index and passing the ejs/html page with templateVars
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new"); //render the urls_new ejs/html page when a request to /urls/new is received
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; //declear a variable that references the urlDatabase (an object), with the key req.params.shortURL
  res.redirect(longURL); //redirect to the original URL
});



app.post("/urls/:id", (req, res) => {
  let templateVars = { urls: [req.params.id,urlDatabase[req.params.id]]}; //declare a variable (which is an object with key "urls") that contains an array that consists of the shortURL random string (:id) and its corresponding original URL in urlDatabase
  res.render("urls_show", templateVars); //render the urls_show ejs/html page where user can edit the URL associated with a specific :id
});

app.post("/urls/:id/update", (req, res) => { //POST route when user clicks Update button on the urls_show page
  urlDatabase[req.params.id] = req.body.updatedURL; //update the urlDatabase with the updatedURL a user inputted
  res.redirect("/urls"); //redirect to the /urls (home) page
})

app.post("/urls/:id/delete", (req, res) => { //POST route when a user clicks Delete button on the urls_index (home) page
  delete urlDatabase[req.params.id]; //delete an entry from urlDatabase
  res.redirect("/urls"); //redirect to the /urls (home) page
});

app.post("/urls", (req, res) => { //POST route when user clicks Submit button on the urls_new page to create a new short URL
  randomString = exportedFunctions.generateRandomString(); //declare a variable with a randomly generated string
  urlDatabase[randomString] = req.body.longURL; // add new key-value pair to urlDatabase
  let templateVars = { urls: urlDatabase }; //declare a variable that is an object (with a key urls) containing another object (urlDatabase)
  res.render("urls_index", templateVars); //render urls_index and passing the ejs/html page with templateVars
});


app.listen(PORT, () => {
  console.log(`Currently listening on port ${PORT}!`); //to indicate server is listening to the correct port
});


