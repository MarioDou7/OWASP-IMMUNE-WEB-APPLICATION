// Copyright Loka & Dou7, Inc. and other contributors.
// ======================================================================================
// ------------------------ Importing Some Required Dependencies ------------------------
// ======================================================================================
const db            = require('./databaseconfig/dbconnection')
const controller    = require('./controller/index')
const createError   = require('http-errors')
const session       = require('express-session')
const flash         = require('express-flash')
const express       = require('express')
const logger        = require('morgan')
const path          = require('path')
const modemon       = require('nodemon')
const cookieParser  = require('cookie-parser')
const bodyParser    = require('body-parser')
const dotenv        = require('dotenv')
var formidable      = require('formidable');
var fs              = require('fs');
const multer        = require("multer");
const { randomInt } = require('crypto');
const rateLimit     = require('express-rate-limit');
const { escape } = require('querystring')

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

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 3, // Limit each IP to 3 requests per `window` (here, per 1 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    message:
    'Too many accounts created from this IP, please try again after an 15 seconds',
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    blockDuration: 15 , //block duration with seconds
})



var otp = 0;
var user = {};      //logged in user object


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

    console.log(req.body)


    // Ensure that the password and password confirmation are the same
    if (password !== password_confirm) {
        return res.render('register', {
            message: 'Passwords do not match'
        });
    }

    // (Min 8 Chars | 1 Uppercase | 1 Lowercase | 1 Number | 1 Special Char)
    var respones = controller.verify_password(password);

    if (respones){
        return res.render("register", {message: respones.message})
    }
    // Ensure theat the Email Address is not already registered
    respones = db.register_user(email, name,password);
    
    return res.render(respones.page, {message: respones.message})
    
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/auth/login", limiter, async (req, res) => {
    // Check the Entered Credentials against the Database

    var name = req.body.name;
    var password = req.body.password;

    if (name && password) {
        user = await db.check_login(name,password);
        if(user)
        {
            //Genrate otp
            otp = controller.Genrate_OTP();
            
            console.log("OTP: ",otp)
            console.log(user);
            
            //send mail function   
            controller.SendMail(user.Email, otp);

            return res.redirect("2FactorAuth");
        }
        else {
            return res.render("login", {message: "Wrong username or password"})
        }
    }



});
app.get("/auth/2FactorAuth", (req,res) => {
    res.render("2FactorAuth");
});

app.post("/auth/2FactorAuth", (req, res) => {

    const pin = req.body.pin;
    //compare pin with the otp
    if(pin == otp)
    {
        console.log("Welcome user, ", user.Username);   
        // if true render page user
        if(user.Username == "Admin") return res.render("admin",)
        else return res.redirect("/user")
    }
    //false send message with false otp
    
    return res.render("2FactorAuth",{success:"Wrong OTP"})
    
});


app.get("/user", (req, res) => {
    res.render("user",{username: escape(user.Username)});
});


var storage = multer.diskStorage({
    destination: function(req, file, cb) { cb(null, './uploads') },
    filename: function(req, file, cb) { cb(null, file.originalname) }
})
var upload = multer({ storage: storage })
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

app.post("/fileUpload", upload.single('image'), (req, res) => {
    // If No Image is specified
    if (!req.file) return res.render('user', {
        message: 'Please Select an Image'
    });

    // Allowed Image Extensions
    const Extensions = ['png', 'jpeg', 'jpg', 'gif'];

    // Getting the extension of the uploaded file
    const FileType = req.file.originalname.slice(
        ((req.file.originalname.lastIndexOf('.') - 1) >>> 0) + 2);

    // If the Uploaded file is not an image
    if (!Extensions.includes(FileType.toLowerCase())) {
        fs.unlinkSync(req.file.path);
        return res.render('user', { message: 'Only Images are Allowed' });
    }

    // If the Uploaded Image Size is larger than 100 KB
    if ((req.file.size / (1024)) > 100) {
        fs.unlinkSync(req.file.path);
        return res.render('user', { message: 'Image Size is too Big (100 KB Max)' });
    }

    return res.render('user', {
        success: 'Image Uploaded Successfully',
        image: req.file.path
    });
});

// Start Listening on the Specified Port
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});