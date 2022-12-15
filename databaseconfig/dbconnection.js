require('dotenv').config({path:'.env'})

const MySQL = require('mysql');

var Conn;
export const connectDB = () => {
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

const find = (email,pass) => {
    //pass = hash256(pass)
    Conn.query(`SELECT * FROM USERS WHERE Email=${email} AND Password_SHA256=${pass}`, function (err,result) {
        if (err) throw err;
        console.log(result);
    });
}
find("Admin.423@email.com","pass")
connectDB();

Conn.query("Select * from Users", function(err, result) {
    if (err) throw err;
    console.log(result);
});

//export default connectDB;
