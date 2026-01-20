const { check } = require('express-validator');

exports.create_record = () => {
    return [
        check('year').not().isEmpty().withMessage('年份不能为空'),
        check('batch_number').not().isEmpty().withMessage('期数不能为空'),
        check('lottery_type').not().isEmpty().withMessage('彩票类型不能为空')
            .bail()
            .isIn(['aomen', 'hongkong']).withMessage('彩票类型值不正确'),
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