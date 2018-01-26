const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const exportedFunctions = require("./app.js");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('randomkey_a1b3c5'));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey'],
  maxAge: 60 * 60 * 1000 // 1 hour
}));

app.set('view engine', 'ejs');



/*
Database
*/



const allURL =
  {
    "b2xVn2":
    { longURL: "http://www.lighthouselabs.ca",
      id: "user1RandomID"
    },
    "9sm5xK":
    { longURL: "http://www.google.com",
      id: "user2RandomID"
  }
};

const allUsers = {
  "user1RandomID" : {
      id: "user1RandomID",
      email: "user1@example.com",
      password: "1111"
    },
  "user2RandomID" : {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "2222"
    }
};



/*
Middleware/Reusable Functions
*/



function findUserVerifyPassword(userEmail, password) { //verify user's identity and password
  for (user in allUsers) {
    if (allUsers[user].email === userEmail && bcrypt.compareSync(password, allUsers[user].password)) {
      return allUsers[user]
    }
  }
  return false;
};

function urlsForUser(id) { //return all URLs created by a specific user
  var filteredURL = {};
  for (url in allURL) {
    if (id === allURL[url].id) {
      filteredURL[url] = allURL[url];
    }
  }
  return filteredURL;
};



/*
GET Routes
*/



app.get("/", (req, res) => {
  if (allUsers.hasOwnProperty(req.session.user_id)) { //if user is logged in, redirect to home page (/url)
    res.redirect("/urls");
  }
  else {
    res.redirect("/login") //redirect to login page
  }
});



app.get("/urls", (req, res) => {
  if (allUsers.hasOwnProperty(req.session.user_id)) {  //if user is logged in, render home page (/urls)
    let thisUsersURL = urlsForUser(req.session.user_id)
    let templateVars = {  //declare a variable (which is an object), to be passed on when rendering "urls_index" and "_header.ejs"
        allURL: thisUsersURL,
        user: allUsers[req.session.user_id]
        }
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("unauthorized access");
  }
});



app.get("/urls/new", (req, res) => {

  if (allUsers.hasOwnProperty(req.session.user_id)) { //if user is logged in, render "urls_new page"
      let templateVars = {
      user: allUsers[req.session.user_id] //for rendering heading with correct user email on the "urls_new" page
    };
    res.render("urls_new", templateVars); //render the urls_new page
  } else {
    res.redirect("/login");
    }
});



app.get("/urls/:id", (req, res) => {
  let thisUsersURL = urlsForUser(req.session.user_id) //list of URLs that were created by the user

  for (item in thisUsersURL) {
    if(req.params.id === item) { //if the link entered in the URL (:id) matches the URL database, then display the page
    let templateVars = {
      urls: [req.params.id, thisUsersURL[req.params.id]], //array consisting of the shortURL id and the list of URLs by this user
      user: allUsers[req.session.user_id] //for rendering heading with correct user email on the "urls_new" page
    };
      res.render("urls_show", templateVars)
    }
  }
    res.status(403).send("unauthorized access")
});



app.get("/u/:shortURL", (req, res) => {
  if (allURL[req.params.shortURL] === undefined) {
    res.status(404).send("Link not found");
  } else {
  let longURL = allURL[req.params.shortURL].longURL; //declear a variable that references the URL database (an object), with the key req.params.shortURL
  res.redirect(longURL); //redirect to the long URL
  }
});



app.get("/login", (req, res) => {
  if (allUsers.hasOwnProperty(req.session.user_id)) { //if user is logged in, render home page (/urls)
      res.redirect("/urls");
    }
    else {
      res.render("urls_login")
    }
});



app.get("/register", (req, res) => {
  if (allUsers.hasOwnProperty(req.session.user_id)) { //if user is logged in, render home page (/urls)
      res.redirect("/urls");
    }
    else {
      res.render("urls_register")
    }
});



/*
POST Routes
*/



app.post("/register", (req, res) => {
  let emailConflict = 0;
  for (accounts in allUsers) {
    if (req.body.email === allUsers[accounts].email) { //check if the email being used for registration already exists in the user database
      emailConflict += 1;
    }
  }
  if((req.body.email.length === 0) || (req.body.password.length === 0)) { //check if the user entered a blank email or password when registering
    res.status(400).send("Please enter an email address/password");
  } else if (emailConflict > 0) {
    res.status(400).send("Email already in use");
  } else {
    randomID = exportedFunctions.generateRandomString();
    allUsers[randomID] =
      {
        id: randomID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      }
  res.clearCookie("session");  //clear username cookie
  res.clearCookie("session.sig");  //clear username cookie
  req.session.user_id = randomID; //set new username cookie
  res.redirect("/urls");
    }
});



app.post("/login", (req, res) => {
  if((req.body.login_email.length === 0) || (req.body.login_password.length === 0)) {
      res.status(400).send("Please enter an email address/password");
  }
  const userEmail = req.body.login_email
  const password = req.body.login_password

  const user = findUserVerifyPassword(userEmail, password); //verify user and password

  if (user) {
    req.session.user_id = user.id; //set new username cookie
    res.redirect("/urls");
  } else { // 403 error
    res.status(403).send("User not found/password incorrect");
    }
});



app.post("/logout", (req, res) => {
  res.clearCookie("session");  //clear username cookie
  res.clearCookie("session.sig");  //clear username cookie
  res.redirect("/login");
});



app.post("/urls/new", (req, res) => { //POST route when user clicks Submit button on the urls_new page to create a new short URL
  randomString = exportedFunctions.generateRandomString();
  allURL[randomString] = {
    longURL: req.body.longURL,
    id: req.session.user_id
  };
  res.redirect("/urls");
});



app.post("/urls/:id", (req, res) => {
  let templateVars = {
    urls: [req.params.id, allURL[req.params.id]],
    user: allUsers[req.session.user_id]
    };
  res.render("urls_show", templateVars);
});



app.post("/urls/:id/update", (req, res) => { //POST route when user clicks Update button on the urls_show page
  allURL[req.params.id] = {
    longURL: req.body.updatedURL,
    id: req.session.user_id
    }; //update the urlDatabase with the updatedURL the user entered
  res.redirect("/urls"); //redirect to the /urls (home) page
});



app.post("/urls/:id/delete", (req, res) => { //POST route when a user clicks Delete button on the urls_index (home) page
  delete allURL[req.params.id]; //delete an entry from urlDatabase
  res.redirect("/urls"); //redirect to the /urls (home) page
});



app.listen(PORT, () => {
  console.log(`Currently listening on port ${PORT}!`); //to indicate server is listening to the correct port
});
