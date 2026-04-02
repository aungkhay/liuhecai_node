const MyResponse = require('../../helpers/MyResponse');
const { ReferenceLink } = require('../../models');
const CommonHelper = require('../../helpers/CommonHelper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class Controller {
    constructor(app) {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.adminLogger = this.commonHelper.adminLogger;
    }

    INDEX = async (req, res) => {
        try {
            const links = await ReferenceLink.findAll({
                order: [['createdAt', 'DESC']]
            });
            return MyResponse(res, this.ResCode.SUCCESS.code, true, this.ResCode.SUCCESS.msg, links);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    CREATE = async (req, res) => {
        try {
            let { validationResult } = require('express-validator');
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }

            const { url } = req.body;
            const link = await ReferenceLink.create({ url });

            // LOG
            await this.adminLogger(req, 'ReferenceLink', 'create');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '创建成功', link);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    UPLOAD = async (req, res) => {
        try {
            req.uploadDir = `./uploads/reference_links`;
            const linkId = req.params.id;
            const link = await ReferenceLink.findByPk(linkId);
            if (!link) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '链接不存在', {});
            }

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

                if (link.image) {
                    try {
                        const img = link.image.split('/');
                        const filePath = path.resolve(__dirname, `../../../uploads/reference_links/${img[3]}`);

                        fs.accessSync(filePath);
                        fs.unlinkSync(filePath, () => {
                            return MyResponse(res, resCode.BAD_REQUEST, false, '删除旧图片失败', {});
                        })
                    } catch (error) {
                        console.log("DOES NOT exist:");
                    }
                }

                const fileName = req.file.filename;
                await link.update({ image: `/uploads/reference_links/${fileName}` });
                return MyResponse(res, this.ResCode.SUCCESS.code, true, '上传成功', {});
            })
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    UPDATE = async (req, res) => {
        try {
            let { validationResult } = require('express-validator');
            const err = validationResult(req);
            const errors = this.commonHelper.validateForm(err);
            if (!err.isEmpty()) {
                return MyResponse(res, this.ResCode.VALIDATE_FAIL.code, false, this.ResCode.VALIDATE_FAIL.msg, {}, errors);
            }
            const { url } = req.body;
            const link = await ReferenceLink.findByPk(req.params.id);
            if (!link) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '链接不存在', {});
            }
            await link.update({ url });

            // LOG
            await this.adminLogger(req, 'ReferenceLink', 'update');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '更新成功', link);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const link = await ReferenceLink.findByPk(req.params.id);
            if (!link) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '链接不存在', {});
            }
            if (link.image) {
                try {
                    const img = link.image.split('/');
                    const filePath = path.resolve(__dirname, `../../../uploads/reference_links/${img[3]}`);
                    fs.accessSync(filePath);
                    fs.unlinkSync(filePath, () => {
                        return MyResponse(res, resCode.BAD_REQUEST, false, '删除图片失败', {});
                    })
                } catch (error) {
                    console.log("DOES NOT exist:");
                }
            }
            await link.destroy();

            // LOG
            await this.adminLogger(req, 'ReferenceLink', 'delete');

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;