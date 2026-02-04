const { BetCategory, BetSubCategory } = require('../models');

module.exports = async () => {
    const categories = [
        { name: '特码', code: 'TM' },
        { name: '正码', code: 'ZM' },
        { name: '正码特', code: 'ZMT' },
        { name: '连肖连尾', code: 'LXLW' },
        { name: '连码', code: 'LM' },
        { name: '一肖总肖平特尾数', code: 'YXZXPTWS' },
        { name: '总和', code: 'ZH' },
        { name: '自选', code: 'ZX' },
        { name: '自选不中', code: 'ZXBZ' },
    ];

    const subCategories = [
        // 双面 | 号码 | 色波半波 | 特肖头尾数 | 合肖 | 五行
        { category_id: 1, name: '双面', code: 'TM_SM', limit_bet_count: 1 },
        { category_id: 1, name: '号码', code: 'TM_HM', limit_bet_count: 1 },
        { category_id: 1, name: '色波半波', code: 'TM_SBB', limit_bet_count: 1 },
        { category_id: 1, name: '特肖头尾数', code: 'TM_TXTWS', limit_bet_count: 1 },
        { category_id: 1, name: '合肖', code: 'TM_HX', limit_bet_count: 2, odds: {"2HX": 5.955,"3HX": 3.95,"4HX": 3.97,"5HX": 3.97,"6HX": 3.97,"7HX": 3.97,"8HX": 3.97,"9HX": 3.97, "10HX": 3.97,"11HX": 3.97} },
        { category_id: 1, name: '五行', code: 'TM_WX', limit_bet_count: 1 },
        // 正码任选一 | 正码1-6 | 正肖七色波
        { category_id: 2, name: '正码任选一', code: 'ZM_RX1', limit_bet_count: 1 },
        { category_id: 2, name: '正码1-6', code: 'ZM_ZM16', limit_bet_count: 1 },
        { category_id: 2, name: '正肖七色波', code: 'ZM_ZXQSB', limit_bet_count: 1 },
        // 正一特 | 正二特 | 正三特 | 正四特 | 正五特 | 正六特
        { category_id: 3, name: '正一特', code: 'ZMT_Z1T', limit_bet_count: 1 },
        { category_id: 3, name: '正二特', code: 'ZMT_Z2T', limit_bet_count: 1 },
        { category_id: 3, name: '正三特', code: 'ZMT_Z3T', limit_bet_count: 1 },
        { category_id: 3, name: '正四特', code: 'ZMT_Z4T', limit_bet_count: 1 },
        { category_id: 3, name: '正五特', code: 'ZMT_Z5T', limit_bet_count: 1 },
        { category_id: 3, name: '正六特', code: 'ZMT_Z6T', limit_bet_count: 1 },
        // 二连肖 | 三连肖 | 四连肖 | 五连肖 | 二连尾 | 三连尾 | 四连尾 | 五连尾
        { category_id: 4, name: '二连肖', code: 'LXLW_2LX', limit_bet_count: 2 },
        { category_id: 4, name: '三连肖', code: 'LXLW_3LX', limit_bet_count: 3 },
        { category_id: 4, name: '四连肖', code: 'LXLW_4LX', limit_bet_count: 4 },
        { category_id: 4, name: '五连肖', code: 'LXLW_5LX', limit_bet_count: 5 },
        { category_id: 4, name: '二连尾', code: 'LXLW_2LW', limit_bet_count: 2 },
        { category_id: 4, name: '三连尾', code: 'LXLW_3LW', limit_bet_count: 3 },
        { category_id: 4, name: '四连尾', code: 'LXLW_4LW', limit_bet_count: 4 },
        { category_id: 4, name: '五连尾', code: 'LXLW_5LW', limit_bet_count: 5 },
        // 三中二 | 三全中 | 二全中 | 二中特 | 特串 | 四全中
        { category_id: 5, name: '三中二', code: 'LM_3Z2', limit_bet_count: 3, odds: { "Z2": 24.359, "Z3": 121.796 } },
        { category_id: 5, name: '三全中', code: 'LM_3QZ', limit_bet_count: 3, odds: { "3QZ": 907.411 } },
        { category_id: 5, name: '二全中', code: 'LM_2QZ', limit_bet_count: 2, odds: { "2QZ": 72.617 } },
        { category_id: 5, name: '二中特', code: 'LM_2ZT', limit_bet_count: 2, odds: { "Z2": 62.277, "ZT": 37.366 } },
        { category_id: 5, name: '特串', code: 'LM_TC', limit_bet_count: 2, odds: { "TC": 193.06 } },
        { category_id: 5, name: '四全中', code: 'LM_4QZ', limit_bet_count: 4, odds: { "4QZ": 13913.19 } },
        // 一肖 | 总肖 | 平特尾数
        { category_id: 6, name: '一肖', code: 'YXZXPTWS_YX', limit_bet_count: 1 },
        { category_id: 6, name: '总肖', code: 'YXZXPTWS_ZX', limit_bet_count: 1 },
        { category_id: 6, name: '平特尾数', code: 'YXZXPTWS_PTWS', limit_bet_count: 1 },
        // 总和
        { category_id: 7, name: '总和', code: 'ZH', limit_bet_count: 1 },
        // 自选
        { category_id: 8, name: '自选', code: 'ZX', limit_bet_count: 1 },
        // 自选不中
        { category_id: 9, name: '自选不中', code: 'ZXBZ', limit_bet_count: 5, odds: { "5BZ": 2.207, "6BZ": 3.5, "7BZ": 5.5, "8BZ": 9.5, "9BZ": 18.5 } },
    ]

    const count = await BetCategory.count();
    if (count == 0) {
        await BetCategory.bulkCreate(categories);
        await BetSubCategory.bulkCreate(subCategories);
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] BetCategory has been seeded successfully.');
    } else {
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] BetCategory Data Exists.');
    }
}