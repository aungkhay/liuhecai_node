class BetRuleHelper {
    constructor(params) {
        this.numbers = Array.from({ length: 49 }, (_, i) => i + 1);
        this.isBig = (num) => num >= 25;
        this.isSmall = (num) => num <= 24;
        this.isOdd = (num) => num % 2 === 1;
        this.isEven = (num) => num % 2 === 0;
        this.sumDigits = (n) => n.toString().split('').reduce((a, b) => a + Number(b), 0);
        this.orderedZodiac = params.orderedZodiacs;
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
}

module.exports = BetRuleHelper;
