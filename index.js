require('dotenv').config({path:'.env'})


const d1 = Math.floor(Math.random() * (9 - 0) + 0).toString();
const d2 = Math.floor(Math.random() * (9 - 0) + 0).toString();
const d3 = Math.floor(Math.random() * (9 - 0) + 0).toString();
const d4 = Math.floor(Math.random() * (9 - 0) + 0).toString();

const OTP = d1 + d2 + d3  + d4

console.log(OTP)

console.log(d1,d2,d3,d4)

const sync = require("sync-sql")


var name = "mario"
var password = "Dou7101))"
var config = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}

try
{
    result = sync.mysql(config,'SELECT email FROM u_data.users WHERE Username = "mario" AND Password_SHA256 = SHA2("Dou7101))", 256)');
} catch (error) {
    console.log(error)
}

console.log(result.data.rows);

var email = result.data.rows[0].email;
console.log(email);