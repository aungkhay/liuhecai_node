const { Bet } = require("../models");
const ZodiacHelper = require("./ZodiacHelper");

class BetRuleHelper {
    constructor() {
        this.zodiacHelper = new ZodiacHelper();
        this.numbers = Array.from({ length: 49 }, (_, i) => i + 1);
        this.isBig = (num) => num >= 25;
        this.isSmall = (num) => num <= 24;
        this.isOdd = (num) => num % 2 === 1;
        this.isEven = (num) => num % 2 === 0;
        this.sumDigits = (n) => n.toString().split('').reduce((a, b) => a + Number(b), 0);
        this.orderedZodiac = this.zodiacHelper.orderedZodiac();
        this.RED = [1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
        this.BLUE = [3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
        this.GREEN = [5,6,11,16,17,21,22,27,28,32,33,38,39,43,44,49];
        this.addRulePrefix = (key) => {
            const resetObj = {}
            for (const k in this.orderedZodiac) {
                resetObj[`${key}_${k}`] = this.orderedZodiac[k];
            }
            return resetObj;
        }

        // 鼠、虎、蛇、羊、鸡、狗
        this.TIANXIAO = [
            ...this.orderedZodiac['SHU'],
            ...this.orderedZodiac['HU'], 
            ...this.orderedZodiac['SHE'], 
            ...this.orderedZodiac['YANG'],
            ...this.orderedZodiac['JI'],
            ...this.orderedZodiac['GOU'],
        ];
        // 牛、兔、龙、马、猴、猪
        this.DIXIAO = [
            ...this.orderedZodiac['NIU'],
            ...this.orderedZodiac['TU'], 
            ...this.orderedZodiac['LONG'],
            ...this.orderedZodiac['MA'],
            ...this.orderedZodiac['HOU'],
            ...this.orderedZodiac['ZHU'],
        ];
        // 鼠、牛、虎、兔、龙、蛇
        this.HOUXIAO = [
            ...this.orderedZodiac['SHU'],
            ...this.orderedZodiac['NIU'], 
            ...this.orderedZodiac['HU'],
            ...this.orderedZodiac['TU'],
            ...this.orderedZodiac['LONG'],
            ...this.orderedZodiac['SHE'],
        ];
        // 马、羊、猴、鸡、狗、猪
        this.QIANXIAO = [
            ...this.orderedZodiac['MA'],
            ...this.orderedZodiac['YANG'], 
            ...this.orderedZodiac['HOU'],
            ...this.orderedZodiac['JI'],
            ...this.orderedZodiac['GOU'],
            ...this.orderedZodiac['ZHU'],
        ];
        // 牛、马、羊、鸡、狗、猪
        this.YEXIAO = [
            ...this.orderedZodiac['NIU'],
            ...this.orderedZodiac['MA'],
            ...this.orderedZodiac['YANG'],
            ...this.orderedZodiac['JI'],
            ...this.orderedZodiac['GOU'],
            ...this.orderedZodiac['ZHU'],
        ];
        // 鼠、虎、兔、龙、蛇、猴
        this.JIAXIAO = [
            ...this.orderedZodiac['SHU'],
            ...this.orderedZodiac['HU'],
            ...this.orderedZodiac['TU'],
            ...this.orderedZodiac['LONG'],
            ...this.orderedZodiac['SHE'],
            ...this.orderedZodiac['HOU'],
        ];

        this.TM_WX_JIN = [4, 5, 12, 13, 26, 27, 34, 35, 42, 43];
        this.TM_WX_MU = [8, 9, 16, 17, 24, 25, 38, 39, 46, 47];
        this.TM_WX_SHUI = [1, 14, 15, 22, 23, 30, 31, 44, 45];
        this.TM_WX_HUO = [2, 3, 10, 11, 18, 19, 32, 33, 40, 41, 48, 49];
        this.TM_WX_TU = [6, 7, 20, 21, 28, 29, 36, 37];
    }

    // // 特合大小 (十位 + 个位)
    TM_SM_HEDA = () => this.numbers.filter(n => this.sumDigits(n) >= 7)
    TM_SM_HEXIAO = () => this.numbers.filter(n => this.sumDigits(n) <= 6)

    // 特合单双
    TM_SM_HEDAN = () => this.numbers.filter(n => this.sumDigits(n) % 2 === 1)
    TM_SM_HESHUANG = () => this.numbers.filter(n => this.sumDigits(n) % 2 === 0)

    // 尾数大小
    TM_SM_WEIDA = () => this.numbers.filter(n => n % 10 >= 5)
    TM_SM_WEIXIAO = () => this.numbers.filter(n => n % 10 <= 4)

    // 大小单双组
    TM_SM_DADAN = () => this.numbers.filter(n => this.isBig(n) && this.isOdd(n))
    TM_SM_DASHUANG = () => this.numbers.filter(n => this.isBig(n) && this.isEven(n))
    TM_SM_XIAODAN = () => this.numbers.filter(n => this.isSmall(n) && this.isOdd(n))
    TM_SM_XIAOSHUANG = () => this.numbers.filter(n => this.isSmall(n) && this.isEven(n))

    TM_SM_TIANXIAO = () => this.TIANXIAO
    TM_SM_DIXIAO = () => this.DIXIAO
    TM_SM_QIANXIAO = () => this.QIANXIAO
    TM_SM_HOUXIAO = () => this.HOUXIAO
    TM_SM_JIAXIAO = () => this.JIAXIAO
    TM_SM_YEXIAO = () => this.YEXIAO

    TM_ITEM_CODES = async (num7) => {
        try {
            const codes = [];
            // 特码-双面 TM_SM
            if (this.isBig(num7)) codes.push('TM_SM_DA');
            if (this.isSmall(num7)) codes.push('TM_SM_XIAO');
            if (this.isOdd(num7)) codes.push('TM_SM_DAN');
            if (this.isEven(num7)) codes.push('TM_SM_SHUANG');
            if (this.TM_SM_HEDA().includes(num7)) codes.push('TM_SM_HEDA');
            if (this.TM_SM_HEXIAO().includes(num7)) codes.push('TM_SM_HEXIAO');
            if (this.TM_SM_HEDAN().includes(num7)) codes.push('TM_SM_HEDAN');
            if (this.TM_SM_HESHUANG().includes(num7)) codes.push('TM_SM_HESHUANG');
            if (this.TM_SM_WEIDA().includes(num7)) codes.push('TM_SM_WEIDA');
            if (this.TM_SM_WEIXIAO().includes(num7)) codes.push('TM_SM_WEIXIAO');
            if (this.TM_SM_TIANXIAO().includes(num7)) codes.push('TM_SM_TIANXIAO');
            if (this.TM_SM_DIXIAO().includes(num7)) codes.push('TM_SM_DIXIAO');
            if (this.TM_SM_QIANXIAO().includes(num7)) codes.push('TM_SM_QIANXIAO');
            if (this.TM_SM_HOUXIAO().includes(num7)) codes.push('TM_SM_HOUXIAO');
            if (this.TM_SM_JIAXIAO().includes(num7)) codes.push('TM_SM_JIAXIAO');
            if (this.TM_SM_YEXIAO().includes(num7)) codes.push('TM_SM_YEXIAO');
            if (this.TM_SM_DADAN().includes(num7)) codes.push('TM_SM_DADAN');
            if (this.TM_SM_DASHUANG().includes(num7)) codes.push('TM_SM_DASHUANG');
            if (this.TM_SM_XIAODAN().includes(num7)) codes.push('TM_SM_XIAODAN');
            if (this.TM_SM_XIAOSHUANG().includes(num7)) codes.push('TM_SM_XIAOSHUANG');

            // 特码-号码 TM_HM
            if (this.numbers.includes(num7)) {
                codes.push(`TM_HM_${num7}`);
            }

            // // 特码-色波半波 TM_SBB
            if (this.RED.includes(num7)) codes.push('TM_SBB_HONG');
            if (this.BLUE.includes(num7)) codes.push('TM_SBB_LAN');
            if (this.GREEN.includes(num7)) codes.push('TM_SBB_LV');
            if (num7 != 49) {
                const colorMap = {
                    HONG: this.RED,
                    LAN: this.BLUE,
                    LV: this.GREEN
                }
                for (const colorName in colorMap) {
                    if (!Object.hasOwn(colorMap, colorName)) continue;
                    const colorNumbers = colorMap[colorName];
                    if (colorNumbers.includes(num7)) {
                        if (colorNumbers.filter(n => this.isOdd(n))) codes.push(`TM_SBB_${colorName}_DAN`);
                        if (colorNumbers.filter(n => this.isEven(n))) codes.push(`TM_SBB_${colorName}_SHUANG`);
                        if (colorNumbers.filter(n => this.isBig(n))) codes.push(`TM_SBB_${colorName}_DA`);
                        if (colorNumbers.filter(n => this.isSmall(n))) codes.push(`TM_SBB_${colorName}_XIAO`);
                        if (colorNumbers.filter(n => this.isBig(n) && this.isOdd(n))) codes.push(`TM_SBB_${colorName}_DA_DAN`);
                        if (colorNumbers.filter(n => this.isBig(n) && this.isEven(n))) codes.push(`TM_SBB_${colorName}_DA_SHUANG`);
                        if (colorNumbers.filter(n => this.isSmall(n) && this.isOdd(n))) codes.push(`TM_SBB_${colorName}_XIAO_DAN`);
                        if (colorNumbers.filter(n => this.isSmall(n) && this.isEven(n))) codes.push(`TM_SBB_${colorName}_XIAO_SHUANG`);
                    }
                }
            }

            // 特码-特肖头尾数 TM_TXTWS
            const TM_TXTWS = this.addRulePrefix('TM_TXTWS');
            for (const key in TM_TXTWS) {
                if (!Object.hasOwn(TM_TXTWS, key)) continue;
                const nums = TM_TXTWS[key];
                if (nums.includes(num7)) codes.push(key);
            }
            // 头 (tens digit)
            for (let i = 0; i <= 4; i++) {
                const code = `TM_TXTWS_${i}TOU`;
                const nums = this.numbers.filter(n => Math.floor(n / 10) === i);
                if (nums.includes(num7)) codes.push(code);
            }
            // 尾 (last digit)
            for (let i = 0; i <= 9; i++) {
                const code = `TM_TXTWS_${i}WEI`;
                const nums = this.numbers.filter(n => n % 10 === i);
                if (nums.includes(num7)) codes.push(code);
            }

            // 特码-合肖 TM_HX
            const TM_HX = this.addRulePrefix('TM_HX');
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
                        codes.push(group.item_code);
                    }
                }
            }

            // 特码-五行 TM_WX
            if (num7 != 49) {
                if (this.TM_WX_JIN.includes(num7)) codes.push('TM_WX_JIN');
                if (this.TM_WX_MU.includes(num7)) codes.push('TM_WX_MU');
                if (this.TM_WX_SHUI.includes(num7)) codes.push('TM_WX_SHUI');
                if (this.TM_WX_HUO.includes(num7)) codes.push('TM_WX_HUO');
                if (this.TM_WX_TU.includes(num7)) codes.push('TM_WX_TU');
            }

            return codes;
        } catch (error) {
            console.log('TM_ITEM_CODES', error);
            return [];
        }
    }

    ZM_ITEM_CODES = (zmNums) => {
        try {
            const codes = []

            // 正码-任选一 ZM_RX1
            for (let i = 1; i <= 6; i++) {
                const code = `ZM_RX1_${zmNums[i-1]}`;
                if (this.numbers.includes(zmNums[i - 1])) {
                    codes.push(code);
                }
            }

            // 正码1-6 ZM_ZM16
            const DAN = this.numbers.filter(n => this.isOdd(n));
            const SHUANG = this.numbers.filter(n => this.isEven(n));
            const DA = this.numbers.filter(n => this.isBig(n));
            const XIAO = this.numbers.filter(n => this.isSmall(n));
            const HEDAN = this.numbers.filter(n => this.sumDigits(n) % 2 === 1);
            const HESHUANG = this.numbers.filter(n => this.sumDigits(n) % 2 === 0);
            const HEDA = this.numbers.filter(n => this.sumDigits(n) >= 7);
            const HEXIAO = this.numbers.filter(n => this.sumDigits(n) <= 6);
            const WEIDA = this.numbers.filter(n => n % 10 >= 5);
            const WEIXIAO = this.numbers.filter(n => n % 10 <= 4);

            for (let i = 1; i <= 6; i++) {
                const num = zmNums[i - 1];
                if (DAN.includes(num)) codes.push(`ZM_ZM16_${i}_DAN`);
                if (SHUANG.includes(num)) codes.push(`ZM_ZM16_${i}_SHUANG`);
                if (DA.includes(num)) codes.push(`ZM_ZM16_${i}_DA`);
                if (XIAO.includes(num)) codes.push(`ZM_ZM16_${i}_XIAO`);
                if (HEDAN.includes(num)) codes.push(`ZM_ZM16_${i}_HEDAN`);
                if (HESHUANG.includes(num)) codes.push(`ZM_ZM16_${i}_HESHUANG`);
                if (HEDA.includes(num)) codes.push(`ZM_ZM16_${i}_HEDA`);
                if (HEXIAO.includes(num)) codes.push(`ZM_ZM16_${i}_HEXIAO`);
                if (WEIDA.includes(num)) codes.push(`ZM_ZM16_${i}_WEIDA`);
                if (WEIXIAO.includes(num)) codes.push(`ZM_ZM16_${i}_WEIXIAO`);
                if (this.RED.includes(num)) codes.push(`ZM_ZM16_${i}_HONG`);
                if (this.BLUE.includes(num)) codes.push(`ZM_ZM16_${i}_LAN`);
                if (this.GREEN.includes(num)) codes.push(`ZM_ZM16_${i}_LV`);
            }

            // 正肖七色波 ZM_ZXQSB
            const uniqueNums = [...new Set(zmNums)];
            const ZM_ZXQSB = this.addRulePrefix('ZM_ZXQSB');
            for (let i = 0; i < uniqueNums.length; i++) {
                const num = uniqueNums[i];
                if (this.RED.includes(num)) codes.push(`ZM_ZXQSB_HONG`);
                if (this.BLUE.includes(num)) codes.push(`ZM_ZXQSB_LAN`);
                if (this.GREEN.includes(num)) codes.push(`ZM_ZXQSB_LV`);

                for (const key in ZM_ZXQSB) {
                    if (!Object.hasOwn(ZM_ZXQSB, key)) continue;
                    const codeNums = ZM_ZXQSB[key];
                    if (codeNums.includes(num)) {
                        codes.push(key);
                        break;
                    }
                }
            }

            return codes;

        } catch (error) {
            console.log('ZM_ITEM_CODES', error);
            return [];
        }
    }

    ZMT_ITEM_CODES = (zmNums) => {
        try {
            const codes = [];

            for (let i = 1; i <= 6; i++) {
                for (let j = 0; j < zmNums.length; j++) {
                    const num = zmNums[j];
                    if (this.numbers.includes(num)) {
                        codes.push(`ZMT_Z${i}T_${num}`);
                    }
                }
            } 

            return codes;
        } catch (error) {
            console.log('ZMT_ITEM_CODES', error);
            return [];
        }
    }

    LXLW_ITEM_CODES = async (allNums) => {
        try {
            const codes = [];

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
                        const LXLW_LX = this.addRulePrefix(`LXLW_${i}LX`);
                        for (const code of item_code) {
                            if (Object.hasOwn(LXLW_LX, code)) {
                                const nums = LXLW_LX[code];
                                mergedLXNums.push(...nums);
                            }
                        }
                        if (allNums.some(n => mergedLXNums.includes(n))) {
                            codes.push(group.item_code);
                            break;
                        }
                        const lwObj = {};
                        for (let j = 0; j <= 9; j++) {
                            lwObj[`LXLW_${i}LW_${j}`] = this.numbers.filter(n => n % 10 === j);
                            if (allNums.some(n => lwObj[`LXLW_${i}LW_${j}`].includes(n))) {
                                codes.push(group.item_code);
                                break;
                            }
                        }
                    }
                }
            }

            return codes;
        } catch (error) {
            console.log('LXLW_ITEM_CODES', error);
            return [];
        }
    }

    LM_ITEM_CODES = async (allNums, num7) => {
        try {
            const codes = [];

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
                    if (match4 === 4) codes.push(group.item_code);
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
                    if (match3 === 3) codes.push(group.item_code);
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
                    if (match2 === 2) codes.push(group.item_code);
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
                    if (match2 === 2) codes.push(group.item_code);
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

                    if (isWin) codes.push(group.item_code);
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

                    if (hitNormal) codes.push(group.item_code);
                }
            }

            return codes;
        } catch (error) {
            console.log('LM_ITEM_CODES', error);
            return []; 
        }
    }

    YXZXPTWS_ITEM_CODES = (allNums) => {
        try {
            const codes = [];

            // 一肖总肖平特尾数 YXZXPTWS 一肖
            const YXZXPTWS_YX = this.addRulePrefix('YXZXPTWS_YX');
            for (const key in YXZXPTWS_YX) {
                if (!Object.hasOwn(YXZXPTWS_YX, key)) continue;
                const nums = YXZXPTWS_YX[key];
                if (allNums.some(n => nums.includes(n))) {
                    codes.push(key);
                }
            }

            // 一肖总肖平特尾数 YXZXPTWS 总肖
            let count = 0;
            for (const key in this.orderedZodiac) {
                if (!Object.hasOwn(this.orderedZodiac, key)) continue;
                const numbers = this.orderedZodiac[key];
                if (allNums.some(n => numbers.includes(n))) {
                    count++;
                }
            }
            for (let i = 2; i <= count; i++) {
                const totalZodiacKey = `YXZXPTWS_ZX_${i}LX`;
                codes.push(totalZodiacKey);
            }
            if ([3, 5, 7].includes(count)) {
                codes.push('YXZXPTWS_ZX_ZX_DAN');
            } else if ([2, 4, 6].includes(count)) {
                codes.push('YXZXPTWS_ZX_ZX_SHUANG');
            }

            // 一肖总肖平特尾数 YXZXPTWS 平特尾数
            const tails = new Set(allNums.map(n => n % 10));
            for (const tail of tails) {
                codes.push(`YXZXPTWS_WS_${tail}`); // e.g. YXZXPTWS_WS_0, YXZXPTWS_WS_1, ..., YXZXPTWS_WS_9
            }

            return codes;
        } catch (error) {
            console.log('YXZXPTWS_ITEM_CODES', error);
            return [];
        }
    }

    ZH_ITEM_CODES = (allNums) => {
        try {
            const codes = [];

            // 总和 ZH 
            // 总和大小：7个开奖号码之和≥176为“总和大”，≤174为“总和小”，等于175时为和，退还本金。
            const sum = allNums.reduce((acc, n) => acc + n, 0);
            if (sum >= 176) codes.push('ZH_DA');
            if (sum <= 174) codes.push('ZH_XIAO');
            if (sum === 175) codes.push('ZH_HE');
            // 总和大小不含和：7个开奖号码之和≥175为“大”，≤174为“小”，无和值。
            if (sum >= 175) codes.push('ZH_DA_WH');
            if (sum <= 174) codes.push('ZH_XIAO_WH');
            // 总和单双：7个开奖号码之和的个位数1、3、5、7、9为“总和单”，0、2、4、6、8为“总和双”。
            if (sum != 175) {
                const tail = sum % 10;
                if ([1, 3, 5, 7, 9].includes(tail)) codes.push('ZH_DAN');
                else codes.push('ZH_SHUANG');
            } else {
                // sum === 175：和（无和玩法一般不出单/双结果）
                codes.push('ZH_DAN_WH');
                codes.push('ZH_SHUANG_WH');
            }

            return codes;
        } catch (error) {
            console.log('ZH_ITEM_CODES', error);
            return [];
        }
    }

    ZXBZ_ITEM_CODES = async (allNums) => {
        try {
            const codes = [];

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
                    if (!hitAny) codes.push(group.item_code);
                }
            }

            return codes;
        } catch (error) {
            console.log('ZXBZ_ITEM_CODES', error);
            return [];
        }
    }
}

module.exports = BetRuleHelper;
