const ZodiacHelper = require('../../helpers/ZodiacHelper');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
const MyResponse = require('../../helpers/MyResponse');
const { Banner, AomenRecord, HongKongRecord, PlatformRecord, Config, ResultGuess } = require('../../models');
const { Op } = require('sequelize');

class Controller {
    constructor (app) {
        this.zodiacHelper = new ZodiacHelper();
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
    }

    GET_YEAR = async (req, res) => {
        try {
            const year = await this.redisHelper.getValue('current_year');
            if (year) {
                return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', { year: year });
            }

            const conf = await Config.findOne({ where: { type: 'current_year' }, attributes: ['val'] });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', { year: conf.val });
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_BANNER = async (req, res) => {
        try {
            const banners = await Banner.findAll({
                order: [['id', 'DESC']],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', banners);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_ZODIAC_NUMBERS = async (req, res) => {
        try {
            const numbers = this.zodiacHelper.zodiacNumbers();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', numbers)
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_ZODIAC_LIST = async (req, res) => {
        try {
            const zodiacList = [];
            const current_zodiac = await this.redisHelper.getValue('current_zodiac');
            const split = current_zodiac.split('-');
            const current_zodiac_key = split[0];
            const current_zodiac_year = split[1];

            const zodiacs = this.zodiacHelper.zodiac();
            const comparisons = this.zodiacHelper.comparisons();

            const currentZodiac = zodiacs.find(z => z.key == current_zodiac_key);
            const arr = this.zodiacHelper.zodiacOrder(currentZodiac.id);
            for (let i = 0; i < arr.length; i++) {
                const zodiacId = arr[i];
                const zodiac = zodiacs.find(z => z.id == zodiacId);
                const comparison = comparisons.find(c => c.id == i + 1);
                zodiac.numbers = comparison.numbers;
                zodiacList.push(zodiac);
            }

            const data = {
                current_year: current_zodiac_year,
                current_zodiac: current_zodiac_key,
                zodiacs: zodiacList
            }
            return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', data)
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    LAST_RECORD = async (req, res) => {
        try {
            const lottery_type = req.query.lottery_type || 'aomen'; // 'aomen' or 'hongkong' or 'platform'
            let Model;
            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else if (lottery_type === 'platform') {
                Model = PlatformRecord;
            }
            const record = await Model.findOne({
                order: [['id', 'DESC']],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', record ? record : {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    RECORD_HISTORY = async (req, res) => {
        try {
            const page = parseInt(req.query.page || 1);
            const perPage = parseInt(req.query.perPage || 10);
            const offset = this.commonHelper.getOffset(page, perPage);

            const now = new Date();
            const current_year = now.getFullYear();
            const year = req.query.year || current_year; // 2026

            const lottery_type = req.query.lottery_type || 'aomen'; // 'aomen' or 'hongkong' or 'platform'
            let Model;
            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else if (lottery_type === 'platform') {
                Model = PlatformRecord;
            }

            const { count, rows } = await Model.findAndCountAll({
                where: {
                    draw_date: {
                        [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                    }
                },
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

    RESULT_GUESS = async (req, res) => {
        try {
            const results = await ResultGuess.findAll({
                order: [['id', 'DESC']],
                limit: 6
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', results);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_XIAO_MA = async (req, res) => {
        try {
            const configs = await Config.findAll({
                where: { type: ['qi_xiao', 'wu_xiao', 'san_xiao'] },
                order: [['id', 'DESC']],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', configs);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;