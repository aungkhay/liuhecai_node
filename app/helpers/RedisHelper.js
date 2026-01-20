const prefix = process.env.REDIS_PREFIX;

class Helper {
    constructor (app) {
        this.redis = app.get('redis');
    }

    setLock = async (key, value, expireInSec = 2) => {
        try {
            var newKey = key;
            if (prefix) {
                newKey = `${prefix}_${key}`;
            }
            console.log(`\x1b[33m[REDIS]:\x1b[0m [SET LOCK] ${newKey}`);
            return await this.redis.set(newKey, value, 'NX', 'EX', expireInSec);
        } catch (error) {
            console.error('RedisHelper setLock error:', error);
        }
    }

    setValue = async (key, value, expireInSec = 0) => {
        try {
            var newKey = key;
            if (prefix) {
                newKey = `${prefix}_${key}`;
            }
            console.log(`\x1b[33m[REDIS]:\x1b[0m [SET] ${newKey}`);
            if (expireInSec > 0) {
                return await this.redis.set(newKey, value, 'EX', expireInSec);
            } else {
                return await this.redis.set(newKey, value);
            }
        } catch (error) {
            console.error('RedisHelper setValue error:', error);
        }
    }

    getValue = async (key) => {
        try {
            var newKey = key;
            if (prefix) {
                newKey = `${prefix}_${key}`;
            }
            console.log(`\x1b[33m[REDIS]:\x1b[0m [GET] ${newKey}`);
            return await this.redis.get(newKey);
        } catch (error) {
            console.error('RedisHelper getValue error:', error);
        }
    }

    deleteKey = async (key) => {
        try {
            var newKey = key;
            if (prefix) {
                newKey = `${prefix}_${key}`;
            }
            console.log(`\x1b[33m[REDIS]:\x1b[0m [DELETE] ${newKey}`);
            return await this.redis.del(newKey);
        } catch (error) {
            console.error('RedisHelper deleteKey error:', error);
        }
    }

    checkKeyExist = async (key) => {
        try {
            var newKey = key;
            if (prefix) {
                newKey = `${prefix}_${key}`;
            }
            const exist = await this.redis.exists(newKey);
            return exist === 1;
        } catch (error) {
            console.error('RedisHelper checkKeyExist error:', error);
            return false;
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

    randomNumber = (length) => {
        var result = '';
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    generateRecaptcha = async (key) => {
        try {
            var check = false;
            var recaptcha = '';

            while (check == false) {
                recaptcha = this.randomNumber(5);
                const exist = await this.getValue(key);

                if (!exist) {
                    check = true;
                    await this.setValue(key, recaptcha.toLocaleLowerCase(), 5 * 60);
                } else {
                    check = false;
                }
            }
            return recaptcha;
        } catch (error) {
            return '';
        }
    }
}

module.exports = Helper;