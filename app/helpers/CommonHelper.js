const { decrypt } = require('../helpers/AESHelper');
const TOKEN_KEY = process.env.TOKEN_KEY;
const TOKEN_IV = process.env.TOKEN_IV;

class Helper {
    constructor() {
        this.ResCode = require('../configs/ResCode');
    }

    getOffset = (page = 1, perPage = 10) => {
        return (page - 1) * perPage;
    }

    formatToken = (token) => {
        var tokenString = '';
        var splitted = token.split(' ');
        if (splitted.length == 2) {
            tokenString = splitted[1];
        } else {
            tokenString = splitted[0];
        }

        return tokenString;
    }

    extractToken = (token) => {
        try {
            const decryptedString = decrypt(token, TOKEN_KEY, TOKEN_IV);
            const jsonString = decryptedString.slice(25, -25);
            const user = JSON.parse(jsonString);

            return user;

        } catch (error) {
            return null;
        }
    }

    validateForm = (err) => {
        try {
            let errors = [];

            for (let index = 0; index < err.errors.length; index++) {
                const error = err.errors[index];

                let message = error.msg.msg;
                if (!message) {
                    message = error.msg;
                }
                for (const key in error.msg) {
                    if (Object.hasOwnProperty.call(error.msg, key)) {
                        const msg = error.msg[key];
                        if (key === 'params') {
                            for (const paramKey in msg) {
                                if (Object.hasOwnProperty.call(msg, paramKey)) {
                                    const param = msg[paramKey];
                                    message = message.replace(`%${paramKey}`, param);
                                }
                            }
                        }
                    }
                }

                errors.push({
                    field: error.path,
                    msg: message
                })
            }

            return errors;
        } catch (error) {
            return err;
        }
    }

    randomString = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

module.exports = Helper;