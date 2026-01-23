const express = require('express');

class AdminRoute extends express.Router {
    constructor(app) {
        super();

        let MiddleWare = require('../middlewares/AdminMiddleware');
        let middleware = new MiddleWare(app);
        
        const FormValidator = require('../middlewares/FormValidator.Admin');

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
        const ZodiacController = require('../controllers/admins/ZodiacController');
        const zodiacCtrl = new ZodiacController(app);
        this.get('/zodiac/numbers', middleware.isLoggedIn, zodiacCtrl.GET_ZODIAC_NUMBERS);
        this.get('/zodiac/list', middleware.isLoggedIn, zodiacCtrl.GET_ZODIAC_LIST);
        
        // Record Routes
        const RecordController = require('../controllers/admins/RecordController');
        const recordCtrl = new RecordController(app);
        this.get('/lottery-records', middleware.isLoggedIn, recordCtrl.INDEX);
        this.post('/lottery-records/create', FormValidator.create_record(), middleware.isLoggedIn,  recordCtrl.CREATE);
        this.post('/lottery-records/:id/update', FormValidator.create_record(), middleware.isLoggedIn, recordCtrl.UPDATE);
        this.post('/lottery-records/:id/delete', middleware.isLoggedIn, recordCtrl.DELETE);
    }
}

module.exports = AdminRoute;