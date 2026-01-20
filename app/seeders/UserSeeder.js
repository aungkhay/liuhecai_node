const { encrypt } = require('../helpers/AESHelper');
const { User } = require('../models');
 
const PASS_KEY = process.env.PASS_KEY;
const PASS_IV = process.env.PASS_IV;
const PASS_PREFIX = process.env.PASS_PREFIX;
const PASS_SUFFIX = process.env.PASS_SUFFIX;

module.exports = async () => {
    const users = [
        {
            type: 1,
            name: "Super Admin",
            phone_number: '13914725800',
            password: encrypt(PASS_PREFIX + 'superadmin@123' + PASS_SUFFIX, PASS_KEY, PASS_IV),
        }
    ];

    const count = await User.count();
    if (count == 0) {
        await User.bulkCreate(users);
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] UserSeeder has been seeded successfully.');
    } else {
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] User Data Exists.');
    }
}