const MyResponse = require('../../helpers/MyResponse');
const { ResultGuess, Config } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
let { validationResult } = require('express-validator');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
        this.redisHelper = new RedisHelper(app);
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);

            const { count, rows } = await ResultGuess.findAndCountAll({
                offset: offset,
                limit: perPage,
                order: [['id', 'DESC']],
            });
            const data = {
                results: rows,
                meta: {
                    page: page,
                    perPage: perPage,
                    totalPage: count > 0 ? Math.ceil(count / perPage) : count,
                    total: count
                }
            }
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CREATE = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            let year = await this.redisHelper.getValue('current_year');
            if (!year) {
                const conf = await Config.findOne({ where: { type: 'current_year' }, attributes: ['val'] });
                year = conf.val;
            }

            const resultGuessExists = await ResultGuess.findOne({ where: { result_match: 0 }, attributes: ['id'] });
            if (resultGuessExists) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已有未开奖的结果竞猜，无法创建新的竞猜', {});
            }

            const { batch_number, zodiac_attr } = req.body;
            await ResultGuess.create({
                year: year,
                batch_number: batch_number,
                zodiac_attr: zodiac_attr
            });

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '创建成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    UPDATE = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            const resultGuess = await ResultGuess.findByPk(req.params.id, { attributes: ['id', 'result_match'] });
            if (!resultGuess || resultGuess.result_match != 0) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '未找到信息', {});
            }

            await resultGuess.update(req.body);
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const resultGuess = await ResultGuess.findByPk(req.params.id, { attributes: ['id', 'result_match'] });
            if (!resultGuess || resultGuess.result_match != 0) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '未找到信息', {});
            }
            await resultGuess.destroy();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    
    }
}

module.exports = Controller;