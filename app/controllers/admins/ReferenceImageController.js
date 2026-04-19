const MyResponse = require('../../helpers/MyResponse');
const { ReferenceImage } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
let { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class Controller {
    constructor(app) {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.adminLogger = this.commonHelper.adminLogger;
        this.getOffset = this.commonHelper.getOffset;
    }

    INDEX = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const offset = this.getOffset(page, perPage);

            const { count, rows } = await ReferenceImage.findAndCountAll({
                order: [['createdAt', 'DESC']],
                limit: perPage,
                offset: offset
            });

            const data = {
                records: rows,
                meta: { 
                    page: page,
                    perPage: perPage,
                    totalPage: count > 0 ? Math.ceil(count / perPage) : count,
                    total: count
                }
            }

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', data);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    UPLOAD = async (req, res) => {
        try {
            req.uploadDir = `./uploads/reference-images`;

            const upload = require('../../middlewares/UploadImage');
            upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code == 'LIMIT_FILE_SIZE') {
                        return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '文件过大', { allow_size: '5MB' });
                    }
                    if (err.code == 'ENOENT') {
                        return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, 'ENOENT', {});
                    }
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, err.message, {});
                } else if (err) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '上传失败', {});
                }

                if (req.file == null) {
                    return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '请选图片', {});
                }

                const fileName = req.file.filename;

                return MyResponse(res, this.ResCode.SUCCESS.code, true, '上传成功', { file_url: `/uploads/reference-images/${fileName}` });
            })
        } catch (error) {
            errLogger(`[ReferenceImage][UPLOAD]: ${error.stack}`);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CREATE = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            await ReferenceImage.create({
                name: req.body.name,
                image_url: req.body.image_url
            });

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '创建成功', {});
        } catch (error) {
            errLogger(`[ReferenceImage][CREATE]: ${error.stack}`);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {}); 
        }
    }

    UPDATE = async (req, res) => {
        try {
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            const referenceImage = await ReferenceImage.findByPk(req.params.id);
            if (!referenceImage) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '未找到信息', {});
            }

            const { image_url } = req.body;

            if(referenceImage.image_url != image_url) {
                const filePath = path.resolve(__dirname, `../../..${referenceImage.image_url}`);
                try {
                    fs.accessSync(filePath);
                    fs.unlinkSync(filePath, () => {
                        return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '删除失败！', {});
                    })
                } catch (err) {
                    console.log("DOES NOT exist:", filePath);
                }
            }

            await referenceImage.update(req.body);

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', {});
        } catch (error) {
            errLogger(`[ReferenceImage][UPDATE]: ${error.stack}`);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const referenceImage = await ReferenceImage.findByPk(req.params.id);
            if (!referenceImage) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '未找到信息', {});
            }

            if(referenceImage.image_url != null) {
                const filePath = path.resolve(__dirname, `../../..${referenceImage.image_url}`);
                try {
                    fs.accessSync(filePath);
                    fs.unlinkSync(filePath, () => {
                        return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '删除失败！', {});
                    })
                } catch (err) {
                    console.log("DOES NOT exist:", filePath);
                }
            }

            await referenceImage.destroy();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (error) {
            errLogger(`[ReferenceImage][DELETE]: ${error.stack}`);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;