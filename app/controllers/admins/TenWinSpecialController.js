const MyResponse = require('../../helpers/MyResponse');
const { PlatformRecord, TenWinSpecial } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
let { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);

            const { count, rows } = await TenWinSpecial.findAndCountAll({
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
            console.error(err);
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

            const { batch_number, numbers } = req.body;
            const existingRecord = await TenWinSpecial.findOne({ where: { batch_number } });
            if (existingRecord) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已存在相同期数的记录', {});
            }

            const lastRecord = await TenWinSpecial.findOne({
                attributes: ['result_number'],
                order: [['id', 'DESC']],
            });
            if (lastRecord && lastRecord.result_number == 0) { 
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '上一期记录未完成，无法创建新记录', {});
            }

            await TenWinSpecial.create({ 
                batch_number: batch_number,
                numbers: numbers.join('-'),
            });

            // LOG
            await this.adminLogger(req, 'TenWinSpecial', 'create');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '创建成功', {});

        } catch (err) {
            console.error(err);
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
            const { batch_number, numbers } = req.body;
            const record = await TenWinSpecial.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            await record.update({ 
                batch_number: batch_number,
                numbers: numbers.join('-')
            });

            // LOG
            await this.adminLogger(req, 'TenWinSpecial', `update`);
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', record);
        } catch (err) {
            console.error(err);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const { id } = req.params;
            const record = await TenWinSpecial.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            if (record.result_number !== 0) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '记录已完成，无法删除', {});
            }
            await record.destroy();

            // LOG
            await this.adminLogger(req, 'TenWinSpecial', `delete`);
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (err) {
            console.error(err);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;