const express = require('express');

class AdminRoute extends express.Router {
    constructor(app) {
        super();

        let MiddleWare = require('../middlewares/AdminMiddleware');
        let middleware = new MiddleWare(app);
        
        const FormValidator = require('../middlewares/FormValidator.Admin');

        // Role Routes
        let RoleController = require('../controllers/admins/RoleController');
        let RoleCtrl = new RoleController();
        this.get('/roles/list', middleware.isLoggedIn('role-list'), RoleCtrl.ROLES);
        this.get('/roles/permission-list', middleware.isLoggedIn(), RoleCtrl.PERMISSIONS);
        this.get('/roles/:id/permissions', middleware.isLoggedIn(), RoleCtrl.ROLE_HAS_PERMISSIONS);
        this.post('/roles/create', FormValidator.create_role(), middleware.isLoggedIn('role-add'), RoleCtrl.CREATE_ROLE);
        this.post('/roles/:id/update', FormValidator.update_role(), middleware.isLoggedIn('role-update'), RoleCtrl.UPDATE_ROLE);
        this.post('/roles/:id/delete', middleware.isLoggedIn('role-delete'), RoleCtrl.DELETE_ROLE);
        this.post('/roles/:id/assign-permissions', FormValidator.assign_permissions(), middleware.isLoggedIn('role-assign-permission'), RoleCtrl.ASSIGN_PERMISSIONS_TO_ROLE);

        // Config Routes
        const ConfigController = require('../controllers/admins/ConfigController');
        const configCtrl = new ConfigController(app);
        this.get('/configs', middleware.isLoggedIn('config-list'), configCtrl.INDEX);
        // this.get('/current-year', middleware.isLoggedIn('config-list'), configCtrl.GET_YEAR);
        this.get('/configs/xiao-ma', middleware.isLoggedIn('config-list'), configCtrl.XIAO_MA);
        this.post('/configs/update-qi-xiao', FormValidator.update_qi_xiaos(), middleware.isLoggedIn('config-update'), configCtrl.UPDATE_XIAO);
        this.post('/configs/update-wu-xiao', FormValidator.update_wu_xiaos(), middleware.isLoggedIn('config-update'), configCtrl.UPDATE_XIAO);
        this.post('/configs/update-san-xiao', FormValidator.update_san_xiaos(), middleware.isLoggedIn('config-update'), configCtrl.UPDATE_XIAO);

        // Auth Routes
        const AuthController = require('../controllers/admins/AuthController');
        const authCtrl = new AuthController(app);
        this.get('/get-recaptcha', authCtrl.GET_RECAPTCHA);
        this.post('/login', authCtrl.LOGIN);
        this.post('/logout', middleware.isLoggedIn(), authCtrl.LOGOUT);
        this.get('/profile', middleware.isLoggedIn(), authCtrl.PROFILE);

        // User Routes
        const UserController = require('../controllers/admins/UserController');
        const userCtrl = new UserController(app);
        this.get('/users', middleware.isLoggedIn('user-list'), userCtrl.INDEX);
        this.post('/users/create', FormValidator.create_user(), middleware.isLoggedIn('user-add'), userCtrl.CREATE);
        this.post('/users/:id/change-password', FormValidator.change_password(), middleware.isLoggedIn('user-change-password'), userCtrl.CHANGE_PASSWORD);
        this.post('/users/:id/change-status', middleware.isLoggedIn('user-change-status'), userCtrl.CHANGE_STATUS);
        this.post('/users/:id/delete', middleware.isLoggedIn('user-delete'), userCtrl.DELETE);
        this.post('/users/:id/assign-roles', FormValidator.assign_roles(), middleware.isLoggedIn('user-assign-role'), userCtrl.ASSIGN_ROLES);

        // Banner Routes
        const BannerController = require('../controllers/admins/BannerController');
        const bannerCtrl = new BannerController(app);
        this.get('/banners', middleware.isLoggedIn('banner-list'), bannerCtrl.INDEX);
        this.post('/banners/upload', middleware.isLoggedIn('banner-create'), bannerCtrl.UPLOAD);
        this.post('/banners/:id/delete', middleware.isLoggedIn('banner-delete'), bannerCtrl.DELETE);

        // Zodiac Routes
        // const ZodiacController = require('../controllers/admins/ZodiacController');
        // const zodiacCtrl = new ZodiacController(app);
        // this.get('/zodiac/numbers', middleware.isLoggedIn(), zodiacCtrl.GET_ZODIAC_NUMBERS);
        // this.get('/zodiac/list', middleware.isLoggedIn(), zodiacCtrl.GET_ZODIAC_LIST);
        
        // Record Routes
        const RecordController = require('../controllers/admins/RecordController');
        const recordCtrl = new RecordController(app);
        this.get('/lottery-records/last-batch-number', middleware.isLoggedIn(), recordCtrl.PLATFORM_LAST_BATCH_NUMBER);
        this.get('/lottery-records', middleware.isLoggedIn('record-list'), recordCtrl.INDEX);
        this.post('/lottery-records/create', FormValidator.create_record(), middleware.isLoggedIn('record-create'),  recordCtrl.CREATE);
        this.post('/lottery-records/:id/update', FormValidator.create_record(), middleware.isLoggedIn('record-update'), recordCtrl.UPDATE);
        this.post('/lottery-records/:id/delete', middleware.isLoggedIn('record-delete'), recordCtrl.DELETE);
        this.post('/check-number-in-bets', FormValidator.check_number_in_bets(), middleware.isLoggedIn(), recordCtrl.CHECK_NUMBER_IN_BETS);
        this.post('/lottery-records/:id/calculate', middleware.isLoggedIn('record-calculate'), recordCtrl.CALCULATE_BET_RESULTS);

        // Result Guess Routes
        const ResultGuessController = require('../controllers/admins/ResultGuessController');
        const resultGuessCtrl = new ResultGuessController(app);
        this.get('/result-guesses', middleware.isLoggedIn('result-guess-list'), resultGuessCtrl.INDEX);
        this.post('/result-guesses/create', FormValidator.create_result_guess(), middleware.isLoggedIn('result-guess-create'), resultGuessCtrl.CREATE);
        this.post('/result-guesses/:id/update', FormValidator.create_result_guess(), middleware.isLoggedIn('result-guess-update'), resultGuessCtrl.UPDATE);
        this.post('/result-guesses/:id/delete', middleware.isLoggedIn('result-guess-delete'), resultGuessCtrl.DELETE);

        // TouZiPingTe Routes
        const TouziPingteController = require('../controllers/admins/TouziPingteController');
        const touziPingteCtrl = new TouziPingteController(app);
        this.get('/tou-zi-ping-te', middleware.isLoggedIn('touzi-pingte-list'), touziPingteCtrl.INDEX);
        this.get('/tou-zi-ping-te/last-batch-number', middleware.isLoggedIn(), touziPingteCtrl.LAST_BATCH_NUMBER);
        this.post('/tou-zi-ping-te/create', FormValidator.create_touzi_pingte(), middleware.isLoggedIn('touzi-pingte-create'), touziPingteCtrl.CREATE);
        this.post('/tou-zi-ping-te/:id/update', FormValidator.create_touzi_pingte(), middleware.isLoggedIn('touzi-pingte-update'), touziPingteCtrl.UPDATE);
        this.post('/tou-zi-ping-te/:id/delete', middleware.isLoggedIn('touzi-pingte-delete'), touziPingteCtrl.DELETE);

        // Double Color Routes
        const DoubleColorController = require('../controllers/admins/DoubleColorController');
        const doubleColorCtrl = new DoubleColorController(app);
        this.get('/double-color', middleware.isLoggedIn(), doubleColorCtrl.INDEX);
        this.post('/double-color/create', FormValidator.create_double_color(), middleware.isLoggedIn(), doubleColorCtrl.CREATE);
        this.post('/double-color/:id/update', FormValidator.create_double_color(), middleware.isLoggedIn(), doubleColorCtrl.UPDATE);
        this.post('/double-color/:id/delete', middleware.isLoggedIn(), doubleColorCtrl.DELETE);

        // Bet Routes
        const BetController = require('../controllers/admins/BetController');
        const betCtrl = new BetController(app);
        this.get('/bet/categories', middleware.isLoggedIn('bet-list'), betCtrl.GET_CATEGORY_LIST);
        this.get('/bet/items/:sub_category_id', middleware.isLoggedIn('bet-list'), betCtrl.GET_BET_ITEMS);
        this.post('/bet/do-bet', FormValidator.do_bet(), middleware.isLoggedIn('bet-do-bet'), betCtrl.DO_BET);
        this.get('/bet/history', middleware.isLoggedIn('bet-history'), betCtrl.BET_HISTORY);
        this.get('/bet/summary', middleware.isLoggedIn('bet-summary'), betCtrl.BET_SUMMARY);

        // Reference Link Routes
        const ReferenceLinkController = require('../controllers/admins/ReferenceLinkController');
        const referenceLinkCtrl = new ReferenceLinkController(app);
        this.get('/reference-links', middleware.isLoggedIn('reference-link-list'), referenceLinkCtrl.INDEX);
        this.post('/reference-links/create', FormValidator.create_reference_link(), middleware.isLoggedIn('reference-link-create'), referenceLinkCtrl.CREATE);
        this.post('/reference-links/:id/upload', middleware.isLoggedIn(), referenceLinkCtrl.UPLOAD);
        this.post('/reference-links/:id/update', FormValidator.create_reference_link(), middleware.isLoggedIn('reference-link-update'), referenceLinkCtrl.UPDATE);
        this.post('/reference-links/:id/delete', middleware.isLoggedIn('reference-link-delete'), referenceLinkCtrl.DELETE);

        // Admin Log Routes
        const AdminLogController = require('../controllers/admins/LogController');
        const logCtrl = new AdminLogController(app);
        this.get('/logs', middleware.isLoggedIn('log-list'), logCtrl.INDEX);
    }
}

module.exports = AdminRoute;