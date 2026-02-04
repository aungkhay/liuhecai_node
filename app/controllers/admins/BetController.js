const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const { BetCategory, BetSubCategory, BetItem, Bet } = require('../../models');
let { validationResult } = require('express-validator');

class Controller {
    constructor() {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
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
}

module.exports = Controller;