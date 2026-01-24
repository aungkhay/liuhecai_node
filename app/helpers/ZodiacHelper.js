class Helper {
    constructor() {

    }

    zodiacOrder = (currentId) => {
        const result = [];

        // currentId down to 1
        for (let i = currentId; i >= 1; i--) {
            result.push(i);
        }

        // 12 down to currentId + 1
        for (let i = 12; i > currentId; i--) {
            result.push(i);
        }

        return result;
    }

    zodiac = () => {
        return [
            { id: 1, name: '鼠', key: 'rat' },
            { id: 2, name: '牛', key: 'ox' },
            { id: 3, name: '虎', key: 'tiger' },
            { id: 4, name: '兔', key: 'rabbit' },
            { id: 5, name: '龙', key: 'dragon' },
            { id: 6, name: '蛇', key: 'snake' },
            { id: 7, name: '马', key: 'horse' },
            { id: 8, name: '羊', key: 'goat' },
            { id: 9, name: '猴', key: 'monkey' },
            { id: 10, name: '鸡', key: 'rooster' },
            { id: 11, name: '狗', key: 'dog' },
            { id: 12, name: '猪', key: 'pig' }
        ];
    }

    comparisons = () => {
        return [
            { id: 1, numbers: [1, 13, 25, 37, 49] },
            { id: 2, numbers: [2, 14, 26, 38] },
            { id: 3, numbers: [3, 15, 27, 39] },
            { id: 4, numbers: [4, 16, 28, 40] },
            { id: 5, numbers: [5, 17, 29, 41] },
            { id: 6, numbers: [6, 18, 30, 42] },
            { id: 7, numbers: [7, 19, 31, 43] },
            { id: 8, numbers: [8, 20, 32, 44] },
            { id: 9, numbers: [9, 21, 33, 45] },
            { id: 10, numbers: [10, 22, 34, 46] },
            { id: 11, numbers: [11, 23, 35, 47] },
            { id: 12, numbers: [12, 24, 36, 48] }
        ]
    }

    zodiacNumbers = () => {
        return [
            { id: 1, num: "01", wuxing: "火", color: "red", old_even: "odd" },
            { id: 2, num: "02", wuxing: "火", color: "red", old_even: "even" },
            { id: 3, num: "03", wuxing: "金", color: "blue", old_even: "odd" },
            { id: 4, num: "04", wuxing: "金", color: "blue", old_even: "even" },
            { id: 5, num: "05", wuxing: "土", color: "green", old_even: "odd" },
            { id: 6, num: "06", wuxing: "土", color: "green", old_even: "even" },
            { id: 7, num: "07", wuxing: "木", color: "red", old_even: "odd" },
            { id: 8, num: "08", wuxing: "木", color: "red", old_even: "even" },
            { id: 9, num: "09", wuxing: "火", color: "blue", old_even: "odd" },
            { id: 10, num: "10", wuxing: "火", color: "blue", old_even: "odd" },
            { id: 11, num: "11", wuxing: "金", color: "green", old_even: "even" },
            { id: 12, num: "12", wuxing: "金", color: "red", old_even: "odd" },
            { id: 13, num: "13", wuxing: "水", color: "red", old_even: "even" },
            { id: 14, num: "14", wuxing: "水", color: "blue", old_even: "odd" },
            { id: 15, num: "15", wuxing: "木", color: "blue", old_even: "even" },
            { id: 16, num: "16", wuxing: "木", color: "green", old_even: "odd" },
            { id: 17, num: "17", wuxing: "火", color: "green", old_even: "even" },
            { id: 18, num: "18", wuxing: "火", color: "red", old_even: "odd" },
            { id: 19, num: "19", wuxing: "土", color: "red", old_even: "even" },
            { id: 20, num: "20", wuxing: "土", color: "blue", old_even: "even" },
            { id: 21, num: "21", wuxing: "水", color: "green", old_even: "odd" },
            { id: 22, num: "22", wuxing: "水", color: "green", old_even: "even" },
            { id: 23, num: "23", wuxing: "木", color: "red", old_even: "odd" },
            { id: 24, num: "24", wuxing: "木", color: "red", old_even: "even" },
            { id: 25, num: "25", wuxing: "金", color: "blue", old_even: "odd" },
            { id: 26, num: "26", wuxing: "金", color: "blue", old_even: "even" },
            { id: 27, num: "27", wuxing: "土", color: "green", old_even: "odd" },
            { id: 28, num: "28", wuxing: "土", color: "green", old_even: "even" },
            { id: 29, num: "29", wuxing: "水", color: "red", old_even: "odd" },
            { id: 30, num: "30", wuxing: "水", color: "red", old_even: "odd" },
            { id: 31, num: "31", wuxing: "火", color: "blue", old_even: "even" },
            { id: 32, num: "32", wuxing: "火", color: "green", old_even: "odd" },
            { id: 33, num: "33", wuxing: "金", color: "green", old_even: "even" },
            { id: 34, num: "34", wuxing: "金", color: "red", old_even: "odd" },
            { id: 35, num: "35", wuxing: "土", color: "red", old_even: "even" },
            { id: 36, num: "36", wuxing: "土", color: "blue", old_even: "odd" },
            { id: 37, num: "37", wuxing: "木", color: "blue", old_even: "even" },
            { id: 38, num: "38", wuxing: "木", color: "green", old_even: "odd" },
            { id: 39, num: "39", wuxing: "火", color: "green", old_even: "even" },
            { id: 40, num: "40", wuxing: "火", color: "red", old_even: "even" },
            { id: 41, num: "41", wuxing: "金", color: "blue", old_even: "odd" },
            { id: 42, num: "42", wuxing: "金", color: "blue", old_even: "even" },
            { id: 43, num: "43", wuxing: "水", color: "green", old_even: "odd" },
            { id: 44, num: "44", wuxing: "水", color: "green", old_even: "even" },
            { id: 45, num: "45", wuxing: "木", color: "red", old_even: "odd" },
            { id: 46, num: "46", wuxing: "木", color: "red", old_even: "even" },
            { id: 47, num: "47", wuxing: "火", color: "blue", old_even: "odd" },
            { id: 48, num: "48", wuxing: "火", color: "blue", old_even: "even" },
            { id: 49, num: "49", wuxing: "土", color: "green", old_even: "odd" }
        ];
    }

    zodiacAttributes = () => {
        return {
            "家禽": ["牛","马","羊","鸡","狗","猪"],
            "野兽": ["鼠","虎","兔","龙","蛇","猴"],
            "吉美": ["兔","龙","蛇","马","羊","鸡"],
            "凶丑": ["鼠","牛","虎","猴","狗","猪"],
            "阴肖": ["鼠","龙","蛇","马","狗","猪"],
            "阳肖": ["牛","虎","兔","羊","猴","鸡"],
            "单笔": ["鼠","龙","马","蛇","鸡","猪"],
            "双笔": ["虎","猴","狗","兔","羊","牛"],
            "天肖": ["兔","马","猴","猪","牛","龙"],
            "地肖": ["蛇","羊","鸡","狗","鼠","虎"],
            "白肖": ["鼠","牛","虎","鸡","狗","猪"],
            "黑肖": ["兔","龙","蛇","马","羊","猴"],
            "女肖": ["兔","蛇","羊","鸡","猪"],
            "男肖": ["鼠","牛","虎","龙","马","猴","狗"],
            "琴肖": ["兔","蛇","鸡"],
            "棋肖": ["鼠","牛","狗"],
            "书肖": ["虎","龙","马"],
            "画肖": ["羊","猴","猪"],
            "五福": ["鼠","虎","兔","蛇","猴","龙"],
            "红肖": ["马","兔","鼠","鸡"],
            "蓝肖": ["蛇","虎","猪","猴"],
            "绿肖": ["羊","龙","牛","狗"],
            "文肖": ["鼠","兔","龙","羊","鸡","猪"],
            "武肖": ["牛","虎","蛇","马","猴","狗"],
            "前肖": ["鼠","牛","虎","兔","龙","蛇"],
            "后肖": ["马","羊","猴","鸡","狗","猪"],
            "吴国": ["虎","兔","龙","蛇"],
            "蜀国": ["马","羊","猴","鸡"],
            "魏国": ["鼠","牛","狗","猪"],
            "独肖": ["鼠","牛","虎","兔","马","羊"],
            "合肖": ["龙","蛇","猴","鸡","狗","猪"],
            "春肖": ["兔","虎","龙"],
            "夏肖": ["羊","蛇","马"],
            "秋肖": ["狗","鸡","猴"],
            "冬肖": ["猪","牛","鼠"],
            "肉肖": ["虎","蛇","龙","狗"],
            "菜肖": ["猪","鼠","鸡","猴"],
            "草肖": ["牛","羊","马","兔"],
            "风肖": ["虎","兔","龙"],
            "雨肖": ["蛇","马","羊"],
            "雷肖": ["猴","鸡","狗"],
            "电肖": ["鼠","牛","猪"],
            "笔肖": ["鸡","兔","蛇"],
            "墨肖": ["鼠","牛","狗"],
            "纸肖": ["马","龙","虎"],
            "砚肖": ["羊","猴","猪"],
            "夜肖": ["鼠","牛","虎","鸡","狗","猪"],
            "日肖": ["兔","龙","蛇","马","羊","猴"],
            "左肖": ["鼠","牛","龙","蛇","猴","鸡"],
            "右肖": ["虎","兔","马","羊","狗","猪"],
            "东肖": ["兔","龙","蛇"],
            "南肖": ["马","羊","猴"],
            "西肖": ["鸡","狗","猪"],
            "北肖": ["牛","鼠","虎"],
            "朝肖": ["龙","兔","蛇","马","羊","猴"],
            "夕肖": ["鼠","牛","虎","狗","猪","鸡"],
            "两大君王": ["龙","虎"],
            "两大恶人": ["鼠","猴"],
            "四大美女": ["兔","蛇","羊","鸡"],
            "四大家臣": ["牛","马","猪","狗"],
            "01月": ["鼠","羊","虎","蛇"],
            "02月": ["牛","马","兔","鼠"],
            "03月": ["虎","蛇","龙","牛"],
            "04月": ["兔","龙","蛇","猴"],
            "05月": ["龙","兔","马","兔"],
            "06月": ["蛇","虎","羊","狗"],
            "07月": ["马","牛","猴","猪"],
            "08月": ["羊","鼠","鸡","马"],
            "09月": ["猴","猪","狗","羊"],
            "10月": ["鸡","狗","猪","虎"],
            "11月": ["狗","鸡","鼠","鸡"],
            "12月": ["猪","猴","牛","龙"],
            "胆大": ["牛","虎","马","猴","狗","猪"],
            "胆小": ["鼠","兔","龙","蛇","羊","鸡"],
            "三合1": ["鼠","龙","猴"],
            "三合2": ["牛","蛇","鸡"],
            "三合3": ["虎","马","狗"],
            "三合4": ["兔","羊","猪"],
            "六合1": ["鼠","牛"],
            "六合2": ["龙","鸡"],
            "六合3": ["虎","猪"],
            "六合4": ["蛇","猴"],
            "六合5": ["兔","狗"],
            "六合6": ["马","羊"],
            "有肖": ["龙","蛇","猴","鸡","狗","猪"],
            "无肖": ["鼠","牛","虎","兔","马","羊"],
            "肥肖": ["龙","虎","猴","鼠","牛","猪"],
            "瘦肖": ["狗","兔","蛇","马","羊","鸡"],
            "梅肖": ["兔","鸡","蛇"],
            "兰肖": ["鼠","牛","狗"],
            "竹肖": ["马","龙","虎"],
            "菊肖": ["羊","猴","猪"],
            "大肖": ["牛","虎","马","羊","狗","猪"],
            "小肖": ["鼠","兔","龙","蛇","猴","鸡"],
            "三公天肖": ["鼠","兔","马","鸡"],
            "三公地肖": ["牛","龙","羊","狗"],
            "三公人肖": ["虎","蛇","猴","猪"],
            "有边": ["龙","蛇","猴","鸡","狗","猪"],
            "无边": ["鼠","牛","虎","兔","马","羊"],
            "1号汉奸汪精卫": ["猪","狗","鼠"],
            "2号汉奸陈公博": ["牛","虎","蛇"],
            "3号汉奸周佛海": ["马","兔","羊"],
            "4号汉奸梁鸿志": ["龙","鸡","猴"]
        }
    }
}

module.exports = Helper;