require('dotenv').config({ path: `./.env` })

const { connect } = require('../models');
connect();

const ConfigSeeder = require('./ConfigSeeder');
const UserSeeder = require('./UserSeeder');
const CategorySeeder = require('./CategorySeeder');
const BetItemSeeder = require('./BetItemSeeder');

const seed = async () => {
    await ConfigSeeder();
    await UserSeeder();
    await CategorySeeder();
    await BetItemSeeder();

    console.log('\x1b[32m%s\x1b[0m', '[Seeder] All seeders are seeded successfully');
    process.exit();
}

seed();