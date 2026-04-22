const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
let { validationResult } = require('express-validator');
const { ZodiacFeed } = require('../../models');

class Controller {
    constructor(app) {
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);

            const { count, rows } = await ZodiacFeed.findAndCountAll({
                offset: offset,
                limit: perPage,
                order: [['id', 'DESC']],
            });

            const data = {
                records: rows,
                meta: {
                    page: page,
                    perPage: perPage,
                    totalPage: count > 0 ? Math.ceil(count / perPage) : count,
                    total: count
                }
            }

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (err) {
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

            const lastRecord = await ZodiacFeed.findOne({
                where: { 
                    batch_number: req.body.batch_number 
                },
            });
            if (lastRecord) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '该期号的生肖记录已存在，无法创建记录', {});
            }
            
            await ZodiacFeed.create({
                batch_number: req.body.batch_number,
                feed_one: req.body.feed_one,
                feed_two: req.body.feed_two,
            });

            // LOG
            await this.adminLogger(req, 'ZodiacFeed', `create`);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '创建成功', {});
        } catch (err) {
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

            const { id } = req.params;
            const record = await ZodiacFeed.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            if (record.result_number) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已开奖的记录无法修改', {});
            }

            await record.update(req.body);

            // LOG
            await this.adminLogger(req, 'ZodiacFeed', `update`);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', { record });
        } catch (err) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const { id } = req.params;
            const record = await ZodiacFeed.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            if (record.result_number) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已开奖的记录无法删除', {});
            }

            await record.destroy();

            // LOG
            await this.adminLogger(req, 'ZodiacFeed', `delete`);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (err) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller