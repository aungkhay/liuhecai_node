const { BetItem, BetItemNumber } = require('../models');

module.exports = async () => {
    // 双面
    const sub1 = [
        { sub_category_id: 1, name: '大', code: 'TM_SM_DA', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '小', code: 'TM_SM_XIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '单', code: 'TM_SM_DAN', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '双', code: 'TM_SM_SHUANG', odds: 1.97, item_type: 'simple' },

        { sub_category_id: 1, name: '合大', code: 'TM_SM_HEDA', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '合小', code: 'TM_SM_HEXIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '合单', code: 'TM_SM_HEDAN', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '合双', code: 'TM_SM_HESHUANG', odds: 1.97, item_type: 'simple' },

        { sub_category_id: 1, name: '天肖', code: 'TM_SM_TIANXIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '地肖', code: 'TM_SM_DIXIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '前肖', code: 'TM_SM_QIANXIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '后肖', code: 'TM_SM_HOUXIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '家肖', code: 'TM_SM_JIAXIAO', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '野肖', code: 'TM_SM_YEXIAO', odds: 1.97, item_type: 'simple' },

        { sub_category_id: 1, name: '尾大', code: 'TM_SM_WEIDA', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 1, name: '尾小', code: 'TM_SM_WEIXIAO', odds: 1.97, item_type: 'simple' },

        { sub_category_id: 1, name: '大单', code: 'TM_SM_DADAN', odds: 3.94, item_type: 'simple' },
        { sub_category_id: 1, name: '小单', code: 'TM_SM_XIAODAN', odds: 3.94, item_type: 'simple' },
        { sub_category_id: 1, name: '大双', code: 'TM_SM_DASHUANG', odds: 3.94, item_type: 'simple' },
        { sub_category_id: 1, name: '小双', code: 'TM_SM_XIAOSHUANG', odds: 3.94, item_type: 'simple' },
    ];


    // 号码
    const sub2 = [];
    for (let i = 1; i <= 49; i++) {
        sub2.push({ sub_category_id: 2, code: 'TM_HM_' + String(i), name: String(i), odds: 48.265, item_type: 'simple' });
    }
    // 色波半波
    const sub3 = [
        // 色波 => 红 | 绿 | 蓝
        { sub_category_id: 3, sub_group: '波色', code: 'TM_SBB_HONG', name: '红', odds: 2.839, item_type: 'number_group' },
        { sub_category_id: 3, sub_group: '波色', code: 'TM_SBB_LV', name: '绿', odds: 3.016, item_type: 'number_group' },
        { sub_category_id: 3, sub_group: '波色', code: 'TM_SBB_LAN', name: '蓝', odds: 3.016, item_type: 'number_group' },
        // 半波 => 红单 | 蓝单 | 绿单 | 红双 | 蓝双 | 绿双 | 红大 | 蓝大 | 绿大 | 红小 | 蓝小 | 绿小
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_HONG_DAN', name: '红单', odds: 5.91, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LAN_DAN', name: '蓝单', odds: 5.91, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LV_DAN', name: '绿单', odds: 5.91, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_HONG_SHUANG', name: '红双', odds: 5.253, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LAN_SHUANG', name: '蓝双', odds: 5.91, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LV_SHUANG', name: '绿双', odds: 6.754, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_HONG_DA', name: '红大', odds: 6.754, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LAN_DA', name: '蓝大', odds: 5.253, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LV_DA', name: '绿大', odds: 5.91, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_HONG_XIAO', name: '红小', odds: 4.728, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LAN_XIAO', name: '蓝小', odds: 6.754, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半波', code: 'TM_SBB_LV_XIAO', name: '绿小', odds: 6.754, item_type: 'simple' },
        // 半半波 => 红大单 | 蓝大单 | 绿大单 | 红大双 | 蓝大双 | 绿大双 | 红小单 | 蓝小单 | 绿小单 | 红小双 | 蓝小双 | 绿小双
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_HONG_DA_DAN', name: '红大单', odds: 15.76, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LAN_DA_DAN', name: '蓝大单', odds: 9.456, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LV_DA_DAN', name: '绿大单', odds: 11.82, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_HONG_DA_SHUANG', name: '红大双', odds: 11.82, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LAN_DA_SHUANG', name: '蓝大双', odds: 11.82, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LV_DA_SHUANG', name: '绿大双', odds: 11.82, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_HONG_XIAO_DAN', name: '红小单', odds: 9.456, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LAN_XIAO_DAN', name: '蓝小单', odds: 15.76, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LV_XIAO_DAN', name: '绿小单', odds: 11.82, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_HONG_XIAO_SHUANG', name: '红小双', odds: 9.456, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LAN_XIAO_SHUANG', name: '蓝小双', odds: 11.82, item_type: 'simple' },
        { sub_category_id: 3, sub_group: '半半波', code: 'TM_SBB_LV_XIAO_SHUANG', name: '绿小双', odds: 15.76, item_type: 'simple' },
    ];

    const zodiacName = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const zodiacCode = ['SHU', 'NIU', 'HU', 'TU', 'LONG', 'SHE', 'MA', 'YANG', 'HOU', 'JI', 'GOU', 'ZHU'];

    // 特肖头尾数 TM_TXTWS
    let sub4 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub4.push({ sub_category_id: 4, sub_group: '特肖', code: 'TM_TXTWS_' + String(zodiacCode[i]), name: zodiacName[i], odds: 11.943, item_type: 'number_group' });
    }
    sub4 = sub4.concat([
        // 头尾数 => 0头 | 0尾 | 5尾 | 1头 | 1尾 | 6尾 | 2头 | 2尾 | 7尾 | 3头 | 3尾 | 8尾 | 4头 | 4尾 | 9尾
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_0TOU', name: '0头', odds: 5.362, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_0WEI', name: '0尾', odds: 12.066, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_5WEI', name: '5尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_1TOU', name: '1头', odds: 4.826, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_1WEI', name: '1尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_6WEI', name: '6尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_2TOU', name: '2头', odds: 4.826, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_2WEI', name: '2尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_7WEI', name: '7尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_3TOU', name: '3头', odds: 4.826, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_3WEI', name: '3尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_8WEI', name: '8尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_4TOU', name: '4头', odds: 4.826, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_4WEI', name: '4尾', odds: 9.653, item_type: 'simple' },
        { sub_category_id: 4, sub_group: '头尾数', code: 'TM_TXTWS_9WEI', name: '9尾', odds: 9.653, item_type: 'simple' },
    ]);

    // 合肖 TM_HX
    const sub5 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub5.push({ sub_category_id: 5, code: 'TM_HX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 5.955, item_type: 'number_group' });
    }
    // 五行 TM_WX
    const sub6 = [
        // 五行 => 金 | 木 | 水 | 火 | 土
        { sub_category_id: 6, code: 'TM_WX_JIN', name: '金', odds: 4.5, item_type: 'number_group' },
        { sub_category_id: 6, code: 'TM_WX_MU', name: '木', odds: 4.5, item_type: 'number_group' },
        { sub_category_id: 6, code: 'TM_WX_SHUI', name: '水', odds: 5.6, item_type: 'number_group' },
        { sub_category_id: 6, code: 'TM_WX_HUO', name: '火', odds: 3.8, item_type: 'number_group' },
        { sub_category_id: 6, code: 'TM_WX_TU', name: '土', odds: 5, item_type: 'number_group' },
    ]

    // 正码
    // 正码任选一 ZM_RX1
    const sub7 = [];
    for (let i = 1; i <= 49; i++) {
        sub7.push({ sub_category_id: 7, code: 'ZM_RX1_' + String(i), name: String(i), odds: 8.044, item_type: 'simple' });
    }

    // 正码1-6 ZM_ZM16
    const sub8 = [];
    for (let i = 1; i <= 6; i++) {
        const arrNamr = ['单', '双', '大', '小', '合单', '合双', '合大', '合小', '尾大', '尾小', '红波', '蓝波', '绿波'];
        const arrCode = ['DAN', 'SHUANG', 'DA', 'XIAO', 'HEDAN', 'HESHUANG', 'HEDA', 'HEXIAO', 'WEIDA', 'WEIXIAO', 'HONG', 'LAN', 'LV'];
        for (let j = 0; j < 13; j++) {
            sub8.push({ sub_category_id: 8, code: 'ZM_ZM16_' + String(i) + '_' + String(arrCode[j]), name: arrNamr[j], odds: 1.97, item_type: 'simple' });
        }
    }

    // 正肖七色波 ZM_ZXQSB
    let sub9 = []
    for (let i = 0; i < zodiacName.length; i++) {
        sub9.push({ sub_category_id: 9, sub_group: '正肖', code: 'ZM_ZXQSB_' + String(zodiacCode[i]), name: zodiacName[i], odds: 2.335, item_type: 'number_group' });
    }
    sub9 = sub9.concat([
        // 七色波 => 红波 | 蓝波 | 绿波 | 和局
        { sub_category_id: 9, sub_group: '七色波', code: 'ZM_ZXQSB_HONG', name: '红波', odds: 2.71, item_type: 'simple' },
        { sub_category_id: 9, sub_group: '七色波', code: 'ZM_ZXQSB_LAN', name: '蓝波', odds: 3.094, item_type: 'simple' },
        { sub_category_id: 9, sub_group: '七色波', code: 'ZM_ZXQSB_LV', name: '绿波', odds: 3.094, item_type: 'simple' },
        { sub_category_id: 9, sub_group: '七色波', code: 'ZM_ZXQSB_HE', name: '和局', odds: 33.812, item_type: 'simple' },
    ]);

    // 正码特
    const sub10_15 = []
    const ZTM_arr = ['正一特', '正二特', '正三特', '正四特', '正五特', '正六特'];
    const ZTM_code = ['Z1T', 'Z2T', 'Z3T', 'Z4T', 'Z5T', 'Z6T'];
    for (let i = 0; i < ZTM_arr.length; i++) {
        for (let j = 1; j <= 49; j++) {
            sub10_15.push({ sub_category_id: 10 + i, code: 'ZMT_' + String(ZTM_code[i]) + '_' + String(j), name: String(j), odds: 48.265, item_type: 'simple' });
        }        
    }

    // 连肖连尾 LXLW
    // 二连肖 LXLW_2LX
    const sub16 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub16.push({ sub_category_id: 16, code: 'LXLW_2LX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 4.801, item_type: 'number_group' });
    }
    // 三连肖 LXLW_3LX
    const sub17 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub17.push({ sub_category_id: 17, code: 'LXLW_3LX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 13.513, item_type: 'number_group' });
    }
    // 四连肖 LXLW_4LX
    const sub18 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub18.push({ sub_category_id: 18, code: 'LXLW_4LX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 40.824, item_type: 'number_group' });
    }
    // 五连肖 LXLW_5LX
    const sub19 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub19.push({ sub_category_id: 19, code: 'LXLW_5LX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 121.951, item_type: 'number_group' });
    }
    // 二连尾 LXLW_2LW
    const sub20 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub20.push({ sub_category_id: 20, code: 'LXLW_2LW_' + String(zodiacCode[i]), name: zodiacName[i], odds: 4.801, item_type: 'simple' });
    }
    // 三连尾 LXLW_3LW
    const sub21 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub21.push({ sub_category_id: 21, code: 'LXLW_3LW_' + String(zodiacCode[i]), name: zodiacName[i], odds: 13.513, item_type: 'simple' });
    }
    // 四连尾 LXLW_4LW
    const sub22 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub22.push({ sub_category_id: 22, code: 'LXLW_4LW_' + String(zodiacCode[i]), name: zodiacName[i], odds: 40.824, item_type: 'simple' });
    }
    // 五连尾 LXLW_5LW
    const sub23 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub23.push({ sub_category_id: 23, code: 'LXLW_5LW_' + String(zodiacCode[i]), name: zodiacName[i], odds: 121.951, item_type: 'simple' });
    }
    
    // 连码 LM
    const sub24_29 = [];
    const LM_ARR = ['三中二', '三全中', '二全中', '二中特', '特串', '四全中'];
    const LM_CODE = ['3Z2', '3QZ', '2QZ', '2ZT', 'TC', '4QZ'];
    for (let i = 0; i < LM_ARR.length; i++) {
        for (let j = 1; j <= 49; j++) {
            sub24_29.push({ sub_category_id: 24 + i, code: 'LM_' + String(LM_CODE[i]) + '_' + String(j), name: String(j), odds: 0, item_type: 'simple' });
        }
    }

    // 一肖总肖平特尾数 YXZXPTWS
    // 一肖 YXZXPTWS_YX
    const sub30 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub30.push({ sub_category_id: 30, code: 'YXZXPTWS_YX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 2.335, item_type: 'number_group' });
    }
    // 总肖 YXZXPTWS_ZX
    const sub31 = [];
    for (let i = 0; i < zodiacName.length; i++) {
        sub31.push({ sub_category_id: 31, code: 'YXZXPTWS_ZX_' + String(zodiacCode[i]), name: zodiacName[i], odds: 5.955, item_type: 'number_group' });
    }
    // 尾数 YXZXPTWS_WS
    const sub32 = [];
    for (let i = 0; i <= 9; i++) {
        sub32.push({ sub_category_id: 32, code: 'YXZXPTWS_WS_' + String(i), name: String(i), odds: 1.778, item_type: 'simple' });
    }

    // 总和 ZH
    const sub33 = [
        // 大 | 小 | 大(无和) | 小(无和) | 单 | 双 | 单(无和) | 双(无和)
        { sub_category_id: 33, code: 'ZH_DA', name: '大', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_XIAO', name: '小', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_DA_WH', name: '大(无和)', odds: 2.48, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_XIAO_WH', name: '小(无和)', odds: 2.48, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_DAN', name: '单', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_SHUANG', name: '双', odds: 1.97, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_DAN_WH', name: '单(无和)', odds: 2.48, item_type: 'simple' },
        { sub_category_id: 33, code: 'ZH_SHUANG_WH', name: '双(无和)', odds: 2.48, item_type: 'simple' },
    ]

    // 自选 ZX
    const sub34 = [];
    for (let i = 1; i <= 49; i++) {
        sub34.push({ sub_category_id: 34, code: 'ZX_' + String(i), name: String(i), odds: 6.895, item_type: 'simple' });
    }

    // 自选不中 ZXBZ
    const sub35 = [];
    for (let i = 1; i <= 49; i++) {
        sub35.push({ sub_category_id: 35, code: 'ZXBZ_' + String(i), name: String(i), odds: 0, item_type: 'simple' });
    }

    const count = await BetItem.count();
    if (count == 0) {
        await BetItem.bulkCreate([].concat(
            sub1,
            sub2,
            sub3,
            sub4,
            sub5,
            sub6,
            sub7,
            sub8,
            sub9,
            sub10_15,
            sub16,
            sub17,
            sub18,
            sub19,
            sub20,
            sub21,
            sub22,
            sub23,
            sub24_29,
            sub30,
            sub31,
            sub32,
            sub33,
            sub34,
            sub35
        ));
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] BetItem has been seeded successfully.');
    } else {
        console.log('\x1b[32m%s\x1b[0m', '[Seeder] BetItem Data Exists.');
    }
}