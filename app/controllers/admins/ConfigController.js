const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
const { Config } = require('../../models');
let { validationResult } = require('express-validator');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    GET_YEAR = async (req, res) => {
        try {
            const year = await this.redisHelper.getValue('current_year');
            if (year) {
                return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', { year: year });
            }

            const conf = await Config.findOne({ where: { type: 'current_year' }, attributes: ['val'] });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', { year: conf.val });
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    INDEX = async (req, res) => {
        try {
            const configs = await Config.findAll({
                order: [['id', 'DESC']],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', configs);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    XIAO_MA = async (req, res) => {
        try {
            const configs = await Config.findAll({
                where: { type: ['qi_xiao', 'wu_xiao', 'san_xiao'] },
                order: [['id', 'DESC']],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', configs);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    UPDATE_XIAO = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            const { type, xiaos, numbers } = req.body;

            await Config.update(
                { val: `${xiaos.join(',')}|${numbers.join(',')}` },
                { where: { type: type } }
            );

            // LOG
            await this.adminLogger(req, 'Config', `update`);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}
module.exports = Controller;