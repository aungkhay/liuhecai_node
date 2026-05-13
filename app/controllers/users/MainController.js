const ZodiacHelper = require('../../helpers/ZodiacHelper');
const CommonHelper = require('../../helpers/CommonHelper');
const RedisHelper = require('../../helpers/RedisHelper');
const MyResponse = require('../../helpers/MyResponse');
const { Banner, AomenRecord, HongKongRecord, PlatformRecord, Config, ResultGuess, TouZiPingTe, DoubleColor, ReferenceLink, ReferenceImage, ZodiacFeed, MustWin3Batch, TenWinSpecial } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

class Controller {
    constructor (app) {
        this.zodiacHelper = new ZodiacHelper();
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
    }

    GET_SERVER_TIME = async (req, res) => {
        try {
            const now = new Date();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', { server_time: now.getTime() });
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
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
                order: [['draw_date', 'DESC']],
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', record ? record : {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    RECORD_HISTORY = async (req, res) => {
        try {
            let page = parseInt(req.query.page || 1);
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
                page = 1; // platform record does not support pagination
            }

            const { count, rows } = await Model.findAndCountAll({
                where: {
                    draw_date: {
                        [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                    }
                },
                offset: offset,
                limit: perPage,
                order: [['batch_number', 'DESC']],
            });

            let meta = {
                page: page,
                perPage: perPage,
                totalPage: count > 0 ? Math.ceil(count / perPage) : count,
                total: count
            }
            if (lottery_type === 'platform') {
                meta = {
                    page: 1,
                    perPage: 10,
                    totalPage: 1,
                    total: 10
                }
            }

            const data = {
                records: rows,
                meta: meta
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
                limit: 10
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

    GET_TOU_ZI_PING_TE = async (req, res) => {
        try {
            const records = await TouZiPingTe.findAll({
                order: [['id', 'DESC']],
                limit: 20
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', records);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_DOUBLE_COLOR = async (req, res) => {
        try {
            const records = await DoubleColor.findAll({
                order: [['id', 'DESC']],
                limit: 10
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', records);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    GET_REFERENCE_LINKS = async (req, res) => {
        try {
            const links = await ReferenceLink.findAll({
                where: { image: { [Op.ne]: null } },
                order: [['createdAt', 'DESC']]
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, links);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    NEXT_BATCH_NUMBER = async (req, res) => {
        try {
            const record = await PlatformRecord.findOne({
                order: [['draw_date', 'DESC']],
            });
            // batch number format: 26001
            // 26 -> year, 001 -> batch number
            const now = new Date();
            const year = now.getFullYear();
            let current_year = year;
            let next_batch_number = `${current_year % 100}000`;
            if (record) {
                // Check if the last record's batch number is from the current year
                const recordYear = Math.floor(Number(record.batch_number) / 1000);
                if (recordYear === current_year % 100) {
                    next_batch_number = Number(record.batch_number) + 1;
                } else {
                    next_batch_number = `${current_year % 100}000`;
                }
            }
            const data = {
                next_batch_number: Number(next_batch_number),
            }
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    REFERENCE_IMAGES = async (req, res) => {
        try {
            const images = await ReferenceImage.findAll({
                order: [['createdAt', 'DESC']],
                limit: 100
            });
            
            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, images);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    ZODIAC_FEED = async (req, res) => {
        try {
            const feeds = await ZodiacFeed.findAll({
                order: [['id', 'DESC']],
                limit: 20
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', feeds);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    MUST_WIN_3_BATCH = async (req, res) => {
        try {
            const batches = await MustWin3Batch.findAll({
                order: [['id', 'DESC']],
                limit: 5
            });
            const data = batches.reverse();

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    TEN_WIN_SPECIAL = async (req, res) => {
        try {
            const record = await TenWinSpecial.findAll({
                order: [['id', 'DESC']],
                limit: 10
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', record);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;