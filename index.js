//Imports
const express = require("express");
const app= express();
const port=80;
const passport = require('./auth');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { use } = require("passport");

const logout = require('express-passport-logout');

const fileUpload = require('express-fileupload');

var now = new Date();



// Configure fileupload
app.use(fileUpload());




//Static files

app.use(express.static('public'));
app.use('/css',express.static(__dirname+'public/css'));
app.use('/js',express.static(__dirname+'public/js'));
app.use('/images',express.static(__dirname+'public/images'));

//Set Views
app.set('views','./views');
app.set('view engine','ejs');

app.set("port",process.env.PORT || port) 
// bodyParser
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// cookieParser para manejo de sesiones
app.use(cookieParser('medicalRec SECRET'));

app.use(session({
    secret: 'medicalRec SECRET',
    resave: false,
    saveUninitialized: false
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session());


//Routes
app.use(require('./routes'));

//Listen  Port 8080
app.listen(app.get("port"),()=>{
    console.info("Listening on port:"+port);
})
