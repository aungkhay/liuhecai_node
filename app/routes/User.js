const express = require('express');

class UserRoute extends express.Router {
    constructor(app) {
        super();

        const MainController = require('../controllers/users/MainController');
        const mainCtrl = new MainController(app);
        // this.get('/current-year', mainCtrl.GET_YEAR);
        this.get('/server-time', mainCtrl.GET_SERVER_TIME);
        this.get('/banners', mainCtrl.GET_BANNER);
        this.get('/lottery-record/last', mainCtrl.LAST_RECORD);
        this.get('/lottery-record/history', mainCtrl.RECORD_HISTORY);
        this.get('/result-guess', mainCtrl.RESULT_GUESS);
        this.get('/get-xiao-ma', mainCtrl.GET_XIAO_MA);
        this.get('/tou-zi-ping-te', mainCtrl.GET_TOU_ZI_PING_TE);
        this.get('/double-color', mainCtrl.GET_DOUBLE_COLOR);
        this.get('/reference-links', mainCtrl.GET_REFERENCE_LINKS);
        this.get('/platform-next-batch-number', mainCtrl.NEXT_BATCH_NUMBER);
        this.get('/reference-images', mainCtrl.REFERENCE_IMAGES);
        this.get('/zodiac-feed', mainCtrl.ZODIAC_FEED);
    }
}

module.exports = UserRoute;