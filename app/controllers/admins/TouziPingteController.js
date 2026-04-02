const MyResponse = require('../../helpers/MyResponse');
const { TouZiPingTe, PlatformRecord, Config } = require('../../models');
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

    LAST_BATCH_NUMBER = async (req, res) => {
        try {
            const range = await TouZiPingTe.findOne({
                order: [['id', 'DESC']],
            });
            const now = new Date();
            const year = now.getFullYear();
            let current_year = year;

            let last_batch_number = `${current_year % 100}000`;
            if (!range) {
                const record = await PlatformRecord.findOne({
                    order: [['id', 'DESC']],
                });
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
                // check if the last range's batch_end is from the current year
                const rangeYear = Math.floor(Number(range.batch_end) / 1000);
                if (rangeYear === current_year % 100) {
                    last_batch_number = Number(range.batch_end);
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

            const { count, rows } = await TouZiPingTe.findAndCountAll({
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
            const { year, batch_start, batch_end, zodiac_name } = req.body;

            const lastRecord = await TouZiPingTe.findOne({
                attributes: ['id', 'year', 'batch_start', 'batch_end', 'is_finished'],
                where: { 
                    year: year,
                },
                order: [['id', 'DESC']],
            });
            if (lastRecord && lastRecord.batch_end >= batch_start) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, `已存在重叠范围`, {});
            }
            const lastPlatformRecord = await PlatformRecord.findOne({
                attributes: ['batch_number'],
                order: [['id', 'DESC']],
            });
            if (lastPlatformRecord && lastRecord && lastPlatformRecord.batch_number != lastRecord.batch_end) {
                const end = String(lastRecord.batch_end).padStart(3, '0');
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, `${end}期未完成`, {});
            }
            if (lastRecord && lastRecord.is_finished === 0) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, `上一次范围未完成`, {});
            }

            const record = await TouZiPingTe.create({
                year,
                batch_start,
                batch_end,
                zodiac_name
            });

            // LOG
            await this.adminLogger(req, 'TouZiPingTe', 'create');

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
            const { year, batch_start, batch_end, zodiac_name } = req.body;
            const record = await TouZiPingTe.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            await record.update({
                zodiac_name
            });

            // LOG
            await this.adminLogger(req, 'TouZiPingTe', 'update');
            
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', { record: record });
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const { id } = req.params;
            const record = await TouZiPingTe.findByPk(id);
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
                if (platformRecord.batch_number >= record.batch_start) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已有投注记录在此范围内，不能删除', {});
                }
            }
            await record.destroy();
            // LOG
            await this.adminLogger(req, 'TouZiPingTe', 'delete');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;