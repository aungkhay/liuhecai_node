const { check } = require('express-validator');

exports.create_record = () => {
    return [
        check('year').not().isEmpty().withMessage('年份不能为空'),
        // batch number format: 26001, where 26 -> year, 001 -> batch number
        check('batch_number').not().isEmpty().withMessage('期数不能为空')
            .bail()
            .matches(/^\d{5}$/).withMessage('期数格式不正确'),
        check('lottery_type').not().isEmpty().withMessage('彩票类型不能为空')
            .bail()
            .isIn(['platform', 'aomen', 'hongkong']).withMessage('彩票类型值不正确'),
        check('num1').not().isEmpty().withMessage('号码1不能为空'),
        check('num1_desc').not().isEmpty().withMessage('号码1描述不能为空'),
        check('num2').not().isEmpty().withMessage('号码2不能为空'),
        check('num2_desc').not().isEmpty().withMessage('号码2描述不能为空'),
        check('num3').not().isEmpty().withMessage('号码3不能为空'),
        check('num3_desc').not().isEmpty().withMessage('号码3描述不能为空'),
        check('num4').not().isEmpty().withMessage('号码4不能为空'),
        check('num4_desc').not().isEmpty().withMessage('号码4描述不能为空'),
        check('num5').not().isEmpty().withMessage('号码5不能为空'),
        check('num5_desc').not().isEmpty().withMessage('号码5描述不能为空'),
        check('num6').not().isEmpty().withMessage('号码6不能为空'),
        check('num6_desc').not().isEmpty().withMessage('号码6描述不能为空'),
        check('num7').not().isEmpty().withMessage('号码7不能为空'),
        check('num7_desc').not().isEmpty().withMessage('号码7描述不能为空'),
        check('draw_date').not().isEmpty().withMessage('开奖日期不能为空')
    ]
}

exports.create_result_guess = () => {
    return [
        check('batch_number').not().isEmpty().withMessage('期号不能为空'),
        check('zodiac_attr').not().isEmpty().withMessage('生肖属性不能为空'),
    ]
}

exports.update_qi_xiaos = () => {
    return [
        check('type').not().isEmpty().withMessage('配置类型不能为空')
            .bail()
            .isIn(['qi_xiao']).withMessage('配置类型值不正确'),
        check('xiaos')
            .isArray({ min: 7, max: 7 })
            .withMessage('生肖数组不能为空'),
        check('numbers')
            .isArray({ min: 7, max: 7 })
            .withMessage('号码数组不能为空'),
    ]
}

exports.update_wu_xiaos = () => {
    return [
        check('type').not().isEmpty().withMessage('配置类型不能为空')
            .bail()
            .isIn(['wu_xiao']).withMessage('配置类型值不正确'),
        check('xiaos')  
            .isArray({ min: 5, max: 5 })
            .withMessage('生肖数组不能为空'),
        check('numbers')
            .isArray({ min: 5, max: 5 })
            .withMessage('号码数组不能为空'),
    ]
}

exports.update_san_xiaos = () => {
    return [
        check('type').not().isEmpty().withMessage('配置类型不能为空')
            .bail()
            .isIn(['san_xiao']).withMessage('配置类型值不正确'),
        check('xiaos')
            .isArray({ min: 3, max: 3 })
            .withMessage('生肖数组不能为空'),
        check('numbers')
            .isArray({ min: 3, max: 3 })
            .withMessage('号码数组不能为空'),
    ]
}

exports.create_touzi_pingte = () => {
    return [
        check('year').not().isEmpty().withMessage('年份不能为空'),
        check('batch_start').not().isEmpty().withMessage('投注范围开始不能为空'),
        check('batch_end').not().isEmpty().withMessage('投注范围结束不能为空'),
        check('zodiac_name').not().isEmpty().withMessage('生肖名称不能为空'),
    ]
}

exports.create_double_color = () => {
    return [
        check('batch_number').not().isEmpty().withMessage('期数不能为空'),
        check('color_one').not().isEmpty().withMessage('颜色一不能为空'),
        check('color_two').not().isEmpty().withMessage('颜色二不能为空'),
    ]
}

exports.do_bet = () => {
    return [
        check('bets').isArray({ min: 1 }).withMessage('投注项不能为空'),
        check('bets.*.category_id').not().isEmpty().withMessage('投注类别ID不能为空'),
        check('bets.*.sub_category_id').not().isEmpty().withMessage('投注子类别ID不能为空'),
        check('bets.*.item_code').not().isEmpty().withMessage('投注项代码不能为空'),
        check('bets.*.item_name').not().isEmpty().withMessage('投注项名称不能为空'),
        check('bets.*.odds').not().isEmpty().withMessage('投注项赔率不能为空'),
        check('bets.*.bet_amount').not().isEmpty().withMessage('投注金额不能为空'),
    ]
}

exports.create_reference_link = () => {
    return [
        check('url').not().isEmpty().withMessage('链接URL不能为空')
    ]
}

exports.check_number_in_bets = () => {
    return [
        check('num1').not().isEmpty().withMessage('正码1不能为空'),
        check('num2').not().isEmpty().withMessage('正码2不能为空'),
        check('num3').not().isEmpty().withMessage('正码3不能为空'),
        check('num4').not().isEmpty().withMessage('正码4不能为空'),
        check('num5').not().isEmpty().withMessage('正码5不能为空'),
        check('num6').not().isEmpty().withMessage('正码6不能为空'),
        check('num7').not().isEmpty().withMessage('特码不能为空'),
        check('batch_number').not().isEmpty().withMessage('期号不能为空')
    ]
}