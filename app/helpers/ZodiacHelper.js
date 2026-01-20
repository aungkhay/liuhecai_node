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
}

module.exports = Helper;