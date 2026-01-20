const MyResponse = require('../../helpers/MyResponse')
const CommonHelper = require('../../helpers/CommonHelper');
const ZodiacHelper = require('../../helpers/ZodiacHelper');
const RedisHelper = require('../../helpers/RedisHelper');

class Controller {
    constructor (app) {
        this.zodiacHelper = new ZodiacHelper();
        this.commonHelper = new CommonHelper();
        this.redisHelper = new RedisHelper(app);
        this.ResCode = this.commonHelper.ResCode;
    }

    GET_ZODIAC_NUMBERS = async (req, res) => {
        try {
            const numbers = this.zodiacHelper.zodiacNumbers();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, 'Success', numbers)
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, this.ResCode.SERVER_ERROR.msg, {});
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
            console.log(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;