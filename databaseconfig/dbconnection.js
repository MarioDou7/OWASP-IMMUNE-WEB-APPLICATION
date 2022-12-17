require('dotenv').config({path:'.env'})

const MySQL = require('mysql');

var Conn;
const connectDB = () => {
    Conn = MySQL.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    });
    
    return Conn.connect(function(err) {
        if (err) throw err;
        console.log("Connected to DataBase");
    });
}


const findall = () => {
    Conn.query("Select * from Users", function(err, result) {
        if (err) throw err;
        console.log(result);
    });    
}

const check_login = (name,password) => {
    var ret_name;

    Conn.query("SELECT * FROM Users WHERE Username = ? AND Password_SHA256 = SHA2(?, 256)", [
        name,
        password,
    ], function(err, data) {
        if (err) throw err;
        if (data.length > 0) {
            if (name == "Admin") ret_name = "admin";
            else ret_name = "user";
        } else {
            {page = 'login', 
                message = 'Wrong username or password'
            }
        }
    });
    return {ret_name , page , message};
}

const register_user = (email , name , password) => {
    Conn.query("SELECT * FROM Users WHERE Email = ?", [
        email,
    ], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            console.log("Email is already registered");
            return {page:'register', 
                message: 'This Email is already in use'
            }
        } else {
            // Adding the New User to the Database
            Conn.query("INSERT INTO Users (Username, Email, Password_SHA256) VALUES (?, ?, SHA2(?, 256))", [
                name,
                email,
                password,
            ], function(err, result) {
                if (err) throw err;
                return {page:'register', 
                    message: 'Registration Successful'
                }
            });
        }
    });
}
    
module.exports = { connectDB , check_login , register_user}
