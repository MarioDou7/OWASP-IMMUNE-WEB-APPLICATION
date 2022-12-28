require('dotenv').config({ path: '.env' })

const sync = require("sync-sql")

var config = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}

const check_login = (name, password) => {
    var result;

    try {
        result = sync.mysql(config, 'SELECT * FROM u_data.users WHERE Username = ? AND Password_SHA256 = SHA2(?, 256)', [
            name, password
        ]);

        // console.log(result.data.rows);   //print the results

        if (result.data.rows.length > 0) { // if a user is found 

            return result.data.rows[0]; //return user
        }
    } catch (error) {
        return console.error(error);
    }

}

const register_user = (email, name, password) => {
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
            result = sync.mysql(config, "INSERT INTO Users (Username, Email, Password_SHA256) VALUES (?, ?, SHA2(?, 256))", [
                name,
                email,
                password,
            ]);

            return {
                page: 'register',
                message: 'Registration Successful'
            }
        }
    } catch (error) {
        return console.error(err.message);
    }

}

const search_user = (username) => {
    var result;
    try {
        result = sync.mysql(config, 'SELECT * FROM u_data.users WHERE Username = ?', [username, ]);
        if (result.data.rows.length > 0) {
            return {
                page: 'admin',
                message: 'There is a user with that username: ' + username
            }
        } else {
            return {
                page: 'admin',
                message: 'No users found'
            }
        }
    } catch (error) {
        return console.error(error);
    }
}

const delete_user = (username) => {
    var result;
    try {
        result = sync.mysql(config, 'SELECT * FROM u_data.users WHERE Username = ?', [username, ]);
        if (result.data.rows.length > 0) {
            result = sync.mysql(config, 'DELETE FROM u_data.users WHERE Username = ?', [username, ]);
            return {
                page: 'admin',
                message: 'User: ' + username + 'has been deleted'
            }
        } else {
            return {
                page: 'admin',
                message: 'No users found'
            }
        }
    } catch (error) {
        return console.error(error);
    }
}

module.exports = { check_login, register_user, search_user, delete_user }