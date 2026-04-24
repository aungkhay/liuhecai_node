const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const { BetCategory, BetSubCategory, BetItem, Bet, PlatformRecord, User } = require('../../models');
let { validationResult } = require('express-validator');
const { Op, fn, col } = require('sequelize');

class Controller {
    constructor() {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    GET_CATEGORY_LIST = async (req, res) => {
        try {
            const categories = await BetCategory.findAll({
                include: {
                    model: BetSubCategory,
                    as: 'subCategories',
                    attributes: ['id', 'code', 'name', 'odds', 'limit_bet_count'],
                },
                attributes: ['id', 'name'],
            });

            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, categories);
        } catch (error) {
            console.error('Error in GET_CATEGORY_LIST:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_BET_ITEMS = async (req, res) => {
        try {
            const { sub_category_id } = req.params;
            const betItems = await BetItem.findAll({
                where: { sub_category_id },
                attributes: ['id', 'sub_group', 'code', 'name', 'odds', 'item_type'],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, betItems);
        } catch (error) {
            console.error('Error in GET_BET_ITEMS:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DO_BET = async (req, res) => {
        try {
            // 8点25分停止下注
            const today = new Date();
            const stopBettingTime = new Date();
            stopBettingTime.setHours(21, 12, 0, 0);
            if (today >= stopBettingTime) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '已过下注时间，无法下注', {});
            }

            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }
            
            const now = new Date();
            const year = now.getFullYear();
            let batch_number = `${year % 100}001`;
            const lastRecord = await PlatformRecord.findOne({
                attributes: ['batch_number', 'year'],
                order: [['id', 'DESC']],
            });
            if (lastRecord) {
                if (lastRecord.year === year) {
                    batch_number = `${year % 100}${String(Number(lastRecord.batch_number.slice(2)) + 1).padStart(3, '0')}`;
                } else {
                    batch_number = `${year % 100}001`;
                }
            }

            const bets = req.body.bets;

            const newBets = bets.map(bet => ({
                ...bet,
                batch_number: batch_number,
                user_id: req.user_id,
            }));

            await Bet.bulkCreate(newBets);

            // LOG
            await this.adminLogger(req, 'Bet', 'create');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, {});
        } catch (error) {
            console.error('Error in DO_BET:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    BET_HISTORY = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);
            const category_id = req.query.category_id || null;
            const sub_category_id = req.query.sub_category_id || null;
            const remark = req.query.remark || null;
            const fromDate = req.query.fromDate || null;
            const toDate = req.query.toDate || null;
            const batch_number = req.query.batch_number || null;
            const is_win = req.query.is_win || null; // 0: 未结算, 1: 输, 2: 赢, 3: 和
            const is_calculated = req.query.is_calculated || null; // 0: 未结算, 1: 已结算

            const whereConditions = {};
            if (category_id) {
                whereConditions.category_id = category_id;
            }
            if (sub_category_id) {
                whereConditions.sub_category_id = sub_category_id;
            }
            if (remark) {
                whereConditions.remark = { [Op.like]: `%${remark}%` };
            }
            if (fromDate && toDate) {
                whereConditions.createdAt = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
            }
            if (batch_number) {
                whereConditions.batch_number = batch_number;
            }
            if (is_win !== null) {
                whereConditions.is_win = is_win;
            }
            if (is_calculated !== null) {
                whereConditions.is_calculated = is_calculated;
            }

            const { count, rows } = await Bet.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'type'],
                    },
                    {
                        model: BetCategory,
                        as: 'category',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: BetSubCategory,
                        as: 'subCategory',
                        attributes: ['id', 'name'],
                    },
                ],
                attributes: ['id', 'batch_number', 'item_code', 'item_name', 'odds', 'bet_amount', 'is_win', 'win_amount', 'remark', 'is_calculated', 'createdAt'],
                offset: offset,
                limit: perPage,
                order: [['id', 'DESC']],
            });

            const totalBetAmount = await Bet.sum('bet_amount', { where: whereConditions }) || 0;
            const totalWinAmount = await Bet.sum('win_amount', { where: whereConditions }) || 0;

            const data = {
                total_bet_amount: totalBetAmount,
                total_win_amount: totalWinAmount,
                profit_amount: totalBetAmount - totalWinAmount,
                bets: rows,
                meta: {
                    page: page,
                    perPage: perPage,
                    totalPage: count > 0 ? Math.ceil(count / perPage) : count,
                    total: count
                }
            }
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error('Error in BET_HISTORY:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    BET_PROFIT = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);

            // 计算总盈利金额
            // Sum group by batch_number
            const { count, rows } = await Bet.findAndCountAll({
                attributes: [
                    'batch_number',
                    [fn('SUM', col('bet_amount')), 'total_bet_amount'],
                    [fn('SUM', col('win_amount')), 'total_win_amount'],
                ],
                group: ['batch_number'],
                order: [['batch_number', 'DESC']],
                offset: this.getOffset(page, perPage),
                limit: perPage,
            });

            const data = {
                profits: rows,
                meta: {
                    page: page,
                    perPage: perPage,
                    totalPage: count.length > 0 ? Math.ceil(count.length / perPage) : count,
                    total: count.length
                }
            }
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error('Error in BET_PROFIT:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    BET_SUMMARY = async (req, res) => {
        try {
            const result = await Bet.findAll({
                attributes: [
                    [fn('SUM', col('bet_amount')), 'total_bet_amount'],
                    [fn('COUNT', col('bet_amount')), 'total_bet_count'],
                ],
                include: [
                    {
                        model: BetCategory,
                        as: 'category',
                        attributes: ['id', 'name']
                    },
                    {
                        model: BetSubCategory,
                        as: 'subCategory',
                        attributes: ['id', 'name']
                    }
                ],
                group: [
                    'sub_category_id',
                    'category.id',
                    'subCategory.id'
                ]
            });

            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, result);
        } catch (error) {
            console.error('Error in BET_SUMMARY:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    BATCH_SUMMARY = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.getOffset(page, perPage);

            const bets = await Bet.findAll({
                attributes: [
                    'batch_number',
                    [fn('SUM', col('bet_amount')), 'total_bet_amount'],
                    [fn('SUM', col('win_amount')), 'total_win_amount'],
                ],
                group: ['batch_number'],
                order: [['batch_number', 'DESC']],
                offset: offset,
                limit: perPage,
            });

            const data = {
                records: bets,
                meta: {
                    page: page,
                    perPage: perPage,
                    totalPage: bets.length > 0 ? Math.ceil(bets.length / perPage) : bets.length,
                    total: bets.length
                }
            }

            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, data);

        } catch (error) {
            console.error('Error in BATCH_SUMMARY:', error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});  
        }
    }
}

module.exports = Controller;