let cron = require('node-cron');
const axios = require('axios');
const ZodiacHelper = require('../helpers/ZodiacHelper');
const RedisHelper = require('../helpers/RedisHelper');
const BetRuleHelper = require('../helpers/BetRuleHelper');
const BetCalculator = require('../helpers/BetCalculator');
const { HongKongRecord, AomenRecord, PlatformRecord, BetCategory, Bet, ResultGuess, TouZiPingTe, DoubleColor, db, ZodiacFeed, MustWin3Batch } = require('../models');
const moment = require('moment');
const { errLogger } = require('../helpers/Logger');

class Cron {
    constructor(app) {
        this.redisHelper = new RedisHelper(app);
        this.betCalculator = new BetCalculator();
        this.zodiacYears = [
            { animal: "rat", from_date: "2020-01-25", to_date: "2021-02-11" },
            { animal: "ox", from_date: "2021-02-12", to_date: "2022-01-31" },
            { animal: "tiger", from_date: "2022-02-01", to_date: "2023-01-21" },
            { animal: "rabbit", from_date: "2023-01-22", to_date: "2024-02-09" },
            { animal: "dragon", from_date: "2024-02-10", to_date: "2025-01-28" },
            { animal: "snake", from_date: "2025-01-29", to_date: "2026-02-16" },
            { animal: "horse", from_date: "2026-02-17", to_date: "2027-02-05" },
            { animal: "goat", from_date: "2027-02-06", to_date: "2028-01-25" },
            { animal: "monkey", from_date: "2028-01-26", to_date: "2029-02-12" },
            { animal: "rooster", from_date: "2029-02-13", to_date: "2030-02-02" },
            { animal: "dog", from_date: "2030-02-03", to_date: "2031-01-22" }
        ]
        this.zodiacHelper = new ZodiacHelper();
        this.betRuleHelper = new BetRuleHelper();
        this.max_attempts = 50;
        this.current_attempts = 0;
    }

    START = () => {

        cron.schedule('40 21 * * *', this.GET_NEW_AM_HISTORY).start();
        cron.schedule('45 21 * * *', () => this.GET_HK_HISTORY(1)).start();
        // Run every minute
        cron.schedule('* * * * *', this.CALCULATE_BET).start();
        // Run 8:32:30 PM every day
        cron.schedule('30 15 21 * * *', this.CREATE_BET_RESULT).start();
    }

    GET_AM_HISTORY = async (rows = 2000) => {
        try {
            console.log('Fetching AM history...');
            const url = `http://vip.manycai.com/K2699e98b162094/MOLHC-${rows}.json`;
            await this.GET_HISTORY(url, 'aomen');
        } catch (error) {
            console.log(error);
        }
    }

    GET_HK_HISTORY = async (rows = 2000) => {
        try {
            console.log('Fetching HK history...');
            const url = `http://vip.manycai.com/K2699e98b162094/XGLHC-${rows}.json`;
            await this.GET_HISTORY(url, 'hk');
        } catch (error) {
            console.log(error);
        }
    }

    GET_HISTORY = async (url, type) => {
        try {
            const res = await axios.get(url);
            if (res.status === 200) {
                const data = res.data;

                const historyData = [];
                data.forEach(item => {

                    const batch_number = item.issue;
                    const draw_date = item.opendate;
                    const numbers = item.attrs;
                    const format = 'YYYY-MM-DD';
                    const zodiac_year = this.zodiacYears.find(year => moment(draw_date).format(format) >= moment(year.from_date).format(format) && moment(draw_date).format(format) <= moment(year.to_date).format(format));
                    const year = zodiac_year.from_date.split('-')[0];
                    const obj = {
                        year: Number(year),
                        batch_number: batch_number,
                        draw_date: draw_date,
                    }
                    for (let i = 0; i < numbers.length; i++) {
                        const attr = numbers[i];
                        obj[`num${i + 1}`] = Number(attr.num);
                        const wuxing = this.zodiacHelper.getWuxingById(Number(attr.num));
                        obj[`num${i + 1}_desc`] = `${attr.animal}/${wuxing}/${attr.color}`;
                    }
                    historyData.push(obj);
                });

                // chuck historyData into batches of 100 and insert into DB
                const batchSize = 100;
                for (let i = 0; i < historyData.length; i += batchSize) {
                    const batch = historyData.slice(i, i + batchSize);
                    if (type === 'hk') {
                        await HongKongRecord.bulkCreate(batch, { ignoreDuplicates: true });
                    } else {
                        await AomenRecord.bulkCreate(batch, { ignoreDuplicates: true });
                    }
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    GET_NEW_AM_HISTORY = async () => {
        try {
            const currentYear = new Date().getFullYear();
            // Ref: https://macaujc.com/macaujc2
            const url = `https://history.macaumarksix.com/history/macaujc2/y/${currentYear}`;
            const res = await axios.get(url);
            if (res.status === 200) {
                const data = res.data;
                if (data && data.code === 200) {

                    const recordCount = await AomenRecord.count();

                    // If no records in DB, get all history. Otherwise, get only the latest record (first item in data array) and check if it exists in DB. If not, insert it.
                    const records = recordCount == 0 ? data.data : [data.data[0]]; 
                    const historyData = [];

                    records.forEach(item => {
                        const format = 'YYYY-MM-DD';
                        const zodiac_year = this.zodiacYears.find(year => moment(item.openTime).format(format) >= moment(year.from_date).format(format) && moment(item.openTime).format(format) <= moment(year.to_date).format(format));
                        const year = zodiac_year.from_date.split('-')[0];
                        const obj = {
                            year: Number(year),
                            batch_number: item.expect,
                            draw_date: item.openTime,
                        }
                        const openCode = item.openCode.split(',');
                        const openZodiac = item.zodiac.split(',');
                        const openColor = item.wave.split(',');
                        for (let i = 0; i < openCode.length; i++) {
                            obj[`num${i + 1}`] = Number(openCode[i]);
                            const wuxing = this.zodiacHelper.getWuxingById(Number(openCode[i]));
                            obj[`num${i + 1}_desc`] = `${openZodiac[i]}/${wuxing}/${openColor[i]}`;
                        }
                        historyData.push(obj);
                    });

                    const batchSize = 100;
                    for (let i = 0; i < historyData.length; i += batchSize) {
                        const batch = historyData.slice(i, i + batchSize);
                        await AomenRecord.bulkCreate(batch, { ignoreDuplicates: true });
                    }
                }
            }
        } catch (error) {
            console.log(error); 
        }
    }

    CREATE_BET_RESULT = async () => {
        try {

            const lastRecord = await PlatformRecord.findOne({
                order: [['batch_number', 'DESC']]
            });
            // check already have created record for today
            if (lastRecord) {
                const lastRecordDate = moment(lastRecord.draw_date).format('YYYY-MM-DD');
                const today = moment().format('YYYY-MM-DD');
                console.log(lastRecord, today)
                if (lastRecordDate === today) {
                    console.log('[Cron] Bet result for today already created.');
                    return;
                }
                if (lastRecord.calculate_status != 2) {
                    console.log('[Cron] Last record is not calculated yet.');
                    return;
                }
            }

            const allNums = [];
            while (allNums.length < 7) {
                const rand = Math.floor(Math.random() * 49) + 1;
                // rand number must not be duplicated with last record's numbers
                if (lastRecord) {
                    const lastNums = [lastRecord.num1, lastRecord.num2, lastRecord.num3, lastRecord.num4, lastRecord.num5, lastRecord.num6, lastRecord.num7];
                    if (lastNums.includes(rand)) {
                        continue;
                    }
                }
                if (!allNums.includes(rand)) {
                    allNums.push(rand);
                }
            }

            const now = new Date();
            const year = now.getFullYear();
            let current_year = year;
            let batch_number = `${current_year % 100}000`;
            if (lastRecord) {
                // Check if the last record's batch number is from the current year
                const recordYear = Math.floor(Number(lastRecord.batch_number) / 1000);
                if (recordYear === current_year % 100) {
                    batch_number = Number(lastRecord.batch_number) + 1;
                }
            }

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
            if (!bets || bets.length === 0) {
                console.log('[Cron] No bets found');
                // return;
            }

            let totalWinAmount = 0;
            for (const bet of bets) {
                totalWinAmount += (this.betRuleHelper[`CATEGORY_WIN_${bet.category_id}`] && await this.betRuleHelper[`CATEGORY_WIN_${bet.category_id}`](allNums)) || 0;
            }

            const profitLossPercentage = totalBetAmount > 0 ? ((totalBetAmount - totalWinAmount) / totalBetAmount) * 100 : 0;
            console.log(`[Cron] Profit/Loss percentage: ${profitLossPercentage.toFixed(2)}%`);
            if (profitLossPercentage < 20) {
                // max attempts 50 times to get a result with profit/loss percentage >= 20%
                if (this.current_attempts < this.max_attempts) {
                    this.current_attempts++;
                    return this.CREATE_BET_RESULT();
                } else {
                    console.log('[Cron] Max attempts reached. Unable to achieve desired profit/loss percentage.');
                    this.current_attempts = 0;
                    // return;
                }
            }
            this.current_attempts = 0;

            const obj = {
                year: current_year,
                batch_number: batch_number,
                num1: allNums[0],
                num2: allNums[1],
                num3: allNums[2],
                num4: allNums[3],
                num5: allNums[4],
                num6: allNums[5],
                num7: allNums[6],
                draw_date: new Date(),
                num1_desc: null,
                num2_desc: null,
                num3_desc: null,
                num4_desc: null,
                num5_desc: null,
                num6_desc: null,
                num7_desc: null,
                calculate_status: 1,
                remark: '系统自动生成',
            }

            const orderedZodiacs = this.zodiacHelper.orderedZodiac();
            const allZodiacs = this.zodiacHelper.zodiac();
            // console.log('Ordered Zodiacs:', orderedZodiacs);
            for (let i = 0; i < 7; i++) {
                const num = allNums[i];
                for (const code in orderedZodiacs) {
                    if (!Object.hasOwn(orderedZodiacs, code)) continue;
                    const numbers = orderedZodiacs[code];
                    if (numbers.includes(num)) {
                        const zodiacInfo = allZodiacs.find(z => z.code === code);
                        const wuxing = this.zodiacHelper.getWuxingById(num);
                        const color = this.zodiacHelper.getColorById(num);
                        obj[`num${i + 1}_desc`] = `${zodiacInfo.name}/${wuxing}/${color}`;
                        break;
                    }
                }
            }
            
            const resultGuess = await ResultGuess.findOne({ where: { batch_number: batch_number }, attributes: ['id', 'zodiac_attr'] });
            let result_match = 2; // 0 => normal | 1 => match | 2 => not match
            if (resultGuess) {
                const attributes = this.zodiacHelper.zodiacAttributes();
                const zodiacs = attributes[resultGuess.zodiac_attr]; // ["鼠","牛","虎","猴","狗","猪"]

                const zodiacName = obj.num7_desc.split('/'); // 鼠/金/blue
                if (zodiacs.includes(zodiacName[0])) {
                    result_match = 1;
                }
            }
            const touziPingTeRecord = await TouZiPingTe.findOne({
                attributes: ['id', 'batch_start', 'batch_end', 'zodiac_name', 'open_count'],
                order: [['id', 'DESC']],
            });
            const zodiacNameArr = [];
            if (touziPingTeRecord && (touziPingTeRecord.batch_start >= batch_number || touziPingTeRecord.batch_end <= batch_number)) {
                for (let i = 1; i <= 7; i++) {
                    const zName = obj[`num${i}_desc`].split('/');
                    zodiacNameArr.push(zName[0]);
                }
            }
            const doubleColor = await DoubleColor.findOne({ where: { batch_number: batch_number } });
            const zodiacFeed = await ZodiacFeed.findOne({ where: { batch_number: batch_number } });
            const mustWin3Batch = await MustWin3Batch.findOne({
                where: {
                    batch_one: { [Op.lte]: batch_number },
                    batch_three: { [Op.gte]: batch_number },
                    is_finished: 0
                }
            });

            const t = await db.transaction();
            try {
                const record = await PlatformRecord.create(obj, { transaction: t });

                if (resultGuess) {
                    await resultGuess.update({ result_match: result_match, result_number: obj.num7, zodiac_name: obj.num7_desc.split('/')[0] }, { transaction: t });
                }
                if (touziPingTeRecord && zodiacNameArr.includes(touziPingTeRecord.zodiac_name)) {
                    await touziPingTeRecord.update({ open_count: touziPingTeRecord.open_count + 1 }, { transaction: t });
                }
                if (touziPingTeRecord && touziPingTeRecord.batch_end == batch_number) {
                    await touziPingTeRecord.update({ is_finished: 1 }, { transaction: t });
                }
                if (doubleColor) {
                    await doubleColor.update({ result_number: obj.num7, zodiac_name: obj.num7_desc.split('/')[0], match_color: obj.num7_desc.split('/')[2]  }, { transaction: t });
                }
                if (zodiacFeed) {
                    await zodiacFeed.update({ result_number: obj.num7, result_zodiac_name: obj.num7_desc.split('/')[0] }, { transaction: t });
                }
                if (mustWin3Batch) {
                    const arr = [mustWin3Batch.batch_one, mustWin3Batch.batch_two, mustWin3Batch.batch_three];
                    const index = arr.findIndex(batch => batch_number === batch);
                    if (index !== -1) {
                        const updateData = {
                            result_number_one: mustWin3Batch.result_number_one,
                            result_number_two: mustWin3Batch.result_number_two,
                            result_number_three: mustWin3Batch.result_number_three,
                        };
                        if (index === 0) {
                            updateData.result_number_one = obj.num7;
                            updateData.result_zodiac_one = obj.num7_desc.split('/')[0];
                        } else if (index === 1) {
                            updateData.result_number_two = obj.num7;
                            updateData.result_zodiac_two = obj.num7_desc.split('/')[0];
                        } else if (index === 2) {
                            updateData.result_number_three = obj.num7;
                            updateData.result_zodiac_three = obj.num7_desc.split('/')[0];
                        }

                        if (updateData.result_number_one !== 0 && updateData.result_number_two !== 0 && updateData.result_number_three !== 0) {
                            updateData.is_finished = 1;
                        }
                        await mustWin3Batch.update(updateData, { transaction: t });
                    }
                }

                await this.redisHelper.setValue(`CALCULATE_BET_RESULTS`, JSON.stringify({ id: record.id, status: 0 }));
                await t.commit();
            } catch (error) {
                await t.rollback();
                console.log(error);
                errLogger(`[Cron][CREATE_BET_RESULT]: ${error.message}`);
            }

        } catch (error) {
            console.log(error);
            errLogger(`[Cron][CREATE_BET_RESULT]: ${error.message}`);
        }
    }

    CALCULATE_BET = async () => {
        try {

            const record = await this.redisHelper.getValue(`CALCULATE_BET_RESULTS`);
            if (!record) {
                console.log('No record found in Redis for CALCULATE_BET_RESULTS');
                return;
            }
            const recordObj = JSON.parse(record);
            console.log(recordObj)
            if (recordObj.status === 1) {
                console.log('Bets are in the calculating process, please wait...');
                return;
            }

            // 正码1+正码2+正码3+正码4+正码5+正码6  +   特码
            const result = await PlatformRecord.findOne({
                where: { id: recordObj.id }, 
                order: [['draw_date', 'DESC']] 
            });
            if (!result) {
                console.log('No platform record found for bet calculation');
                return;
            }
            if (result.status === 2) {
                console.log('Bet calculation already completed for this record');
                await this.redisHelper.deleteKey(`CALCULATE_BET_RESULTS`);
                return;
            }
            if (result.status === 1) {
                console.log('Bet calculation already in process for this record');
                return;
            }
            await this.redisHelper.setValue(`CALCULATE_BET_RESULTS`, JSON.stringify({ id: recordObj.id, status: 1 }));

            await this.betCalculator.RUN(result);

            await this.redisHelper.deleteKey(`CALCULATE_BET_RESULTS`);

            console.log('Bet calculation completed successfully');
            
        } catch (error) {
            console.log(error);
            await this.redisHelper.deleteKey(`CALCULATE_BET_RESULTS`);
        }
    }
}

module.exports = Cron;