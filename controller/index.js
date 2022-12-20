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
    const d1 = Math.random();
    const d2 = Math.random();
    const d3 = Math.random();
    const d4 = Math.random();

    
}

module.exports = {verify_password}