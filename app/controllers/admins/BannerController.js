const MyResponse = require('../../helpers/MyResponse');
const CommonHelper = require('../../helpers/CommonHelper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Banner } = require('../../models');

class Controller {
    constructor () {
        this.commonHelper = new CommonHelper();
        this.ResCode = this.commonHelper.ResCode;
        this.adminLogger = this.commonHelper.AdminLogger;
    }

    INDEX = async (req, res) => {
        try {
            const banners = await Banner.findAll({
                order: [['id', 'DESC']],
            });

            return MyResponse(res, this.ResCode.SUCCESS.code, true, '成功', banners);
        } catch (error) {
            console.error(error);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    UPLOAD = async (req, res) => {
        try {
            req.uploadDir = `./uploads/banners`;

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
                await Banner.create({ image: `/uploads/banners/${fileName}` });
                return MyResponse(res, this.ResCode.SUCCESS.code, true, '上传成功', {});
            })
        } catch (error) {
            errLogger(`[Banner][UPLOAD]: ${error.stack}`);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }

    DELETE = async (req, res) => {
        try {
            const banner = await Banner.findByPk(req.params.id, { attributes: ['id', 'image'] });
            if (!banner) {
                return MyResponse(res, this.ResCode.NOT_FOUND.code, false, '未找到信息', {});
            }

            // Delete File
            if(banner.image != null) {
                const filePath = path.resolve(__dirname, `../../..${banner.image}`);
                try {
                    fs.accessSync(filePath);
                    fs.unlinkSync(filePath, () => {
                        return MyResponse(res, this.ResCode.BAD_REQUEST.code, false, '删除失败！', {});
                    })
                } catch (err) {
                    console.log("DOES NOT exist:", filePath);
                }
            }

            await banner.destroy();
            return MyResponse(res, this.ResCode.SUCCESS.code, true, '删除成功', {});
        } catch (error) {
            errLogger(`[Banner][DELETE]: ${error.stack}`);
            return MyResponse(res, this.ResCode.SERVER_ERROR.code, false, this.ResCode.SERVER_ERROR.msg, {});
        }
    }
}

module.exports = Controller;