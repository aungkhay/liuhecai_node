const MyResponse = require('../../helpers/MyResponse');
const { AomenRecord, HongKongRecord, PlatformRecord, db, ResultGuess, TouZiPingTe, DoubleColor, Bet, BetNumber, User } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
const ZodiacHelper = require('../../helpers/ZodiacHelper');
const BetRuleHelper = require('../../helpers/BetRuleHelper');
const RedisHelper = require('../../helpers/RedisHelper');
let { validationResult } = require('express-validator');
const { Op, literal, Sequelize  } = require('sequelize');

class Controller {
    constructor (app) {
        this.redisHelper = new RedisHelper(app);
        this.commonHelper = new CommonHelper();
        this.zodiacHelper = new ZodiacHelper();
        this.betRuleHelper = new BetRuleHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
    }

    PLATFORM_LAST_BATCH_NUMBER = async (req, res) => {
        try {
            const record = await PlatformRecord.findOne({
                order: [['draw_date', 'DESC']],
            });
            
            // batch number format: 26001
            // 26 -> year, 001 -> batch number
            const now = new Date();
            const year = now.getFullYear();
            let current_year = year;
            let last_batch_number = `${current_year % 100}000`;
            if (record) {
                // Check if the last record's batch number is from the current year
                const recordYear = Math.floor(Number(record.batch_number) / 1000);
                if (recordYear === current_year % 100) {
                    last_batch_number = Number(record.batch_number);
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
            const lottery_type = req.query.lottery_type || 'aomen'; // 'aomen' or 'hongkong' or 'platform'
            let Model = null;

            let include = [];
            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else {
                Model = PlatformRecord;
                include = [{
                    model: User,
                    as: 'admin',
                    attributes: ['id', 'name']
                }];
            }

            const { count, rows } = await Model.findAndCountAll({
                include: include,
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
            const lastRecord = await Model.findOne({
                order: [['draw_date', 'DESC']],
            });
            if (lastRecord && lastRecord.calculate_status === 0) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '上一条记录未计算，请先计算后再创建新记录', {});
            }
            if (lastRecord && lastRecord.calculate_status === 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '上一条记录正在计算中，请稍后再试', {});
            }

            if (lottery_type === 'platform') {
                // Result Guess Logic
                const resultGuess = await ResultGuess.findOne({ where: { batch_number: batch_number }, attributes: ['id', 'zodiac_attr'] });
                
                let result_match = 2;
                const zodiacName = req.body.num7_desc.split('/'); // 鼠/金/blue
                if (resultGuess) {
                    const attributes = this.zodiacHelper.zodiacAttributes();
                    const zodiacs = attributes[resultGuess.zodiac_attr];
                    if (zodiacs.includes(zodiacName[0])) {
                        result_match = 1;
                    }
                }

                // TouZiPingTe Logic
                const touziPingTeRecord = await TouZiPingTe.findOne({
                    attributes: ['id', 'batch_start', 'batch_end', 'zodiac_name', 'open_count'],
                    order: [['id', 'DESC']],
                });
                let nameArr = [];
                if (touziPingTeRecord && (touziPingTeRecord.batch_start >= batch_number || touziPingTeRecord.batch_end <= batch_number)) {
                    for (let i = 1; i <= 7; i++) {
                        const zName = req.body[`num${i}_desc`].split('/');
                        nameArr.push(zName[0]);
                    }
                }

                // Double Color
                const doubleColor = await DoubleColor.findOne({ where: { year: req.body.year, batch_number: req.body.batch_number } });

                const t = await db.transaction();
                try {
                    console.log(req.body)
                    const obj = {
                        admin_id: req.user_id,
                        ... req.body
                    }
                    await Model.create(obj, { transaction: t });
                    if (resultGuess) {
                        await resultGuess.update({ result_match: result_match, result_number: req.body.num7, zodiac_name: zodiacName[0] }, { transaction: t });
                    }
                    if (touziPingTeRecord) {
                         if (nameArr.includes(touziPingTeRecord.zodiac_name)) {
                            await touziPingTeRecord.update({ open_count: touziPingTeRecord.open_count + 1 }, { transaction: t });
                        }
                        if (batch_number == touziPingTeRecord.batch_end) {
                            await touziPingTeRecord.update({ is_finished: 1 }, { transaction: t });
                        }
                    }
                    
                    if (doubleColor) {
                        await doubleColor.update({ result_number: req.body.num7, zodiac_name: zodiacName[0], match_color: zodiacName[2]  }, { transaction: t });
                    }
                    await t.commit();
                } catch (error) {
                    console.log(error)
                    await t.rollback();
                }
            } else {
                await Model.create(req.body);
            }

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
            if (record.calculate_status === 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '记录正在计算中，无法删除', {});
            }
            if (record.calculate_status === 2) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '记录已计算完成，无法删除', {});
            }
            const doubleColorRecord = await DoubleColor.findOne({ where: { batch_number: record.batch_number } });
            const resultGuessRecord = await ResultGuess.findOne({ where: { batch_number: record.batch_number } });

            const t = await db.transaction();
            try {
                await record.destroy({ transaction: t });
                if (doubleColorRecord) {
                    await doubleColorRecord.destroy({ transaction: t });
                }
                if (resultGuessRecord) {
                    await resultGuessRecord.destroy({ transaction: t });
                }
                await t.commit();
            } catch (error) {
                await t.rollback();
                return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
            }
            
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '记录删除成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CHECK_NUMBER_IN_BETS = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            const { num1, num2, num3, num4, num5, num6, num7, batch_number } = req.body;
            const allNums = [num1, num2, num3, num4, num5, num6, num7];

            const totalBetAmount = await Bet.sum('bet_amount', {
                where: {
                    batch_number: batch_number,
                    is_calculated: 0
                }
            }) || 0; 

            const bets = await Bet.findAll({
                where: { is_calculated: false, batch_number: batch_number },
                attributes: ['category_id'],
                group: ['category_id']
            });

            let totalWinAmount = 0;
            for (const bet of bets) {
                totalWinAmount += (this.betRuleHelper[`CATEGORY_WIN_${bet.category_id}`] && await this.betRuleHelper[`CATEGORY_WIN_${bet.category_id}`](allNums)) || 0;
            }

            const data = {
                total_bet_amount: totalBetAmount,
                total_win_amount: totalWinAmount,
                profit_loss: totalBetAmount - totalWinAmount
            }

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '检查完成', data);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CALCULATE_BET_RESULTS = async (req, res) => {
        try {
            const { id } = req.params;
            const record = await PlatformRecord.findByPk(id);
            if (!record) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '记录未找到', {});
            }

            if (record.calculate_status === 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '记录正在计算中，请稍后再试', {});
            }

            if (record.calculate_status === 2) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '记录已计算完成', {});
            }

            await record.update({ calculate_status: 1 });
            await this.redisHelper.setValue(`CALCULATE_BET_RESULTS`, JSON.stringify({ id: record.id, status: 0 }));

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '计算已开始，请稍后查看结果', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;