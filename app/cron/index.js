let cron = require('node-cron');
const axios = require('axios');
const ZodiacHelper = require('../helpers/ZodiacHelper');
const { HongKongRecord, AomenRecord } = require('../models');
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

        cron.schedule('40 21 * * *', () => this.GET_AM_HISTORY(1)).start();
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
}

module.exports = Cron;