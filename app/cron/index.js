let cron = require('node-cron');
const axios = require('axios');
const ZodiacHelper = require('../helpers/ZodiacHelper');
const { HongKongRecord, AomenRecord, PlatformRecord, BetCategory } = require('../models');
const moment = require('moment');

class Cron {
    constructor() {
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
    }

    START = () => {

        cron.schedule('40 21 * * *', () => this.GET_NEW_AM_HISTORY()).start();
        cron.schedule('45 21 * * *', () => this.GET_HK_HISTORY(1)).start();

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

    CALCULATE_CATEGORY_BET_1 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_2 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_3 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_4 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_5 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_6 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_7 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_8 = async (category, result) => {}
    CALCULATE_CATEGORY_BET_9 = async (category, result) => {}

    CALCULATE_BET = async () => {
        try {
            // 正码1+正码2+正码3+正码4+正码5+正码6  +   特码
            const result = await PlatformRecord.findOne({ order: [['draw_date', 'DESC']] });

            const categories = await BetCategory.findAll({ where: { is_active: 1 } });
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                await this[`CALCULATE_CATEGORY_BET_${category.id}`](category, result);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Cron;