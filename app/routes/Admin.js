const express = require('express');

class AdminRoute extends express.Router {
    constructor(app) {
        super();

        let MiddleWare = require('../middlewares/AdminMiddleware');
        let middleware = new MiddleWare(app);
        
        const FormValidator = require('../middlewares/FormValidator.Admin');

        // Config Routes
        const ConfigController = require('../controllers/admins/ConfigController');
        const configCtrl = new ConfigController(app);
        this.get('/configs', middleware.isLoggedIn, configCtrl.INDEX);
        this.get('/current-year', middleware.isLoggedIn, configCtrl.GET_YEAR);
        this.get('/configs/xiao-ma', middleware.isLoggedIn, configCtrl.XIAO_MA);
        this.post('/configs/update-qi-xiao', FormValidator.update_qi_xiaos(), middleware.isLoggedIn, configCtrl.UPDATE_XIAO);
        this.post('/configs/update-wu-xiao', FormValidator.update_wu_xiaos(), middleware.isLoggedIn, configCtrl.UPDATE_XIAO);
        this.post('/configs/update-san-xiao', FormValidator.update_san_xiaos(), middleware.isLoggedIn, configCtrl.UPDATE_XIAO);

        // Auth Routes
        const AuthController = require('../controllers/admins/AuthController');
        const authCtrl = new AuthController(app);
        this.get('/get-recaptcha', authCtrl.GET_RECAPTCHA);
        this.post('/login', authCtrl.LOGIN);
        this.post('/logout', middleware.isLoggedIn, authCtrl.LOGOUT);
        this.get('/profile', middleware.isLoggedIn, authCtrl.PROFILE);

        // Banner Routes
        const BannerController = require('../controllers/admins/BannerController');
        const bannerCtrl = new BannerController(app);
        this.get('/banners', middleware.isLoggedIn, bannerCtrl.INDEX);
        this.post('/banners/upload', middleware.isLoggedIn, bannerCtrl.UPLOAD);
        this.post('/banners/:id/delete', middleware.isLoggedIn, bannerCtrl.DELETE);

        // Zodiac Routes
        // const ZodiacController = require('../controllers/admins/ZodiacController');
        // const zodiacCtrl = new ZodiacController(app);
        // this.get('/zodiac/numbers', middleware.isLoggedIn, zodiacCtrl.GET_ZODIAC_NUMBERS);
        // this.get('/zodiac/list', middleware.isLoggedIn, zodiacCtrl.GET_ZODIAC_LIST);
        
        // Record Routes
        const RecordController = require('../controllers/admins/RecordController');
        const recordCtrl = new RecordController(app);
        this.get('/lottery-records/last-batch-number', middleware.isLoggedIn, recordCtrl.PLATFORM_LAST_BATCH_NUMBER);
        this.get('/lottery-records', middleware.isLoggedIn, recordCtrl.INDEX);
        this.post('/lottery-records/create', FormValidator.create_record(), middleware.isLoggedIn,  recordCtrl.CREATE);
        this.post('/lottery-records/:id/update', FormValidator.create_record(), middleware.isLoggedIn, recordCtrl.UPDATE);
        this.post('/lottery-records/:id/delete', middleware.isLoggedIn, recordCtrl.DELETE);

        // Result Guess Routes
        const ResultGuessController = require('../controllers/admins/ResultGuessController');
        const resultGuessCtrl = new ResultGuessController(app);
        this.get('/result-guesses', middleware.isLoggedIn, resultGuessCtrl.INDEX);
        this.post('/result-guesses/create', FormValidator.create_result_guess(), middleware.isLoggedIn, resultGuessCtrl.CREATE);
        this.post('/result-guesses/:id/update', FormValidator.create_result_guess(), middleware.isLoggedIn, resultGuessCtrl.UPDATE);
        this.post('/result-guesses/:id/delete', middleware.isLoggedIn, resultGuessCtrl.DELETE);

        // TouZiPingTe Routes
        const TouziPingteController = require('../controllers/admins/TouziPingteController');
        const touziPingteCtrl = new TouziPingteController(app);
        this.get('/tou-zi-ping-te', middleware.isLoggedIn, touziPingteCtrl.INDEX);
        this.get('/tou-zi-ping-te/last-batch-number', middleware.isLoggedIn, touziPingteCtrl.LAST_BATCH_NUMBER);
        this.post('/tou-zi-ping-te/create', FormValidator.create_touzi_pingte(), middleware.isLoggedIn, touziPingteCtrl.CREATE);
        this.post('/tou-zi-ping-te/:id/update', FormValidator.create_touzi_pingte(), middleware.isLoggedIn, touziPingteCtrl.UPDATE);
        this.post('/tou-zi-ping-te/:id/delete', middleware.isLoggedIn, touziPingteCtrl.DELETE);

        // Double Color Routes
        const DoubleColorController = require('../controllers/admins/DoubleColorController');
        const doubleColorCtrl = new DoubleColorController(app);
        this.get('/double-color', middleware.isLoggedIn, doubleColorCtrl.INDEX);
        this.post('/double-color/create', FormValidator.create_double_color(), middleware.isLoggedIn, doubleColorCtrl.CREATE);
        this.post('/double-color/:id/update', FormValidator.create_double_color(), middleware.isLoggedIn, doubleColorCtrl.UPDATE);
        this.post('/double-color/:id/delete', middleware.isLoggedIn, doubleColorCtrl.DELETE);

        // Bet Routes
        const BetController = require('../controllers/admins/BetController');
        const betCtrl = new BetController(app);
        this.get('/bet/categories', middleware.isLoggedIn, betCtrl.GET_CATEGORY_LIST);
        this.get('/bet/items/:sub_category_id', middleware.isLoggedIn, betCtrl.GET_BET_ITEMS);
        this.post('/bet/do-bet', FormValidator.do_bet(), middleware.isLoggedIn, betCtrl.DO_BET);
    }
}

module.exports = AdminRoute;