let cron = require('node-cron');
const axios = require('axios');
const ZodiacHelper = require('../helpers/ZodiacHelper');
const { HongKongRecord, AomenRecord } = require('../models');

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
        this.zodiacNumbers = this.zodiacHelper.zodiacNumbers();
        this.zodiacs = this.zodiacHelper.zodiac();
        this.comparisons = this.zodiacHelper.comparisons();
    }

    START = () => {

        // Runs once per day at 21:45 PM
        cron.schedule('45 21 * * *', this.GET_AM_HISTORY).start();
        cron.schedule('45 21 * * *', this.GET_HK_HISTORY).start();

    }

    GET_AM_HISTORY = async () => {
        try {
            console.log('Fetching AM history...');
            const url = 'http://kj.bw7788.com/t?token=1383B87F1BB79303&code=aomen6hc&rows=1&format=json';    
            await this.GET_HISTORY(url, 'aomen');
        } catch (error) {
            console.log(error);
        }
    }

    GET_HK_HISTORY = async () => {
        try {
            console.log('Fetching HK history...');
            const url = 'http://kj.bw7788.com/t?token=1327A2EF3BD58216&code=hklhc&rows=1&format=json';
            await this.GET_HISTORY(url, 'hk');
        } catch (error) {
            console.log(error);
        }
    }

    GET_HISTORY = async (url, type) => {
        try {
            const res = await axios.get(url);
            if (res.status === 200) {
                const data = res.data.data;

                const historyData = [];
                data.forEach(item => {
                    
                    const batch_number = item.expect;
                    const draw_date = item.opentime;
                    const numbers = item.opencode.split(',').map(num => num.trim());
                    const zodiac_year = this.zodiacYears.find(year => new Date(draw_date) >= new Date(year.from_date) && new Date(draw_date) <= new Date(year.to_date));
                    const zodiacKey = zodiac_year ? zodiac_year.animal : null;
                    const year = zodiac_year.from_date.split('-')[0];
                    
                    const obj = {
                        year: Number(year),
                        batch_number: batch_number,
                        draw_date: draw_date,
                    }
                    const currentZodiac = this.zodiacs.find(zodiac => zodiac.key === zodiacKey);
                    const ordered = this.zodiacHelper.zodiacOrder(currentZodiac.id);

                    for (let i = 0; i < numbers.length; i++) {
                        const ele = numbers[i];
                        obj[`num${i + 1}`] = Number(ele);
                        
                        for (let j = 0; j < ordered.length; j++) {
                            const zodiacId = ordered[j];
                            const z = this.zodiacs.find(z => z.id == zodiacId);
                            if (z) {
                                const zodiac = this.zodiacNumbers.find(zodiac => zodiac.num === ele);
                                const comparison = this.comparisons.find(c => c.id === z.id);
                                if (comparison.numbers.includes(Number(ele))) {
                                    obj[`num${i + 1}_desc`] = `${z.name}/${zodiac.wuxing}/${zodiac.color}`;
                                }
                            }
                        }
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