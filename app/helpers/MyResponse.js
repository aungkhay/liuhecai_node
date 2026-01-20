module.exports = (res, code, success, message, data, errors = null) => {
    const resData = {
        code: code,
        success: success,
        message: message,
        data: data,
        errors: errors ?? {}
    }

    return res.status(200).json(resData);
}