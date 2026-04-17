const MyResponse = require('../helpers/MyResponse');
const RedisHelper = require('../helpers/RedisHelper');
const CommonHelper = require('../helpers/CommonHelper');

class MiddleWare {

    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
    }

    isLoggedIn = (permission = null) => {
        return async (req, res, next) => {
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

                if (user.id != 1 && user.id != 2 && permission) {
                    const split = permission.split(',');
                    if (split.length > 1) {
                        let hasPermission = false;
                        let permissions = await this.redisHelper.getValue(`admin_permissions_${user.id}`);
                        if (!permissions) {
                            permissions = await this.commonHelper.getAllPermissions(user.id);
                            await this.redisHelper.setValue(`admin_permissions_${user.id}`, JSON.stringify(permissions), 30 * 60); // 30 minutes
                        } else {
                            permissions = JSON.parse(permissions);
                        }
                        for (let i = 0; i < split.length; i++) {
                            if (permissions.includes(split[i])) {
                                hasPermission = true;
                                break;
                            }
                        }
                        if (!hasPermission) {
                            return MyResponse(res, this.ResCode.NO_PERMISSION.code, false, this.ResCode.NO_PERMISSION.msg, {});
                        }
                    }
                }

                await this.redisHelper.setValue(`admin_token_${user.id}`, token, 24 * 60 * 60);
                req.user_id = user.id;

                return next();
            } catch (error) {
                return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, 'Server Error!', {});
            }
        }
    }
}

module.exports = MiddleWare