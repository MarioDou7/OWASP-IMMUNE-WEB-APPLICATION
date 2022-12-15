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
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const MySQL = require('mysql')
const dotenv = require('dotenv')

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
    const { name, email, password, password_confirm } = req.body

    // Ensure theat the Email Address is not already registered
    Conn.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res.render('register', {
                message: 'This Email is already in use'
            })
        }
    });

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

    // MySQL Query for Inserting Data
    var SqlQuery = `INSERT INTO Users (Username, Email, Password_SHA256) VALUES 
            ("${name}", "${email}", SHA2("${password}", 256));`;

    // Adding the New User to the Database
    Conn.query(SqlQuery, function(err, result) {
        if (err) throw err;
        return res.render('register', {
            success: 'Registration Successful'
        })
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/auth/login", (req, res) => {
    // Check the Entered Credentials against the Database
    var email = req.body.L_Email;
    var password = req.body.L_Password;

    if (email && password) {
        SqlQuery = `SELECT * FROM Users WHERE Email = "${email}" AND Password_SHA256 = "SHA2("${password}", 256)`;

        Conn.query(query, function(err, data) {
            if (err) throw err;

            if (data.length > 0) {
                req.session.loggedin = true;
                console.log("Login successful");
                res.sendFile("/user.html", { root: __dirname });
            } else {
                res.send('Incorrect Email or Password');
                console.log("Incorrect Email or Password");
            }
        });
    } else {
        res.send('Please Enter Email Address and Password Details');
        console.log("Please Enter Email Address and Password");
    }
});

// Start Listening on the Specified Port
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});