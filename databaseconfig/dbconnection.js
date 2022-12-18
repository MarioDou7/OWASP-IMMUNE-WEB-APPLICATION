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



const check_login = async (name,password) => {
    var ret_name;
    var page;
    var message;
    var result;

    try {
        result = await  Conn.query("SELECT * FROM Users WHERE Username = ? AND Password_SHA256 = SHA2(?, 256)", [
            name,
            password,
        ]);
        if(result.length > 0) {
            if (name == "Admin") ret_name = "admin";
            else ret_name = "user";
        } else {
            console.log("no return")
            page = 'login'; 
            message = 'Wrong username or password';
        }
        return {ret_name , page , message};
    } catch (error) {
        return console.error(error);
    }


    // await Conn.query("SELECT * FROM Users WHERE Username = ? AND Password_SHA256 = SHA2(?, 256)", [
    //     name,
    //     password,
    // ], function(err, data) {
    //     if (err) throw err;
    //     console.log(data);
    //     if (data.length > 0) {
    //         if (name == "Admin") console.log("return admin");//ret_name = "admin";
    //         else console.log("return user");//ret_name = "user";
    //     } else {
    //         console.log("no return")
    //         page = 'login'; 
    //         message = 'Wrong username or password';
            
    //     }
    //     return {ret_name , page , message};
    // });
    // console.log("in function ", ret_name , page , message)
}

const register_user = async (email , name , password) => {
    var result;
    try {
        result = await Conn.query("SELECT * FROM Users WHERE Email = ?", [email]);

        if (result.length > 0) {
            console.log("Email is already registered");
            return {
                page: 'Register',
                message: 'This Email is already in use'
            }
        } else {
            result = await Conn.query("INSERT INTO Users (Username, Email, Password_SHA256) VALUES (?, ?, SHA2(?, 256))", [
                name,
                email,
                password,
            ]);

            return {page:'register', 
                    message: 'Registration Successful'
                }
        }
    } catch (error) {
        return console.error(err.message);
    }
    // Conn.query("SELECT * FROM Users WHERE Email = ?", [
    //     email,
    // ], (err, result) => {
    //     if (err) throw err;
    //     if (result.length > 0) {
    //         console.log("Email is already registered");
    //         return {page:'register', 
    //             message: 'This Email is already in use'
    //         }
    //     } else {
    //         // Adding the New User to the Database
    //         Conn.query("INSERT INTO Users (Username, Email, Password_SHA256) VALUES (?, ?, SHA2(?, 256))", [
    //             name,
    //             email,
    //             password,
    //         ], function(err, result) {
    //             if (err) throw err;
    //             return {page:'register', 
    //                 message: 'Registration Successful'
    //             }
    //         });
    //     }
    // });
}
    
module.exports = { connectDB , check_login , register_user}
