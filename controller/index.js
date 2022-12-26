const nodemailer = require('nodemailer');

const verify_password = (password) => {

    if (password.length < 8 || password.length > 32) {
        return {page: 'register',
    message: 'Your Password Show be Between 8 - 32 Characters'}
    } else if (!password.match(".*\\d.*")) {
        return {page: 'register', 
            message: 'Your Password Show Contain At least 1 Digit'
        }
    } else if (!password.match(".*[a-z].*")) {
        return {page: 'register', 
            message: 'Your Password Show Contain At least 1 Lowercase Character'
        }
    } else if (!password.match(".*[A-Z].*")) {
        return {page:'register', 
            message: 'Your Password Show Contain At least 1 Uppercase Character'
        }
    } else if (!password.match('[!@#$%^&*(),.?":{}|<>]')) {
        return {page:'register', 
            message: 'Your Password Show Contain At least 1 Special Character'
        }
    }
}

const Genrate_OTP = () =>{
    const d1 = Math.floor(Math.random() * (9 - 0) + 0).toString();
    const d2 = Math.floor(Math.random() * (9 - 0) + 0).toString();
    const d3 = Math.floor(Math.random() * (9 - 0) + 0).toString();
    const d4 = Math.floor(Math.random() * (9 - 0) + 0).toString();
    
    const OTP = d1 + d2 + d3  + d4

    return OTP;
}

const SendMail = (user_mail,Pin) => {
    let mailTransporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
           user: 'cyberproject809@gmail.com',
           pass: 'ydkcsevgxypmeymy'
       }
    });
    
    let mailDetails = {
       from: 'cyberproject809@gmail.com',
       to: user_mail,
       subject: 'Test mail',
       html: `<p>Please Enter this PIN: <b>${Pin}</b></p> `
    };

    console.log(mailDetails)
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
       if(err) {
           console.log(err);
       } else {
           console.log('Email sent successfully');
       }
    });
}

 
module.exports = {verify_password, Genrate_OTP, SendMail}