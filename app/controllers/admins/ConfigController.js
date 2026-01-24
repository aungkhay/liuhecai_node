const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
const { Config } = require('../../models');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
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
}
module.exports = Controller;