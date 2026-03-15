const MyResponse = require('../../helpers/MyResponse');
const { AomenRecord, HongKongRecord, PlatformRecord, db, ResultGuess, TouZiPingTe, DoubleColor, Bet, BetNumber } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
const ZodiacHelper = require('../../helpers/ZodiacHelper');
const BetRuleHelper = require('../../helpers/BetRuleHelper');
let { validationResult } = require('express-validator');
const { Op, literal, Sequelize  } = require('sequelize');

class Controller {
    constructor (app) {
        this.commonHelper = new CommonHelper();
        this.zodiacHelper = new ZodiacHelper();
        this.orderedZodiacs = this.zodiacHelper.orderedZodiac();
        this.betRuleHelper = new BetRuleHelper({
            orderedZodiacs: this.zodiacHelper.orderedZodiac()
        });
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
            let last_batch_number = `${current_year % 100}001`;
            if (record) {
                // Check if the last record's batch number is from the current year
                const recordYear = Math.floor(Number(record.batch_number) / 1000);
                if (recordYear === current_year % 100) {
                    last_batch_number = Number(record.batch_number);
                } else {
                    last_batch_number = `${current_year % 100}001`;
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
            let totalBetAmount = 0;

            if (lottery_type === 'hongkong') {
                Model = HongKongRecord;
            } else if (lottery_type === 'aomen') {
                Model = AomenRecord;
            } else {
                Model = PlatformRecord;
                totalBetAmount = await Bet.sum('bet_amount', {
                    where: {
                        is_calculated: 0
                    }
                });
            }

            const { count, rows } = await Model.findAndCountAll({
                offset: offset,
                limit: perPage,
                order: [['draw_date', 'DESC']],
            });

            const data = {
                total_bet_amount: totalBetAmount,
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
                if (!resultGuess) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '请先创建结果竞猜记录', {});
                }
                const attributes = this.zodiacHelper.zodiacAttributes();
                const zodiacs = attributes[resultGuess.zodiac_attr];
                let result_match = 2;
                const zodiacName = req.body.num7_desc.split('/'); // 鼠/金/blue
                if (zodiacs.includes(zodiacName[0])) {
                    result_match = 1;
                }

                // TouZiPingTe Logic
                const touziPingTeRecord = await TouZiPingTe.findOne({
                    attributes: ['id', 'batch_start', 'batch_end', 'zodiac_name', 'open_count'],
                    order: [['id', 'DESC']],
                });
                if (!touziPingTeRecord) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '请先创建投资平特记录', {});
                }
                if (parseInt(batch_number) > touziPingTeRecord.batch_end) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '当前期数超出投资平特范围', {});
                }
                if (parseInt(batch_number) < touziPingTeRecord.batch_start) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '当前期数低于投资平特范围', {});
                }
                let nameArr = [];
                for (let i = 1; i <= 7; i++) {
                    const zName = req.body[`num${i}_desc`].split('/');
                    nameArr.push(zName[0]);
                }

                // Double Color
                const doubleColor = await DoubleColor.findOne({ where: { year: req.body.year, batch_number: req.body.batch_number } });
                if (!doubleColor) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '请先创建大神双波记录', {});
                }

                const t = await db.transaction();
                try {
                    await Model.create(req.body, { transaction: t });
                    await resultGuess.update({ result_match: result_match, result_number: req.body.num7, zodiac_name: zodiacName[0] }, { transaction: t });
                    if (nameArr.includes(touziPingTeRecord.zodiac_name)) {
                        await touziPingTeRecord.update({ open_count: touziPingTeRecord.open_count + 1 }, { transaction: t });
                    }
                    if (batch_number == touziPingTeRecord.batch_end) {
                        await touziPingTeRecord.update({ is_finished: 1 }, { transaction: t });
                    }
                    await doubleColor.update({ result_number: req.body.num7, zodiac_name: zodiacName[0], match_color: zodiacName[2]  }, { transaction: t });
                    await t.commit();
                } catch (error) {
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
            const { num1, num2, num3, num4, num5, num6, num7 } = req.body;

            const allNums = [num1, num2, num3, num4, num5, num6, num7];
            const zmNums = [num1, num2, num3, num4, num5, num6];

            let itemCodes = [];
            // 特码-双面 TM_SM
            if (num7 != 49) {
                if (this.betRuleHelper.isBig(num7)) itemCodes.push('TM_SM_DA');
                if (this.betRuleHelper.isSmall(num7)) itemCodes.push('TM_SM_XIAO');
                if (this.betRuleHelper.isOdd(num7)) itemCodes.push('TM_SM_DAN');
                if (this.betRuleHelper.isEven(num7)) itemCodes.push('TM_SM_SHUANG');
                if (this.betRuleHelper.TM_SM_HEDA().includes(num7)) itemCodes.push('TM_SM_HEDA');
                if (this.betRuleHelper.TM_SM_HEXIAO().includes(num7)) itemCodes.push('TM_SM_HEXIAO');
                if (this.betRuleHelper.TM_SM_HEDAN().includes(num7)) itemCodes.push('TM_SM_HEDAN');
                if (this.betRuleHelper.TM_SM_HESHUANG().includes(num7)) itemCodes.push('TM_SM_HESHUANG');
                if (this.betRuleHelper.TM_SM_WEIDA().includes(num7)) itemCodes.push('TM_SM_WEIDA');
                if (this.betRuleHelper.TM_SM_WEIXIAO().includes(num7)) itemCodes.push('TM_SM_WEIXIAO');
                if (this.betRuleHelper.TM_SM_TIANXIAO().includes(num7)) itemCodes.push('TM_SM_TIANXIAO');
                if (this.betRuleHelper.TM_SM_DIXIAO().includes(num7)) itemCodes.push('TM_SM_DIXIAO');
                if (this.betRuleHelper.TM_SM_QIANXIAO().includes(num7)) itemCodes.push('TM_SM_QIANXIAO');
                if (this.betRuleHelper.TM_SM_HOUXIAO().includes(num7)) itemCodes.push('TM_SM_HOUXIAO');
                if (this.betRuleHelper.TM_SM_JIAXIAO().includes(num7)) itemCodes.push('TM_SM_JIAXIAO');
                if (this.betRuleHelper.TM_SM_YEXIAO().includes(num7)) itemCodes.push('TM_SM_YEXIAO');
            }
            if (this.betRuleHelper.TM_SM_DADAN().includes(num7)) itemCodes.push('TM_SM_DADAN');
            if (this.betRuleHelper.TM_SM_DASHUANG().includes(num7)) itemCodes.push('TM_SM_DASHUANG');
            if (this.betRuleHelper.TM_SM_XIAODAN().includes(num7)) itemCodes.push('TM_SM_XIAODAN');
            if (this.betRuleHelper.TM_SM_XIAOSHUANG().includes(num7)) itemCodes.push('TM_SM_XIAOSHUANG');
            
            // 特码-号码 TM_HM
            const numbers = this.betRuleHelper.numbers;
            if (numbers.includes(num7)) {
                itemCodes.push(`TM_HM_${num7.toString().padStart(2, '0')}`);
            }
            // 特码-色波半波 TM_SBB
            if (this.betRuleHelper.RED.includes(num7)) itemCodes.push('TM_SBB_HONG');
            if (this.betRuleHelper.BLUE.includes(num7)) itemCodes.push('TM_SBB_LAN');
            if (this.betRuleHelper.GREEN.includes(num7)) itemCodes.push('TM_SBB_LV');
            if (num7 != 49) {
                const colorMap = {
                    HONG: this.betRuleHelper.RED,
                    LAN: this.betRuleHelper.BLUE,
                    LV: this.betRuleHelper.GREEN
                }
                for (const colorName in colorMap) {
                    if (!Object.hasOwn(colorMap, colorName)) continue;
                    const colorNumbers = colorMap[colorName];
                    if (colorNumbers.includes(num7)) {
                        if (colorNumbers.filter(n => this.betRuleHelper.isOdd(n))) itemCodes.push(`TM_SBB_${colorName}_DAN`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isEven(n))) itemCodes.push(`TM_SBB_${colorName}_SHUANG`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isBig(n))) itemCodes.push(`TM_SBB_${colorName}_DA`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isSmall(n))) itemCodes.push(`TM_SBB_${colorName}_XIAO`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isBig(n) && this.betRuleHelper.isOdd(n))) itemCodes.push(`TM_SBB_${colorName}_DA_DAN`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isBig(n) && this.betRuleHelper.isEven(n))) itemCodes.push(`TM_SBB_${colorName}_DA_SHUANG`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isSmall(n) && this.betRuleHelper.isOdd(n))) itemCodes.push(`TM_SBB_${colorName}_XIAO_DAN`);
                        if (colorNumbers.filter(n => this.betRuleHelper.isSmall(n) && this.betRuleHelper.isEven(n))) itemCodes.push(`TM_SBB_${colorName}_XIAO_SHUANG`);
                    }
                }
            }
            // 特码-特肖头尾数 TM_TXTWS
            const TM_TXTWS = this.betRuleHelper.addRulePrefix('TM_TXTWS');
            for (const key in TM_TXTWS) {
                if (!Object.hasOwn(TM_TXTWS, key)) continue;
                const nums = TM_TXTWS[key];
                if (nums.includes(num7)) itemCodes.push(key);
            }
            // 头 (tens digit)
            for (let i = 0; i <= 4; i++) {
                const code = `TM_TXTWS_${i}TOU`;
                const nums = numbers.filter(n => Math.floor(n / 10) === i);
                if (nums.includes(num7)) itemCodes.push(code);
            }
            // 尾 (last digit)
            for (let i = 0; i <= 9; i++) {
                const code = `TM_TXTWS_${i}WEI`;
                const nums = numbers.filter(n => n % 10 === i);
                if (nums.includes(num7)) itemCodes.push(code);
            }

            // 特码-合肖 TM_HX
            if (num7 != 49) {
                const TM_HX = this.betRuleHelper.addRulePrefix('TM_HX');
                const TM_HX_Group = await Bet.findAll({
                    where: {
                        is_group_bet: 1,
                        group_name: 'TM_HX',
                    },
                    attributes: ['item_code'],
                });
                if (TM_HX_Group.length) {
                    for (const group of TM_HX_Group) {
                        const item_code = group.item_code.split(','); // e.g. TM_HX_SHU,TM_HX_HOU
                        const mergedNums = [];
                        for (const code of item_code) {
                            if (!Object.hasOwn(TM_HX, code)) continue;
                            const nums = TM_HX[code];
                            mergedNums.push(...nums);
                        }
                        if (mergedNums.includes(num7)) {
                            itemCodes.push(group.item_code);
                        }
                    }
                }
            }

            // 特码-五行 TM_WX
            if (num7 != 49) {
                if (this.betRuleHelper.TM_WX_JIN.includes(num7)) itemCodes.push('TM_WX_JIN');
                if (this.betRuleHelper.TM_WX_MU.includes(num7)) itemCodes.push('TM_WX_MU');
                if (this.betRuleHelper.TM_WX_SHUI.includes(num7)) itemCodes.push('TM_WX_SHUI');
                if (this.betRuleHelper.TM_WX_HUO.includes(num7)) itemCodes.push('TM_WX_HUO');
                if (this.betRuleHelper.TM_WX_TU.includes(num7)) itemCodes.push('TM_WX_TU');
            }

            // 正码-任选一 ZM_RX1
            for (let i = 1; i <= 6; i++) {
                const code = `ZM_RX1_${zmNums[i-1]}`;
                if (this.betRuleHelper.numbers.includes(zmNums[i - 1])) {
                    itemCodes.push(code);
                }
            }

            // 正码1-6 ZM_ZM16
            const DAN = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isOdd(n));
            const SHUANG = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isEven(n));
            const DA = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isBig(n));
            const XIAO = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isSmall(n));
            const HEDAN = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.sumDigits(n) % 2 === 1);
            const HESHUANG = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.sumDigits(n) % 2 === 0);
            const HEDA = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.sumDigits(n) >= 7);
            const HEXIAO = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isSmall(n));
            const WEIDA = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isBig(n));
            const WEIXIAO = this.betRuleHelper.numbers.filter(n => this.betRuleHelper.isSmall(n));

            for (let i = 1; i <= 6; i++) {
                const num = zmNums[i - 1];
                if (num === 49) continue;
                if (DAN.includes(num)) itemCodes.push(`ZM_ZM16_${i}_DAN`);
                if (SHUANG.includes(num)) itemCodes.push(`ZM_ZM16_${i}_SHUANG`);
                if (DA.includes(num)) itemCodes.push(`ZM_ZM16_${i}_DA`);
                if (XIAO.includes(num)) itemCodes.push(`ZM_ZM16_${i}_XIAO`);
                if (HEDAN.includes(num)) itemCodes.push(`ZM_ZM16_${i}_HEDAN`);
                if (HESHUANG.includes(num)) itemCodes.push(`ZM_ZM16_${i}_HESHUANG`);
                if (HEDA.includes(num)) itemCodes.push(`ZM_ZM16_${i}_HEDA`);
                if (HEXIAO.includes(num)) itemCodes.push(`ZM_ZM16_${i}_HEXIAO`);
                if (WEIDA.includes(num)) itemCodes.push(`ZM_ZM16_${i}_WEIDA`);
                if (WEIXIAO.includes(num)) itemCodes.push(`ZM_ZM16_${i}_WEIXIAO`);
                if (this.betRuleHelper.RED.includes(num)) itemCodes.push(`ZM_ZM16_${i}_HONG`);
                if (this.betRuleHelper.BLUE.includes(num)) itemCodes.push(`ZM_ZM16_${i}_LAN`);
                if (this.betRuleHelper.GREEN.includes(num)) itemCodes.push(`ZM_ZM16_${i}_LV`);
            }

            // 正肖七色波 ZM_ZXQSB
            const uniqueNums = [...new Set(zmNums)];
            const ZM_ZXQSB = this.betRuleHelper.addRulePrefix('ZM_ZXQSB');
            for (let i = 0; i < uniqueNums.length; i++) {
                const num = uniqueNums[i];
                if (num === 49) continue;
                if (this.betRuleHelper.RED.includes(num)) itemCodes.push(`ZM_ZXQSB_HONG`);
                if (this.betRuleHelper.BLUE.includes(num)) itemCodes.push(`ZM_ZXQSB_LAN`);
                if (this.betRuleHelper.GREEN.includes(num)) itemCodes.push(`ZM_ZXQSB_LV`);

                for (const key in ZM_ZXQSB) {
                    if (!Object.hasOwn(ZM_ZXQSB, key)) continue;
                    const codeNums = ZM_ZXQSB[key];
                    if (codeNums.includes(num)) {
                        itemCodes.push(key);
                        break;
                    }
                }
            }

            // 正码特 ZMT
            for (let i = 1; i <= 6; i++) {
                for (let j = 0; j < zmNums.length; j++) {
                    const num = zmNums[j];
                    if (this.betRuleHelper.numbers.includes(num)) {
                        itemCodes.push(`ZMT_Z${i}T_${num}`);
                    }
                }
            }            

            // 连肖尾连 LXLW
            const LXLWGroups = await Bet.findAll({
                where: {
                    is_group_bet: 0,
                    group_name: 'LXLW',
                },
                attributes: ['item_code'],
            });
            if (LXLWGroups.length) {
                for (const group of LXLWGroups) {
                    const item_code = group.item_code.split(',');
                    for (let i = 2; i <= 5; i++) {
                        const mergedLXNums = [];
                        const LXLW_LX = this.betRuleHelper.addRulePrefix(`LXLW_${i}LX`);
                        for (const code of item_code) {
                            if (Object.hasOwn(LXLW_LX, code)) {
                                const nums = LXLW_LX[code];
                                mergedLXNums.push(...nums);
                            }
                        }
                        if (zmNums.some(n => mergedLXNums.includes(n))) {
                            itemCodes.push(group.item_code);
                            break;
                        }
                        const lwObj = {};
                        for (let j = 0; j <= 9; j++) {
                            lwObj[`LXLW_${i}LW_${j}`] = this.betRuleHelper.numbers.filter(n => n % 10 === j);
                            if (zmNums.some(n => lwObj[`LXLW_${i}LW_${j}`].includes(n))) {
                                itemCodes.push(group.item_code);
                                break;
                            }
                        }
                    }
                }
            }

            // 连码 四全中：LM_4QZ
            const WinAll4 = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'LM_4QZ',
                },
                attributes: ['item_code'],
            });
            if (WinAll4.length) {
                for (const group of WinAll4) {
                    const item_code = group.item_code.split(',');
                    const codeNums = [];
                    for (const code of item_code) {
                        const num = parseInt(code.split('_')[2]);
                        codeNums.push(num);
                    }
                    let match4 = 0;
                    for (let n of allNums) {
                        if (codeNums.includes(n)) match4++;
                    }
                    if (match4 === 4) itemCodes.push(group.item_code);
                }
            }
            // 连码 三全中 LM_3QZ
            const WinAll3 = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'LM_3QZ',
                },
                attributes: ['item_code'],
            });
            if (WinAll3.length) {
                for (const group of WinAll3) {
                    const item_code = group.item_code.split(',');
                    const codeNums = [];
                    for (const code of item_code) {
                        const num = parseInt(code.split('_')[2]);
                        codeNums.push(num);
                    }
                    let match3 = 0;
                    for (let n of allNums) {
                        if (codeNums.includes(n)) match3++;
                    }
                    if (match3 === 3) itemCodes.push(group.item_code);
                }
            }

            // 连码 二全中 LM_2QZ
            const WinAll2 = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'LM_2QZ',
                },
                attributes: ['item_code'],
            });
            if (WinAll2.length) {
                for (const group of WinAll2) {
                    const item_code = group.item_code.split(',');
                    const codeNums = [];
                    for (const code of item_code) {
                        const num = parseInt(code.split('_')[2]);
                        codeNums.push(num);
                    }
                    let match2 = 0;
                    for (let n of allNums) {
                        if (codeNums.includes(n)) match2++;
                    }
                    if (match2 === 2) itemCodes.push(group.item_code);
                }
            }

            // 连码 三中二 LM_3Z2
            const Win3Z2 = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'LM_3Z2',
                },
                attributes: ['item_code'],
            });
            if (Win3Z2.length) {
                for (const group of Win3Z2) {
                    const item_code = group.item_code.split(',');
                    const codeNums = [];
                    for (const code of item_code) {
                        const num = parseInt(code.split('_')[2]);
                        codeNums.push(num);
                    }
                    let match2 = 0;
                    for (let n of allNums) {
                        if (codeNums.includes(n)) match2++;
                    }
                    if (match2 === 2) itemCodes.push(group.item_code);
                }
            }

            // 连码 二中特 LM_2ZT
            const Win2ZT = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'LM_2ZT',
                },
                attributes: ['item_code'],
            });

            if (Win2ZT.length) {
                for (const group of Win2ZT) {
                    const item_code = group.item_code.split(',');
                    const codeNums = [];
                    for (const code of item_code) {
                        const num = parseInt(code.split('_')[2]);
                        codeNums.push(num);
                    }

                    // 保险：二中特必须是2个号码
                    if (codeNums.length !== 2) continue;

                    let hitNormal = 0; // 命中正码数量(0~2)
                    let hitSpecial = 0; // 是否命中特码(0/1)

                    for (const n of codeNums) {
                        if (allNums.includes(n)) hitNormal++;
                        if (n === num7) hitSpecial++;
                    }

                    // 中奖条件：
                    // 中二：2个都在正码
                    // 中特：1个正码 + 1个特码
                    const isWin = (hitNormal === 2) || (hitNormal === 1 && hitSpecial === 1);

                    if (isWin) itemCodes.push(group.item_code);
                }
            }

            // 特串 LM_TC
            const WinTC = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'LM_TC',
                },
                attributes: ['item_code'],
            });

            if (WinTC.length) {
                for (const group of WinTC) {
                    const item_code = group.item_code.split(',');

                    const codeNums = [];
                    for (const code of item_code) {
                        const num = parseInt(code.split('_')[2]);
                        codeNums.push(num);
                    }

                    // 特串必须是2个号码
                    if (codeNums.length !== 2) continue;

                    // 必须：包含特码
                    const hasSpecial = codeNums.includes(num7);
                    if (!hasSpecial) continue;

                    // 另一个必须命中任意正码
                    const otherNum = (codeNums[0] === num7) ? codeNums[1] : codeNums[0];
                    const hitNormal = zmNums.includes(otherNum);

                    if (hitNormal) itemCodes.push(group.item_code);
                }
            }

            // 一肖总肖平特尾数 YXZXPTWS 一肖
            const YXZXPTWS_YX = this.betRuleHelper.addRulePrefix('YXZXPTWS_YX');
            for (const key in YXZXPTWS_YX) {
                if (!Object.hasOwn(YXZXPTWS_YX, key)) continue;
                const nums = YXZXPTWS_YX[key];
                if (allNums.some(n => nums.includes(n))) {
                    itemCodes.push(key);
                }
            }

            // 一肖总肖平特尾数 YXZXPTWS 总肖
            let count = 0;
            for (const key in this.orderedZodiacs) {
                if (!Object.hasOwn(this.orderedZodiacs, key)) continue;
                const numbers = this.orderedZodiacs[key];
                if (allNums.some(n => numbers.includes(n))) {
                    count++;
                }
            }
            for (let i = 2; i <= count; i++) {
                const totalZodiacKey = `YXZXPTWS_ZX_${i}LX`;
                itemCodes.push(totalZodiacKey);
            }
            if ([3, 5, 7].includes(count)) {
                itemCodes.push('YXZXPTWS_ZX_ZX_DAN');
            } else if ([2, 4, 6].includes(count)) {
                itemCodes.push('YXZXPTWS_ZX_ZX_SHUANG');
            }

            // 一肖总肖平特尾数 YXZXPTWS 平特尾数
            const tails = new Set(allNums.map(n => n % 10));
            for (const tail of tails) {
                itemCodes.push(`YXZXPTWS_WS_${tail}`); // e.g. YXZXPTWS_WS_0, YXZXPTWS_WS_1, ..., YXZXPTWS_WS_9
            }

            // 总和 ZH 
            // 总和大小：7个开奖号码之和≥176为“总和大”，≤174为“总和小”，等于175时为和，退还本金。
            const sum = allNums.reduce((acc, n) => acc + n, 0);
            if (sum >= 176) itemCodes.push('ZH_DA');
            if (sum <= 174) itemCodes.push('ZH_XIAO');
            if (sum === 175) itemCodes.push('ZH_HE');
            // 总和大小不含和：7个开奖号码之和≥175为“大”，≤174为“小”，无和值。
            if (sum >= 175) itemCodes.push('ZH_DA_WH');
            if (sum <= 174) itemCodes.push('ZH_XIAO_WH');
            // 总和单双：7个开奖号码之和的个位数1、3、5、7、9为“总和单”，0、2、4、6、8为“总和双”。
            if (sum != 175) {
                const tail = sum % 10;
                if ([1, 3, 5, 7, 9].includes(tail)) itemCodes.push('ZH_DAN');
                else itemCodes.push('ZH_SHUANG');
            } else {
                // sum === 175：和（无和玩法一般不出单/双结果）
                itemCodes.push('ZH_DAN_WH');
                itemCodes.push('ZH_SHUANG_WH');
            }

            // 16.自选
            // 自选：从49个号码中任选1个号码为一注，如开奖的7个号码中包含选择的号码，即中奖。
            // 举例：开奖号码01,02,03,04,05,06+07，投注「02」，则中奖。
            for (let num of allNums) {
                itemCodes.push(`ZX_${num}`);
            }

            // 17.自选不中
            const WinZXBZ = await Bet.findAll({
                where: {
                    is_group_bet: 1,
                    group_name: 'ZXBZ',
                },
                attributes: ['item_code'],
            });
            if (WinZXBZ.length) {
                for (const group of WinZXBZ) {
                    const parts = group.item_code.split(',');

                    const codeNums = [];
                    for (const code of parts) {
                        const num = parseInt(code.split('_')[1]);
                        codeNums.push(num);
                    }
                    if (codeNums.length < 5) continue;

                    // 中奖条件：7个开奖号码，一个都不在所选号码内
                    const hitAny = allNums.some(n => codeNums.includes(n));
                    if (!hitAny) itemCodes.push(group.item_code);
                }
            }

            // make itemCodes unique
            itemCodes = [...new Set(itemCodes)];
            // console.log('匹配到的投注项:', itemCodes);

            if (!itemCodes.length) {
                return MyResponse(res, this.ResCode.SUCCESS.code, true, '检查完成', { total_bet_amount: 0 });
            }

            const batchSize = 50;
            const totalCodes = itemCodes.length;
            let totalBetAmount = 0;
            for (let i = 0; i < totalCodes; i += batchSize) {
                const batchCodes = itemCodes.slice(i, i + batchSize);
                totalBetAmount += await Bet.sum('bet_amount', {
                    where: {
                        item_code: { [Op.in]: batchCodes },
                    },
                }) || 0;
            }

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '检查完成', { total_bet_amount: totalBetAmount || 0 });
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;