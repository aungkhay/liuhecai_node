const MyResponse = require('../../helpers/MyResponse');
const { PlatformRecord } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
let { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const MustWin3Batch = require('../../models/MustWin3Batch');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    LAST_BATCH_NUMBER = async (req, res) => {
        try {
            const range = await MustWin3Batch.findOne({
                order: [['id', 'DESC']],
            });
            const now = new Date();
            const year = now.getFullYear();
            let current_year = year;

            const record = await PlatformRecord.findOne({
                order: [['id', 'DESC']],
            });

            let last_batch_number = `${current_year % 100}000`;
            if (!range) {
                if (record) {
                    // Check if the last record's batch number is from the current year
                    const recordYear = Math.floor(Number(record.batch_number) / 1000);
                    if (recordYear === current_year % 100) {
                        last_batch_number = Number(record.batch_number);
                    } else {
                        last_batch_number = `${current_year % 100}000`;
                    }
                }
            } else {
                // check if the last range's batch_three is from the current year
                const rangeYear = Math.floor(Number(range.batch_three) / 1000);
                if (rangeYear === current_year % 100) {
                    if (record) {
                        // Check if the last record's batch number is greater than the last range's batch_three
                        if (Number(record.batch_number) > Number(range.batch_three)) {
                            last_batch_number = Number(record.batch_number);
                        } else {                            
                            last_batch_number = Number(range.batch_three);
                        }
                    } else {
                        last_batch_number = Number(range.batch_three);
                    }
                } else {
                    last_batch_number = `${current_year % 100}000`;
                }
            }
            const data = {
                last_batch_number: Number(last_batch_number),
            }
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);

            const { count, rows } = await MustWin3Batch.findAndCountAll({
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
            const { batch_one, batch_two, batch_three, zodiac_one, zodiac_two, zodiac_three } = req.body;

            const lastRecord = await MustWin3Batch.findOne({
                attributes: ['id', 'batch_one', 'batch_two', 'batch_three', 'is_finished'],
                order: [['id', 'DESC']],
            });
            if (lastRecord && lastRecord.batch_three >= batch_one) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, `已存在重叠范围`, {});
            }
            if (lastRecord && lastRecord.is_finished === 0) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, `最后一期未完成`, {});
            }

            const record = await MustWin3Batch.create({
                batch_one,
                batch_two,
                batch_three,
                zodiac_one,
                zodiac_two,
                zodiac_three
            });

            // LOG
            await this.adminLogger(req, 'MustWin3Batch', 'create');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '创建成功', { record: record });
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
            const { id } = req.params;
            const { zodiac_one, zodiac_two, zodiac_three } = req.body;
            const record = await MustWin3Batch.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }

            await record.update({
                zodiac_one,
                zodiac_two,
                zodiac_three
            });

            // LOG
            await this.adminLogger(req, 'MustWin3Batch', 'update');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', { record: record });
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const { id } = req.params;
            const record = await MustWin3Batch.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            if (record.is_finished === 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已完成的记录不能删除', {});
            }

            const platformRecord = await PlatformRecord.findOne({
                attributes: ['id', 'batch_number'],
                order: [['id', 'DESC']],
            });
            if (platformRecord) {
                if (platformRecord.batch_number >= record.batch_one) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已有投注记录在此范围内，不能删除', {});
                }
            }
            await record.destroy();

            // LOG
            await this.adminLogger(req, 'MustWin3Batch', 'delete');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;