const CommonHelper = require('../../helpers/CommonHelper');
const MyResponse = require('../../helpers/MyResponse');
const { User, Role } = require('../../models');
let { validationResult } = require('express-validator');
const { encrypt } = require('../../helpers/AESHelper');

const PASS_KEY = process.env.PASS_KEY;
const PASS_IV = process.env.PASS_IV;
const PASS_PREFIX = process.env.PASS_PREFIX;
const PASS_SUFFIX = process.env.PASS_SUFFIX;

class Controller {
    constructor() {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.adminLogger = this.commonHelper.adminLogger;
        this.getOffset = this.commonHelper.getOffset;
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.per_page) || 20;
            const offset = this.getOffset(page, perPage);
            const phone = req.query.phone || null;

            const where = {};
            if (phone) {
                where.phone_number = phone;
            }

            const { count, rows } = await User.findAndCountAll({
                where: where,
                include: {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name', 'code'],
                },
                offset: offset,
                limit: perPage,
                order: [['id', 'DESC']]
            });

            const data = {
                users: rows,
                meta: { 
                    page: page,
                    perPage: perPage,
                    totalPage: count > 0 ? Math.ceil(count / perPage) : count,
                    total: count
                }
            }

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});   
        }
    }

    CREATE = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, 'Validate Failed', {}, errors);
            }

            const { name, phone, password, role_ids } = req.body;

            const existingUser = await User.findOne({ where: { phone_number: phone } });
            if (existingUser) {
                const phoneError = { field: 'phone', msg: '手机号已存在' };
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, 'Validate Failed', {}, [phoneError]);
            }
            const encPassword = encrypt(PASS_PREFIX + password + PASS_SUFFIX, PASS_KEY, PASS_IV);
            const newUser = await User.create({ 
                type: 1, // Admin
                name: name, 
                phone_number: phone, 
                password: encPassword 
            });

            if (role_ids && role_ids.length > 0) {
                const roles = await Role.findAll({ where: { id: role_ids } });
                await newUser.setRoles(roles);
            }

            // LOG
            await this.adminLogger(req, 'User', 'create');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '用户创建成功', { user: newUser });
        } catch (error) {
            console.log(error)
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CHANGE_PASSWORD = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, 'Validate Failed', {}, errors);
            }

            const userId = req.params.id;
            const { new_password } = req.body;
            const encPassword = encrypt(PASS_PREFIX + new_password + PASS_SUFFIX, PASS_KEY, PASS_IV);
            const user = await User.findByPk(userId);
            if (!user) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '用户不存在', {});
            }
            user.password = encPassword;
            await user.save();

            // LOG
            await this.adminLogger(req, 'User', 'change_password');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '密码修改成功', {});

        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CHANGE_STATUS = async (req, res) => {
        try {
            const userId = req.params.id;
            if (userId == 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '无法修改超级管理员状态', {});
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '用户不存在', {});
            }
            user.status = user.status === 1 ? 0 : 1;
            await user.save();

            // LOG
            await this.adminLogger(req, 'User', 'change_status');
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '用户状态修改成功', {});
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const userId = req.params.id;
            if (userId == 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '无法删除超级管理员', {});
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '用户不存在', {});
            }
            await user.destroy();

            // LOG
            await this.adminLogger(req, 'User', 'delete');
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '用户删除成功', {});
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    ASSIGN_ROLES = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, 'Validate Failed', {}, errors);
            }

            const userId = req.params.id;
            if (userId == 1) {
                return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '无法修改超级管理员角色', {});
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '用户不存在', {});
            }
            const { roleIds } = req.body;
            const roles = await Role.findAll({ where: { id: roleIds } });
            await user.setRoles(roles);

            // LOG
            await this.adminLogger(req, 'User', 'assign_roles');
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '用户角色分配成功', {});
        } catch (error) {
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;