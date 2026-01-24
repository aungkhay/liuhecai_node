const { Config } = require('../models');
const Redis = require('../connections/Redis');

module.exports = async () => {
    const configs = [
        {
            type: 'current_year',
            title: 'Current Year',
            val: '2025',
            description: 'Year 2025',
            data_type: 'string'
        }
    ];

    const count = await Config.count();
    if (count == 0) {
        for (let index = 0; index < configs.length; index++) {
            const config = configs[index];
            await Redis.set(`${process.env.REDIS_PREFIX}_${config.type}`, config.val);
        }
        await Config.bulkCreate(configs);
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] ConfigSeeder has been seeded successfully.');
    } else {
        const existingConfigs = await Config.findAll({ attributes: ['type', 'val'] });
        for (let index = 0; index < existingConfigs.length; index++) {
            const config = existingConfigs[index];
            await Redis.set(`${process.env.REDIS_PREFIX}_${config.type}`, config.val);
            console.log('\x1b[32m[Redis]\x1b[0m', `Config "${config.type}" loaded to Redis.`);
        }
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] Config Data Exists.');
    }
}