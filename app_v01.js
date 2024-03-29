//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
//const md5 = require('md5');
const bcrypt = require("bcrypt");
const saltRounds = 5;





const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email : String,
  password : String
});

//const secret = process.env.SECRET;
//userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);


app.get('/', (req, res) => {
  res.render('home');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log("Username Exist");
        res.render('register');
      } else {
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
          const newUser = new User({
            email: req.body.username,
            password: hash
          });
          newUser.save((err) => {
            if (err) {
              console.log(err);
            } else {
              res.render('secrets');
            }
          });
        });
      } // if foundUser close
    } //if err close
  }); //User close
}); //app.post close

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, (err, result) => {
          if (result) {
            console.log('login success');
            res.render('secrets');
          } else {
            res.render('login');
            console.log('Wrong password');
          }
        });

      } else {
        res.render('login');
        console.log('username doesnt exist.');
      }
    }
  });
});



app.listen(3000, () => console.log("Server started port 3000."));
