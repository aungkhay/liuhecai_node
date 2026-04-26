const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { User } = require('../../models');
const { encrypt } = require('../../helpers/AESHelper');

const PASS_KEY = process.env.PASS_KEY;
const PASS_IV = process.env.PASS_IV;
const TOKEN_KEY = process.env.TOKEN_KEY;
const TOKEN_IV = process.env.TOKEN_IV;
const PASS_PREFIX = process.env.PASS_PREFIX;
const PASS_SUFFIX = process.env.PASS_SUFFIX;

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    GET_RECAPTCHA = async (req, res) => {
        try {
            const key = uuidv4();
            const recaptcha = await this.redisHelper.generateRecaptcha(key);
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', { uuid: key, code: recaptcha });
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    LOGIN = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, 'Validate Failed', {}, errors);
            }

            const { phone, password, uuid, verification_code } = req.body;

            // Check recaptcha
            const recapt = await this.redisHelper.getValue(uuid);
            if (!recapt || (recapt && recapt != verification_code.toLocaleLowerCase())) {
                await this.redisHelper.deleteKey(uuid);
                const recaptchaError = { field: 'verification_code', msg: '验证码不正确' };
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, 'Validate Failed', {}, [recaptchaError]);
            }

            const user = await User.findOne({ where: { phone_number: phone }, attributes: ['id', 'password', 'status', 'relation'] });
            if (!user) {
                await this.redisHelper.deleteKey(uuid);
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '未找到账号', {});
            }
            if (user.id != 1 && user.status == 0) {
                await this.redisHelper.deleteKey(uuid);
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '账号已被冻结', {});
            }

            const encPassword = encrypt(PASS_PREFIX + password + PASS_SUFFIX, PASS_KEY, PASS_IV);
            if (encPassword !== user.password) {
                await this.redisHelper.deleteKey(uuid);
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '密码错误', {});
            }

            // Create Token
            const tokenPrefix = this.commonHelper.randomString(25);
            const tokenSuffix = this.commonHelper.randomString(25);
            const toEncrypt = JSON.stringify({
                id: user.id,
                phone: phone,
                relation: user.relation
            });
            const token = encrypt(tokenPrefix + toEncrypt + tokenSuffix, TOKEN_KEY, TOKEN_IV);
            await this.redisHelper.setValue(`admin_token_${user.id}`, token, 24 * 60 * 60);
            await this.redisHelper.deleteKey(uuid);

            // Log
            await this.adminLogger(req, 'User', 'login');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '登录成功', { token: token });
        } catch (error) {
            console.log(error)
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, 'Server Error!', {});
        }
    }

    PROFILE = async (req, res) => {
        try {
            const userId = req.user_id;
            const user = await User.findByPk(userId, { attributes: ['id', 'name', 'phone_number'] });

            const permissions = await this.commonHelper.getAllPermissions(userId);
            user.dataValues.permissions = permissions;

            return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', user);
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, 'Server Erorr!', {});
        }
    }

    LOGOUT = async (req, res) => {
        try {
            const userId = req.user_id;

            this.redisHelper.deleteKey(`admin_token_${userId}`);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '退出成功', {});
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, 'Server Erorr!', {});
        }
    }
}

module.exports = Controller;