// Copyright Loka & Dou7, Inc. and other contributors.
// ======================================================================================
// ------------------------ Importing Some Required Dependencies ------------------------
// ======================================================================================
const createError = require('http-errors')
const session = require('express-session')
const flash = require('express-flash')
const express = require('express')
const logger = require('morgan')
const path = require('path')
const modemon = require('nodemon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const MySQL = require('mysql')
const dotenv = require('dotenv')
var formidable = require('formidable');
var fs = require('fs');
const multer = require("multer");

// ======================================================================================
// ----------------------------- Instantiate The Express App ----------------------------
// ======================================================================================
var app = express();
const port = 5000;
const publicDir = path.join(__dirname, './public')
app.use(express.static(publicDir))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs')
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
dotenv.config({ path: './.env' })
    // Cookie Parser Functionality
app.use(
    session({
        secret: 'OWASP_SECRET',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 },
    }),
);
app.use(flash());

// ======================================================================================
// ----------------------------- MySQL Database Connection ------------------------------
// ======================================================================================
var Conn = MySQL.createConnection({
    host: "localhost",
    user: "root",
    password: "My$qlR00t",
    database: "U_Data",
});

Conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

// ======================================================================================
// ------------------------------ The Internal App Logic --------------------------------
// ======================================================================================
// Get requests to the root ("/") will route here
app.get('/', (req, res) => {
    // Server responds by sending the index.hbs file to the client's browser
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

// Validating the Registration Data
app.post("/auth/register", (req, res) => {
    // Getting the registration form Data
    var { name, email, password } = req.body
    var password_confirm = req.body.passwordConf;

    // Ensure that the password and password confirmation are the same
    if (password !== password_confirm) {
        return res.render('register', {
            message: 'Passwords do not match'
        })
    }

    // (Min 8 Chars | 1 Uppercase | 1 Lowercase | 1 Number | 1 Special Char)
    if (password.length < 8 || password.length > 32) {
        return res.render('register', {
            message: 'Your Password Show be Between 8 - 32 Characters'
        })
    } else if (!password.match(".*\\d.*")) {
        return res.render('register', {
            message: 'Your Password Show Contain At least 1 Digit'
        })
    } else if (!password.match(".*[a-z].*")) {
        return res.render('register', {
            message: 'Your Password Show Contain At least 1 Lowercase Character'
        })
    } else if (!password.match(".*[A-Z].*")) {
        return res.render('register', {
            message: 'Your Password Show Contain At least 1 Uppercase Character'
        })
    } else if (!password.match('[!@#$%^&*(),.?":{}|<>]')) {
        return res.render('register', {
            message: 'Your Password Show Contain At least 1 Special Character'
        })
    }

    // Ensure theat the Email Address is not already registered
    Conn.query("SELECT * FROM Users WHERE Email = ?", [
        req.body.email,
    ], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            console.log("Email is already registered");
            return res.render('register', {
                message: 'This Email is already in use'
            })
        } else {
            // Adding the New User to the Database
            Conn.query("INSERT INTO Users (Username, Email, Password_SHA256) VALUES (?, ?, SHA2(?, 256))", [
                req.body.name,
                req.body.email,
                req.body.password,
            ], function(err, result) {
                if (err) throw err;
                return res.render('register', {
                    success: 'Registration Successful'
                })
            });
        }
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/auth/login", (req, res) => {
    // Check the Entered Credentials against the Database
    var name = req.body.name;
    var password = req.body.password;

    //var query = `SELECT * FROM Users WHERE Username = "${name}" AND Password_SHA256 = SHA2("${password}", 256)`
    if (name && password) {
        Conn.query("SELECT * FROM Users WHERE Username = ? AND Password_SHA256 = SHA2(?, 256)", [
            req.body.name,
            req.body.password,
        ], function(err, data) {
            if (err) throw err;
            if (data.length > 0) {
                if (name == "Admin") res.render("admin");
                else res.render("user");
            } else {
                return res.render('login', {
                    message: 'Wrong username or password'
                })
            }
        });
    }
});

app.post("admin", (req, res) => {
    res.render("admin");
});

app.post("user", (req, res) => {
    res.render("user");
});

const upload = multer({
    dest: "/path/to/temporary/directory/to/store/uploaded/files"
});

app.post("/fileUpload", (req, res) => {
    upload.single("file"), (req, res) => {
        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, "./images/image.png");

        fs.rename(tempPath, targetPath, err => {
            if (err) throw err;
            return res.render('user', {
                message: 'Image Uploaded Successfully'
            })
        });
    }
});

// Start Listening on the Specified Port
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});