const MyResponse = require('../../helpers/MyResponse');
const { AomenRecord, HongKongRecord, PlatformRecord } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
let { validationResult } = require('express-validator');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);
            const lottery_type = req.query.lottery_type || 'aomen'; // 'aomen' or 'hongkong'

            const { count, rows } = await (lottery_type === 'hongkong' ? HongKongRecord : AomenRecord).findAndCountAll({
                offset: offset,
                limit: perPage,
                order: [['draw_date', 'DESC']],
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

            const { lottery_type, batch_number } = req.body;
            let Model = null;
            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else {
                Model = PlatformRecord;
            }

            // Check if record already exists
            const existingRecord = await Model.findOne({ where: { batch_number: batch_number } });
            if (existingRecord) {
                return MyResponse(res, this.ResCode.ALREADY_EXISTS.code, false, '该期数记录已存在', {});
            }

            await Model.create(req.body);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '记录创建成功', {});
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
            const { lottery_type } = req.body;
            let Model = null;
            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else {
                Model = PlatformRecord;
            }

            const record = await Model.findByPk(id);

            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            await record.update(req.body);
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '记录更新成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const { id } = req.params;
            const { lottery_type } = req.body;
            let Model = null;
            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else {
                Model = PlatformRecord;
            }
            const record = await Model.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }
            await record.destroy();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '记录删除成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;