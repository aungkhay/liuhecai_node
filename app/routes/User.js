const express = require('express');

class UserRoute extends express.Router {
    constructor(app) {
        super();

        const MainController = require('../controllers/users/MainController');
        const mainCtrl = new MainController(app);
        this.get('/banners', mainCtrl.GET_BANNER);
        this.get('/zodiac/numbers', mainCtrl.GET_ZODIAC_NUMBERS);
        this.get('/zodiac/list', mainCtrl.GET_ZODIAC_LIST);
        this.get('/lottery-record/last', mainCtrl.LAST_RECORD);
        this.get('/lottery-record/history', mainCtrl.RECORD_HISTORY);
    }
}

module.exports = UserRoute;