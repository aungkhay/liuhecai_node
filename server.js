const express = require('express');
const APP = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { reqLogger } = require('./app/helpers/Logger');

require('dotenv').config({ path: `./.env` });
const HOST = process.env.HOST;
const PORT = process.env.PORT;

APP.use(cors());
APP.use(bodyParser.json({ limit: '100mb' })); // for parsing application/json
APP.use(bodyParser.urlencoded({ extended: true, limit: '100mb', parameterLimit: 50000 })); // for parsing application/x-www-form-urlencoded
APP.use('/uploads', express.static('uploads'));

// Redis Connection
const Redis = require('./app/connections/Redis');
APP.set('redis', Redis);

// DB Connection
const { connect, syncDB } = require('./app/models');
(async () => {
    await connect();
    await syncDB(); // <-- Creates tables
})();

APP.get('/', (req, res) => {
    return res.status(400).json({ success: false, message: 'Invalid endpoint!' });
});

APP.use((req, res, next) => {
    reqLogger(req, res);
    return next();
})

// Routes
const UserRoute = require('./app/routes/User');
APP.use('/api', new UserRoute(APP));
const AdminRoute = require('./app/routes/Admin');
APP.use('/admin', new AdminRoute(APP));

// Cron Jobs
const Cron = require('./app/cron');
const cron = new Cron(APP);
cron.START();
cron.CALCULATE_BET();
// cron.GET_HK_HISTORY();
// cron.GET_NEW_AM_HISTORY();

// Start Server
APP.listen(PORT, HOST, () => {
    console.log(`\x1b[34m[APP]\x1b[0m Listening on ====>`, `\x1b[34mhttp://${HOST}:${PORT}\x1b[0m`);
});