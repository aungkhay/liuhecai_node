const { Bet, BetSubCategory } = require("../models");
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

    CATEGORY_WIN_1 = async (allNums) => {
        try {
            const num7 = allNums[6];
            const isTie = (n) => Number(n) === 49;
            
            const winRecords = [];
            const tieRecords = [];

            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 1 },
            });
            for (const bet of bets) {
                // 特码-双面 TM_SM
                const TM_SM_RULES = {
                    TM_SM_DA: (n) => this.isBig(n) && n != 49,
                    TM_SM_XIAO: (n) => this.isSmall(n) && n != 49,
                    TM_SM_DAN: (n) => this.isOdd(n) && n != 49,
                    TM_SM_SHUANG: (n) => this.isEven(n) && n != 49,

                    TM_SM_HEDA: (n) => this.TM_SM_HEDA().includes(n) && n != 49,
                    TM_SM_HEXIAO: (n) => this.TM_SM_HEXIAO().includes(n) && n != 49,
                    TM_SM_HEDAN: (n) => this.TM_SM_HEDAN().includes(n) && n != 49,
                    TM_SM_HESHUANG: (n) => this.TM_SM_HESHUANG().includes(n) && n != 49,

                    TM_SM_WEIDA: (n) => this.TM_SM_WEIDA().includes(n) && n != 49,
                    TM_SM_WEIXIAO: (n) => this.TM_SM_WEIXIAO().includes(n) && n != 49,

                    TM_SM_TIANXIAO: (n) => this.TM_SM_TIANXIAO().includes(n) && n != 49,
                    TM_SM_DIXIAO: (n) => this.TM_SM_DIXIAO().includes(n) && n != 49,
                    TM_SM_QIANXIAO: (n) => this.TM_SM_QIANXIAO().includes(n) && n != 49,
                    TM_SM_HOUXIAO: (n) => this.TM_SM_HOUXIAO().includes(n) && n != 49,
                    TM_SM_JIAXIAO: (n) => this.TM_SM_JIAXIAO().includes(n) && n != 49,
                    TM_SM_YEXIAO: (n) => this.TM_SM_YEXIAO().includes(n) && n != 49,

                    TM_SM_DADAN: (n) => this.TM_SM_DADAN().includes(n),
                    TM_SM_DASHUANG: (n) => this.TM_SM_DASHUANG().includes(n),
                    TM_SM_XIAODAN: (n) => this.TM_SM_XIAODAN().includes(n),
                    TM_SM_XIAOSHUANG: (n) => this.TM_SM_XIAOSHUANG().includes(n),
                }
                if (TM_SM_RULES[bet.item_code] && TM_SM_RULES[bet.item_code](num7)) {
                    winRecords.push(bet);
                }
                if (bet.item_code === `TM_SM_49` && isTie(num7)) {
                    tieRecords.push(bet);
                }

                // 特码-号码 TM_HM
                if (bet.item_code === `TM_HM_${num7}`) {
                    winRecords.push(bet);
                }
                // 特码-色波半波 TM_SBB
                const TM_SBB_RULES = {
                    DAN: (n) => this.isOdd(n),
                    SHUANG: (n) => this.isEven(n),
                    DA: (n) => this.isBig(n),
                    XIAO: (n) => this.isSmall(n),
                    DA_DAN: (n) => this.isBig(n) && this.isOdd(n),
                    DA_SHUANG: (n) => this.isBig(n) && this.isEven(n),
                    XIAO_DAN: (n) => this.isSmall(n) && this.isOdd(n),
                    XIAO_SHUANG: (n) => this.isSmall(n) && this.isEven(n),
                }
                const COLORS = {
                    HONG: this.RED,
                    LAN: this.BLUE,
                    LV: this.GREEN,
                }
                for (const [colorCode, colorNums] of Object.entries(COLORS)) {
                    if (!colorNums.includes(num7)) continue;
                    // TM_SBB_HONG / TM_SBB_LAN / TM_SBB_LV
                    if (bet.item_code === `TM_SBB_${colorCode}`) {
                        winRecords.push(bet);
                        break;
                    }
                    // 49 不参与半波组合（与你原逻辑一致）
                    if (num7 === 49) {
                        tieRecords.push(bet);
                        break;
                    }
                    for (const [suffix, fn] of Object.entries(TM_SBB_RULES)) {
                        if (bet.item_code === `TM_SBB_${colorCode}_${suffix}` && fn(num7)) {
                            winRecords.push(bet);
                            break;
                        }
                    }
                    break; // 命中一种颜色后无需再检查其他颜色
                }

                // 特码-特肖头尾数 TM_TXTWS
                const TM_TXTWS = this.addRulePrefix('TM_TXTWS');
                for (const [code, nums] of Object.entries(TM_TXTWS)) {
                    if (bet.item_code === code && nums.includes(num7)) {
                        winRecords.push(bet);
                        break;
                    }
                }
                // 头 (tens digit)
                const tou = Math.floor(num7 / 10);
                if (tou >= 0 && tou <= 4 && bet.item_code === `TM_TXTWS_${tou}TOU`) {
                    winRecords.push(bet);
                }
                // 尾：0-9（个位数）
                const wei = num7 % 10;
                if (bet.item_code === `TM_TXTWS_${wei}WEI`) {
                    winRecords.push(bet);
                }

                // 特码-合肖 TM_HX
                const TM_HX = this.addRulePrefix('TM_HX');
                const hxCodes = bet.item_code.split(',').map(code => code.trim());
                for (const code of hxCodes) {
                    if (TM_HX[code] && TM_HX[code].includes(num7)) {
                        if (isTie(num7)) {
                            tieRecords.push(bet);
                        } else {
                            winRecords.push(bet);
                        }
                        break;
                    }
                }

                // 特码-五行 TM_WX
                if (isTie(num7)) {
                    tieRecords.push(bet);
                } else {
                    const WX_MAP = {
                        TM_WX_JIN: this.TM_WX_JIN,
                        TM_WX_MU: this.TM_WX_MU,
                        TM_WX_SHUI: this.TM_WX_SHUI,
                        TM_WX_HUO: this.TM_WX_HUO,
                        TM_WX_TU: this.TM_WX_TU,
                    }

                    if (WX_MAP[bet.item_code]?.includes(num7)) {
                        winRecords.push(bet);
                    }
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                totalWinAmount += bet.bet_amount * bet.odds;
            }
            for (const bet of tieRecords) {
                totalWinAmount += bet.bet_amount; // 和局退还本金
            }

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_1', error);
            return 0;
        }
    }

    CATEGORY_WIN_2 = async (allNums) => {
        try {
            const zmNums = allNums.slice(0, 6);
            const num7 = allNums[6];

            const winRecords = [];
            const tieRecords = [];

            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 2 },
            });

            for (const bet of bets) {

                // 正码-任选一 ZM_RX1
                if (bet.item_code.startsWith('ZM_RX1_')) {
                    const num = parseInt(bet.item_code.replace('ZM_RX1_', ''));
                    if (zmNums.includes(num)) {
                        winRecords.push(bet);
                    }
                }

                // 正码1-6 ZM_ZM16 (例如：ZM_ZM16_1_DAN 表示正码1单，ZM_ZM16_2_DAN 表示正码2单，以此类推)
                if (bet.item_code.startsWith('ZM_ZM16_')) {
                    const m = bet.item_code.match(/^ZM_ZM16_(\d)_(.+)$/);
                    if (m) {
                        const idx = Number(m[1]) - 1;     // 0-5
                        const cond = m[2];                // DA/XIAO/DAN/SHUANG/HEDA/...
                        const num = zmNums[idx];

                        // tie: 该正码为49
                        if (num === 49) {
                            tieRecords.push(bet);
                        } else {
                            const tail = num % 10;
                            const sum = this.sumDigits(num);

                            const RULES = {
                                // 大小
                                DA: () => num >= 25,
                                XIAO: () => num <= 24,

                                // 单双（按个位）
                                DAN: () => tail % 2 === 1,
                                SHUANG: () => tail % 2 === 0,

                                // 合数大小（十位+个位）
                                HEDA: () => sum >= 7,
                                HEXIAO: () => sum <= 6,

                                // 合数单双（合数的个位）
                                HEDAN: () => (sum % 10) % 2 === 1,
                                HESHUANG: () => (sum % 10) % 2 === 0,

                                // 尾数大小（个位）
                                WEIDA: () => tail >= 5,
                                WEIXIAO: () => tail <= 4,
                            };
                            if (RULES[cond]?.()) winRecords.push(bet);
                        }
                    }
                }

                // 正肖七色波 ZM_ZXQSB (例如：ZM_ZXQSB_HONG or ZM_ZXQSB_SHU or ZM_ZXQSB_HOU)
                if (bet.item_code.startsWith('ZM_ZXQSB_')) {
                    const code = bet.item_code.replace('ZM_ZXQSB_', ''); // e.g. SHU / HONG / LAN / LV / HE
                    const COLORS = {
                        HONG: this.RED,
                        LAN: this.BLUE,
                        LV: this.GREEN,
                    };

                    const getColor = (n) => {
                        if (COLORS.HONG.includes(n)) return 'HONG';
                        if (COLORS.LAN.includes(n)) return 'LAN';
                        if (COLORS.LV.includes(n)) return 'LV';
                        return null;
                    };

                    if (!COLORS[code] && code !== 'HE') {
                        // ---------- A) 正肖：任意一个正码命中即中奖（只中一次） ----------
                        const ZM_ZXQSB = this.addRulePrefix('ZM_ZXQSB'); // { SHU: [...], HOU: [...], ... }
                        const nums = ZM_ZXQSB[code];
                        if (nums && zmNums.some(n => nums.includes(n))) winRecords.push(bet);

                    } else {
                        // ---------- B) 七色波：红/蓝/绿/和局 ----------
                        const isColorBet = !!COLORS[code]; // HONG/LAN/LV
                        const isTieBet = code === 'HE';    // 可投注和局

                        // 统计正码颜色个数（每个=1分）
                        const zmCount = { HONG: 0, LAN: 0, LV: 0 };
                        for (const n of zmNums) {
                            const c = getColor(n);
                            if (c) zmCount[c] += 1;
                        }

                        // 特码颜色（=1.5分）
                        const tmColor = getColor(num7);

                        const score = { ...zmCount };
                        if (tmColor) score[tmColor] += 1.5;

                        // 和局条件：6正码是两色且3:3，特码为第三色
                        const all = ['HONG', 'LAN', 'LV'];
                        const present = all.filter(c => zmCount[c] > 0);
                        const tie =
                            present.length === 2 &&
                            zmCount[present[0]] === 3 &&
                            zmCount[present[1]] === 3 &&
                            tmColor &&
                            !present.includes(tmColor);

                        if (tie) {
                            if (isColorBet) tieRecords.push(bet); // 红/蓝/绿七色波退本金
                            if (isTieBet) winRecords.push(bet);   // 和局注单中奖
                        } else {
                            const max = Math.max(score.HONG, score.LAN, score.LV); // 找出最高分数
                            const winners = all.filter(c => score[c] === max);

                            // 若出现并列最高：你们若有明确规则请替换；这里先按“退还本金”保守处理
                            if (winners.length !== 1) {
                                if (isColorBet) tieRecords.push(bet);
                            } else {
                                const winColor = winners[0];
                                if (isColorBet && code === winColor) winRecords.push(bet);
                            }
                        }
                    }
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            }
            for (const bet of tieRecords) {
                totalWinAmount += bet.bet_amount; // 和局退还本金
            }

            return totalWinAmount;

        } catch (error) {
            console.log('CATEGORY_WIN_2', error);
            return 0;
        }
    }

    CATEGORY_WIN_3 = async (allNums) => {
        try {
            const zmNums = allNums.slice(0, 6);

            const winRecords = [];
            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 3 },
            });
            for (const bet of bets) {
                for (let i = 1; i <= 6; i++) {
                    const num = zmNums[i - 1];
                    const code = `ZMT_Z${i}T_${num}`;
                    if (bet.item_code === code) {
                        winRecords.push(bet);
                        break;
                    }
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            }

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_3', error);
            return 0;
        }
    }

    CATEGORY_WIN_4 = async (allNums) => {
        try {
            const winRecords = [];
            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 4 },
            });
            for (const bet of bets) {
                
                if (bet.item_code.startsWith('LXLW_') && bet.item_code.includes('LX_')) {
                    const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：LXLW_2LX_SHU,LXLW_2LX_HU

                    for (let i = 2; i <= 5; i++) {
                        const zodiac = this.addRulePrefix(`LXLW_${i}LX`); // { SHU: [...], ... }
                        let matchCount = 0;
                        for (const code of codes) {
                            if (zodiac[code] && allNums.some(n => zodiac[code].includes(n))) {
                                matchCount++;
                            }
                        }
                        if (matchCount === i) {
                            winRecords.push(bet);
                            break;
                        }
                    }
                }

                if (bet.item_code.startsWith('LXLW_') && bet.item_code.includes('LW_')) {
                    const tail = allNums.map(n => n % 10);
                    const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：LXLW_3LW_0,LXLW_3LW_5,LXLW_3LW_9

                    for (let i = 2; i <= 5; i++) {
                        let matchCount = 0;
                        for (let j = 0; j <= 9; j++) {
                            for (const code of codes) {
                                if (code === `LXLW_${i}LW_${j}`) {
                                    if (tail.includes(j)) {
                                        matchCount++;
                                    } 
                                }
                            }
                        }
                        if (matchCount === i) {
                            winRecords.push(bet);
                            break;
                        }
                    }
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            }

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_4', error);
            return 0;
        }
    }

    CATEGORY_WIN_5 = async (allNums) => {
        try {
            const zmNums = allNums.slice(0, 6);
            const num7 = allNums[6];

            const winRecords = [];
            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 5 },
            });

            for (const bet of bets) {

                if (bet.item_code.startsWith('LM_3Z2_')) {
                    // LM_3Z2_8,LM_3Z2_17,LM_3Z2_3
                    const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：LM_3Z2_8,LM_3Z2_17,LM_3Z2_3
                    const nums = codes.map(code => parseInt(code.replace('LM_3Z2_', ''))); // [8, 17, 3]
                    const matchCount = nums.filter(n => allNums.includes(n)).length;
                    const subCate = await BetSubCategory.findByPk(bet.sub_category_id, { attributes: ['odds'] });
                    if (matchCount === 2) {
                        bet.odds = subCate.odds.Z2; // 三中二赔率
                        winRecords.push(bet);
                    } else if (matchCount === 3) {
                        bet.odds = subCate.odds.Z3; // 三中三赔率
                        winRecords.push(bet);
                    }
                }

                for (let i = 2; i <= 4; i++) {
                    if (bet.item_code.startsWith(`LM_${i}QZ_`)) {
                        const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：LM_2QZ_8,LM_2QZ_17
                        const nums = codes.map(code => parseInt(code.replace(`LM_${i}QZ_`, ''))); // [8, 17]
                        const matchCount = nums.filter(n => allNums.includes(n)).length;
                        if (matchCount === i) {
                            winRecords.push(bet);
                        }
                    }
                }

                // 二中特：选择2个号码即组成1注，若2个号码都是开奖号码的正码，则中“中二”，若其中一个是正码，一个是特码，则中“中特”。
                // 举例：开奖号码01,02,03,04,05,06+07，投注「01,02」，即中奖。
                if (bet.item_code.startsWith('LM_2ZT_')) {
                    const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：LM_2ZT_8,LM_2ZT_17
                    const nums = codes.map(code => parseInt(code.replace('LM_2ZT_', ''))); // [8, 17]
                    const matchCount = nums.filter(n => allNums.includes(n)).length;
                    const subCate = await BetSubCategory.findByPk(bet.sub_category_id, { attributes: ['odds'] });

                    if (matchCount === 2) {
                        const inZm = nums.filter(n => zmNums.includes(n)).length;
                        const inTm = nums.includes(num7);
                        if (inZm === 2) {
                            bet.odds = subCate.odds.Z2; // 中二赔率
                            winRecords.push(bet);
                        }  else if (inZm === 1 && inTm === 1) {
                            bet.odds = subCate.odds.ZT; // 二中特赔率
                            winRecords.push(bet);
                        }
                    }
                }

                // 特串：选择2个号码组成1注，其中1个号码与开奖的特码相同，另一个号码与任意一个正码相同，即中奖。
                // 举例：开奖号码01,02,03,04,05,06+07，投注「01,07」，即中奖。
                if (bet.item_code.startsWith('LM_TC_')) {
                    const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：LM_TC_8,LM_TC_17
                    const nums = codes.map(code => parseInt(code.replace('LM_TC_', ''))); // [8, 17]
                    const matchCount = nums.filter(n => allNums.includes(n)).length;
                    const inTm = nums.includes(num7);
                    const inZm = nums.some(n => zmNums.includes(n));
                    if (matchCount === 2 && inTm && inZm) {
                        winRecords.push(bet);
                    }
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            } 

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_5', error);
            return 0;
        }
    }

    CATEGORY_WIN_6 = async (allNums) => {
        try {
            const winRecords = [];

            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 6 },
            });
            for (const bet of bets) {

                // 正特一肖：选择1个生肖组成1注，开奖的7个号码所对应的生肖包含这个生肖（顺序不限），即中奖。不论同生肖的号码出现次数，只中一次奖。
                if (bet.item_code.startsWith('YXZXPTWS_YX_')) {
                    const zodiacs = this.addRulePrefix('YXZXPTWS_YX'); // { SHU: [...], HOU: [...], ... }
                    const nums = zodiacs[bet.item_code];

                    if (nums && allNums.some(n => nums.includes(n))) {
                        winRecords.push(bet);
                    }
                }

                // 正特尾数：选择1个尾数，开奖的7个号码中的尾数包含所选尾数，即中奖。不论相同尾数出现的次数，只中一次奖。
                if (bet.item_code.startsWith('YXZXPTWS_WS_')) {
                    for (let i = 0; i <= 9; i++) {
                        if (bet.item_code === `YXZXPTWS_WS_${i}`) {
                            const tail = allNums.map(n => n % 10);
                            if (tail.includes(i)) {
                                winRecords.push(bet);
                            }
                            break;
                        }
                    }
                }

                // 总肖：选择1个总肖数，开奖的7个号码对应的不同生肖的数量与投注的总肖数相同，即为中奖。
                if (bet.item_code.startsWith('YXZXPTWS_ZX_')) {
                    const zodiacs = this.addRulePrefix('YXZXPTWS_ZX'); // { ZX_1: [...], ZX_2: [...], ... }
                    let matchCount = 0;
                    for (let i = 2; i <= 7; i++) {
                        if (bet.item_code === `YXZXPTWS_ZX_${i}LX`) {
                            for (const [zodiac, nums] of Object.entries(zodiacs)) {
                                if (allNums.some(n => nums.includes(n))) {
                                    matchCount++;
                                }
                            }
                            if (matchCount >= i) {
                                winRecords.push(bet);
                                break;
                            }
                        }
                    }
                }

                // 总肖单双：开奖的7个号码对应的不同生肖的数量3、5、7为“总肖单”，2、4、6为“总肖双”。
                if (bet.item_code.startsWith('YXZXPTWS_ZX_ZX_')) {
                    const zodiacs = this.addRulePrefix('YXZXPTWS_ZX');
                    let matchCount = 0;
                    for (const [zodiac, nums] of Object.entries(zodiacs)) {
                        if (allNums.some(n => nums.includes(n))) {
                            matchCount++;
                        }
                    }
                    if (matchCount % 2 === 0 && bet.item_code === `YXZXPTWS_ZX_ZX_SHUANG`) {
                        winRecords.push(bet);
                        break;
                    }
                    if (matchCount % 2 === 1 && bet.item_code === `YXZXPTWS_ZX_ZX_DAN`) {
                        winRecords.push(bet);
                        break;
                    }
                }
            }
            
            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            }

            return totalWinAmount;

        } catch (error) {
            console.log('CATEGORY_WIN_6', error);
            return 0;
        }
    }

    CATEGORY_WIN_7 = async (allNums) => {
         try {
            const winRecords = [];
            const tieRecords = [];

            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 7 },
            });

            for (const bet of bets) {

                const sum = allNums.reduce((a, b) => a + b, 0);

                // 总和大小：7个开奖号码之和≥176为“总和大”，≤174为“总和小”，等于175时为和，退还本金。
                if (sum >= 176 && bet.item_code === 'ZH_DA') {
                    winRecords.push(bet);
                } else if (sum <= 174 && bet.item_code === 'ZH_XIAO') {
                    winRecords.push(bet);
                } else if (sum === 175) {
                    tieRecords.push(bet);
                }

                // 总和单双：7个开奖号码之和的个位数1、3、5、7、9为“总和单”，0、2、4、6、8为“总和双”。
                const tail = sum % 10;
                if (tail % 2 === 0 && bet.item_code === 'ZH_SHUANG') {
                    winRecords.push(bet);
                } else if (tail % 2 === 1 && bet.item_code === 'ZH_DAN') {
                    winRecords.push(bet);
                }

                // 总和大小不含和：7个开奖号码之和≥175为“大”，≤174为“小”，无和值。
                if (sum >= 175 && bet.item_code === 'ZH_DA_WH') {
                    winRecords.push(bet);
                } else if (sum <= 174 && bet.item_code === 'ZH_XIAO_WH') {
                    winRecords.push(bet);
                }

                // 总和单双不含和：7个开奖号码之和的个位数1、3、5、7、9为“单”，0、2、4、6、8为“双”，无和值。
                if (sum != 175) {
                    if (tail % 2 === 0 && bet.item_code === 'ZH_SHUANG_WH') {
                        winRecords.push(bet);
                    }
                    if (tail % 2 === 1 && bet.item_code === 'ZH_DAN_WH') {
                        winRecords.push(bet);
                    }
                }

            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            } 
            for (const bet of tieRecords) {
                totalWinAmount += bet.bet_amount; // 和局退还本金
            }

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_7', error);
            return 0;
        }
    }

    CATEGORY_WIN_8 = async (allNums) => {
        try {
            // 自选：从49个号码中任选1个号码为一注，如开奖的7个号码中包含选择的号码，即中奖。
            // 举例：开奖号码01,02,03,04,05,06+07，投注「02」，则中奖。
            const winRecords = [];
            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 8 },
            });
            for (const bet of bets) {
                const num = parseInt(bet.item_code.replace('ZX_', '')); // 例如：ZX_8
                if (allNums.includes(num)) {
                    winRecords.push(bet);
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            }

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_8', error);
            return 0;
        }
    }

    CATEGORY_WIN_9 = async (allNums) => {
         try {
            // 从49个号码中任意选择5~12个号码为一注，如开奖的所有正码和特码皆与选择的号码不同，即中奖。
            // 举例：开奖号码01,02,03,04,05,06+07，投注「08,09,10,11,12」，则中奖。
            // 7个开奖号码，一个都不在所选号码内
            const winRecords = [];
            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 9 },
            });
            for (const bet of bets) {
                const codes = bet.item_code.split(',').map(code => code.trim()); // 例如：ZXBZ_8,ZXBZ_9,ZXBZ_10,ZXBZ_11,ZXBZ_12
                const nums = codes.map(code => parseInt(code.replace('ZXBZ_', '')));
                if (!nums.some(n => allNums.includes(n))) {
                    winRecords.push(bet);
                }
            }

            let totalWinAmount = 0;
            for (const bet of winRecords) {
                const winAmount = bet.bet_amount * bet.odds;
                totalWinAmount += winAmount;
            }

            return totalWinAmount;
        } catch (error) {
            console.log('CATEGORY_WIN_9', error);
            return 0;
        }
    }
}

module.exports = BetRuleHelper;
