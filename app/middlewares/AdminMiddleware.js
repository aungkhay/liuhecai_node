const MyResponse = require('../helpers/MyResponse');
const RedisHelper = require('../helpers/RedisHelper');
const CommonHelper = require('../helpers/CommonHelper');

class MiddleWare {

    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
    }

    isLoggedIn = async (req, res, next) => {
        try {
            if(!req.header("authorization")) {
                return MyResponse(res, this.ResCode.UNAUTHORIZED.code, false, 'UNAUTHORIZED', {});
            }

            const token = this.commonHelper.formatToken(req.header("authorization"));
            const user = this.commonHelper.extractToken(token);
            console.log(user);
            if(!user) {
                return MyResponse(res, this.ResCode.UNAUTHORIZED.code, false, 'UNAUTHORIZED', {});
            }

            const redisToken = await this.redisHelper.getValue(`admin_token_${user.id}`);
            if(!redisToken || (redisToken && redisToken != token)) {
                return MyResponse(res, this.ResCode.UNAUTHORIZED.code, false, 'UNAUTHORIZED', {});
            }

            await this.redisHelper.setValue(`admin_token_${user.id}`, token, 24 * 60 * 60);
            req.user_id = user.id;

            return next();
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, 'Server Error!', {});
        }
    }
}

module.exports = MiddleWare