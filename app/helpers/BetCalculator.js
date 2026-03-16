const { errLogger } = require("./Logger");
const BetRuleHelper = require("./BetRuleHelper");
const { Bet, db } = require("../models");

class BetCalculator {
    constructor () {
        this.betRuleHelper = new BetRuleHelper();
    }

    CALCULATE_CATEGORY_1 = async (record) => {
        try {
            const num7 = record.num7;
            const isTie = (n) => Number(n) === 49;
            
            const winRecords = [];
            const tieRecords = [];

            const bets = await Bet.findAll({
                where: { is_calculated: false, category_id: 1 },
            });
            for (const bet of bets) {
                // 特码-双面 TM_SM
                const TM_SM_RULES = {
                    TM_SM_DA: (n) => this.betRuleHelper.isBig(n) && n != 49,
                    TM_SM_XIAO: (n) => this.betRuleHelper.isSmall(n) && n != 49,
                    TM_SM_DAN: (n) => this.betRuleHelper.isOdd(n) && n != 49,
                    TM_SM_SHUANG: (n) => this.betRuleHelper.isEven(n) && n != 49,

                    TM_SM_HEDA: (n) => this.betRuleHelper.TM_SM_HEDA().includes(n) && n != 49,
                    TM_SM_HEXIAO: (n) => this.betRuleHelper.TM_SM_HEXIAO().includes(n) && n != 49,
                    TM_SM_HEDAN: (n) => this.betRuleHelper.TM_SM_HEDAN().includes(n) && n != 49,
                    TM_SM_HESHUANG: (n) => this.betRuleHelper.TM_SM_HESHUANG().includes(n) && n != 49,

                    TM_SM_WEIDA: (n) => this.betRuleHelper.TM_SM_WEIDA().includes(n) && n != 49,
                    TM_SM_WEIXIAO: (n) => this.betRuleHelper.TM_SM_WEIXIAO().includes(n) && n != 49,

                    TM_SM_TIANXIAO: (n) => this.betRuleHelper.TM_SM_TIANXIAO().includes(n) && n != 49,
                    TM_SM_DIXIAO: (n) => this.betRuleHelper.TM_SM_DIXIAO().includes(n) && n != 49,
                    TM_SM_QIANXIAO: (n) => this.betRuleHelper.TM_SM_QIANXIAO().includes(n) && n != 49,
                    TM_SM_HOUXIAO: (n) => this.betRuleHelper.TM_SM_HOUXIAO().includes(n) && n != 49,
                    TM_SM_JIAXIAO: (n) => this.betRuleHelper.TM_SM_JIAXIAO().includes(n) && n != 49,
                    TM_SM_YEXIAO: (n) => this.betRuleHelper.TM_SM_YEXIAO().includes(n) && n != 49,

                    TM_SM_DADAN: (n) => this.betRuleHelper.TM_SM_DADAN().includes(n),
                    TM_SM_DASHUANG: (n) => this.betRuleHelper.TM_SM_DASHUANG().includes(n),
                    TM_SM_XIAODAN: (n) => this.betRuleHelper.TM_SM_XIAODAN().includes(n),
                    TM_SM_XIAOSHUANG: (n) => this.betRuleHelper.TM_SM_XIAOSHUANG().includes(n),
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
                    DAN: (n) => this.betRuleHelper.isOdd(n),
                    SHUANG: (n) => this.betRuleHelper.isEven(n),
                    DA: (n) => this.betRuleHelper.isBig(n),
                    XIAO: (n) => this.betRuleHelper.isSmall(n),
                    DA_DAN: (n) => this.betRuleHelper.isBig(n) && this.betRuleHelper.isOdd(n),
                    DA_SHUANG: (n) => this.betRuleHelper.isBig(n) && this.betRuleHelper.isEven(n),
                    XIAO_DAN: (n) => this.betRuleHelper.isSmall(n) && this.betRuleHelper.isOdd(n),
                    XIAO_SHUANG: (n) => this.betRuleHelper.isSmall(n) && this.betRuleHelper.isEven(n),
                }
                const COLORS = {
                    HONG: this.betRuleHelper.RED,
                    LAN: this.betRuleHelper.BLUE,
                    LV: this.betRuleHelper.GREEN,
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
                const TM_TXTWS = this.betRuleHelper.addRulePrefix('TM_TXTWS');
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
                const TM_HX = this.betRuleHelper.addRulePrefix('TM_HX');
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
                        TM_WX_JIN: this.betRuleHelper.TM_WX_JIN,
                        TM_WX_MU: this.betRuleHelper.TM_WX_MU,
                        TM_WX_SHUI: this.betRuleHelper.TM_WX_SHUI,
                        TM_WX_HUO: this.betRuleHelper.TM_WX_HUO,
                        TM_WX_TU: this.betRuleHelper.TM_WX_TU,
                    }

                    if (WX_MAP[bet.item_code]?.includes(num7)) {
                        winRecords.push(bet);
                    }
                }
            }

            const t = await db.transaction();
            try {
                for (const bet of winRecords) {
                    const winAmount = bet.bet_amount * bet.odds;
                    await bet.update({ record_id: record.id, is_calculated: true, is_win: 2, win_amount: winAmount }, { transaction: t });   
                }
                for (const bet of tieRecords) {
                    await bet.update({ record_id: record.id, is_calculated: true, is_win: 3, win_amount: 0 }, { transaction: t });
                }

                await Bet.update(
                    { is_calculated: true, is_win: 1, win_amount: 0 },
                    { where: { is_calculated: false, category_id: 1, batch_number: record.batch_number }, transaction: t }
                );
                await t.commit();
            } catch (error) {
                await t.rollback();
                console.log('BetCalculator CALCULATE_CATEGORY_1 winRecords error:', error);
            }
        } catch (error) {
            console.log('BetCalculator CALCULATE_CATEGORY_1 error:', error);
        }
    }

    CALCULATE_CATEGORY_2 = async (record) => {
        
    }

    RUN = async (record) => {
        try {
            const bets = await Bet.findAll({
                where: { is_calculated: false, batch_number: record.batch_number },
                attributes: ['category_id'],
                group: ['category_id']
            });

            for (const bet of bets) {
                this[`CALCULATE_CATEGORY_${bet.category_id}`] && await this[`CALCULATE_CATEGORY_${bet.category_id}`](record);
            }
        } catch (error) {
            console.log('BetCalculator RUN error:', error);
        }
    }
}

module.exports = BetCalculator;