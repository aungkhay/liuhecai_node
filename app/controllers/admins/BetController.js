const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const { BetCategory, BetSubCategory, BetItem, Bet } = require('../../models');
let { validationResult } = require('express-validator');
const { Op, fn, col } = require('sequelize');

class Controller {
    constructor() {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.getOffset = this.commonHelper.getOffset;
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
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            await Bet.bulkCreate(req.body.bets);
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

            const { count, rows } = await Bet.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: BetCategory,
                        as: 'category',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: BetSubCategory,
                        as: 'subCategory',
                        attributes: ['id', 'name'],
                    }
                ],
                attributes: ['id', 'item_code', 'item_name', 'odds', 'bet_amount', 'remark', 'createdAt'],
                offset: offset,
                limit: perPage,
                order: [['id', 'DESC']],
            });
            const data = {
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
}

module.exports = Controller;