const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8080; // .env file yet to be created
const bodyParser = require("body-parser");
const exportedFunctions = require("./app.js");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('randomkey_a1b3c5'))

app.set('view engine', 'ejs');


/*
Database
*/

const allURL =
  {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
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
Middleware
*/

// function checkUser(req, res, next) {
//   if (req.path = "/login" || req.path = "/register") {
//     next ()
//     return
//   }
//   const currentUser = req.signedCookies.current_user
//   if (currentUser) {
//     req.currentUser = currentUser
//     next ()
//   }
//   else {
//     res.redirect("/login");
//   }
// }


// app.use(checkUser)


/*
Routes
*/


function findUserEmail(userEmail) {
  for (user in allUsers) {
    if (allUser[user].email === userEmail) {
      return true;
    } else {
      return false;
    }
  }
}


app.get("/", (req, res) => {
  console.log(req.cookies.user_id);
  let current_user = req.cookies.user_id
  if (current_user) {
    res.redirect("/urls");
  }
  else {
    res.render("urls_login")
  }
})


// if (findUsername(req.cookies["username"])) {
//   res.redirect("/urls");
//   } else {
//     res.redirect("/login");
//   }
// }

app.get("/urls", (req, res) => {
  // console.log(allUsers[req.cookies.user_id].email);
  let templateVars = {
  allURL: allURL ,
  user: allUsers[req.cookies.user_id].email
  }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  let templateVars = {  ////declare a variable (which is an object)
    urls: [req.params.id,allURL[req.params.id]], // with key "urls" that contains an array that consists of the shortURL random string (:id) and its corresponding original URL in urlDatabase
    user: allUsers[req.cookies.user_id].email
    };
  res.render("urls_new", templateVars); //render the urls_new ejs/html page when a request to /urls/new is received
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = allUsers[req.params.shortURL]; //declear a variable that references the urlDatabase (an object), with the key req.params.shortURL
  res.redirect(longURL); //redirect to the original URL
});

app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.get("/register", (req, res) => { //GET route for registration page
  console.log("landed on /register");
  res.render("urls_register"); // render the url_register ejs/html page when a request to /urls/new is received
});



app.post("/register", (req, res) => {
  let emailConflict = 0;
  for (accounts in allUsers) {
    if (req.body.email === accounts.email) {
      emailConflict += 1;
    }
  }
  if((req.body.email.length === 0) || (req.body.password.length === 0)) {
    res.status(400).send("Please enter an email address/password");
  } else if (emailConflict > 0) {
    res.status(400).send("Email already in use");
  } else {
    randomID = exportedFunctions.generateRandomString();
    allUsers[randomID] =
      {
        id: randomID,
        email: req.body.email,
        password: req.body.password
      }
  res.clearCookie("user_id");  //clear username cookie
  res.cookie("user_id", randomID); //set new username cookie
  res.redirect("/urls");
    }
});


app.post("/urls/:id", (req, res) => {
  let templateVars = {
    urls: [req.params.id, allURL[req.params.id]],
    user: allUsers[req.cookies.user_id].email
    };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => { //POST route when user clicks Update button on the urls_show page
  allURL[req.params.id] = req.body.updatedURL; //update the urlDatabase with the updatedURL a user inputted
  res.redirect("/urls"); //redirect to the /urls (home) page
});

app.post("/urls/:id/delete", (req, res) => { //POST route when a user clicks Delete button on the urls_index (home) page
  delete allURL[req.params.id]; //delete an entry from urlDatabase
  res.redirect("/urls"); //redirect to the /urls (home) page
});

app.post("/urls/new", (req, res) => { //POST route when user clicks Submit button on the urls_new page to create a new short URL
  randomString = exportedFunctions.generateRandomString(); //declare a variable with a randomly generated string
  allURL[randomString] = req.body.longURL; // add new key-value pair to urlDatabase
  res.redirect("/urls");
});


app.post("/login", (req, res) => {

if((req.body.email.length === 0) || (req.body.password.length === 0)) {
    res.status(400).send("Please enter an email address/password");
  }

const username = req.body.username
const password = req.body.password

const user = allUsers.find((user))



  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");  //clear username cookie
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Currently listening on port ${PORT}!`); //to indicate server is listening to the correct port
});
