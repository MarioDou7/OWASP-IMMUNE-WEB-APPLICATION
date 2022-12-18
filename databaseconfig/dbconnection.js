require('dotenv').config({path:'.env'})

const sync = require("sync-sql")

var config = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}

const check_login = (name,password) => {
    var ret_name;
    var page;
    var message;
    var result;
    
    try {
        result = sync.mysql(config,'SELECT * FROM u_data.users WHERE Username = ? AND Password_SHA256 = SHA2(?, 256)',
        [
            name,password
        ]);
        
        console.log(result.data.rows);
        if(result.data.rows.length > 0) {
            if (name == "Admin") ret_name = "admin";
            else ret_name = "user";
        } else {
            page = 'login'; 
            message = 'Wrong username or password';
        }
        return {ret_name , page , message};
    } catch (error) {
        return console.error(error);
    }

}

const register_user = (email , name , password) => {
    var result;
    try {
        result = sync.mysql(config, "SELECT * FROM Users WHERE Email = ?", [email]);

        if (result.data.rows.length > 0) {
            console.log("Email is already registered");
            return {
                page: 'Register',
                message: 'This Email is already in use'
            }
        } else {
            result = sync.mysql(config,"INSERT INTO Users (Username, Email, Password_SHA256) VALUES (?, ?, SHA2(?, 256))", [
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

}
    
module.exports = {check_login , register_user}
