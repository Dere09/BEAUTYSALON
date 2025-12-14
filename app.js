const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Created uploads directory');
}

const Connectdb = require('./db');
dotenv.config();
Connectdb();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Global error handlers to capture crashes during startup/runtime
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT_EXCEPTION:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED_REJECTION at:', promise, 'reason:', reason);
});
process.on('exit', (code) => {
    console.error('PROCESS_EXIT event with code:', code);
});
process.on('SIGTERM', () => {
    console.error('SIGTERM received');
});

const registerRoutes = require('./routes/registerRoutes');
const userRoutes = require('./routes/userRoutes'); // Import customer service routes
const serviceTypeRoute = require('./routes/serviceRoute/serviceTypeRoute');
const servicesRoutes = require('./routes/servicesRoutes');
const serviceAddRoutes = require('./routes/serviceRoute/serviceAddRoute');
const dashboardRoutes = require("./routes/dashboardRoute");
const instrouter = require('./routes/institutionRoute');
const institutionController = require('./Controller/institutionController');
const adRoutes = require('./routes/AdRoute');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const sessionConfig = require('./config/session');

app.use(methodOverride('_method')); // Allow PUT & DELETE via forms
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionConfig); // Use session configuration from config/session.js
app.use('/', authRoutes);
app.use('/', servicesRoutes);
app.use('/', registerRoutes);
app.use('/', userRoutes);
app.use('/', serviceTypeRoute); // Use the service type routes
app.use('/', serviceAddRoutes); // Use the service add routes
app.use("/dashboard", dashboardRoutes);
// Mount ads API routes
app.use('/api/ads', adRoutes);
app.get('/createUser', (req, res) => {
    res.render('createUser');
});
app.get('/member', (req, res) => {
    res.render('member');
})
//app.use('/registration', instrouter);
// Use the controller to populate registration with institutions
app.get('/registration', authMiddleware, institutionController.getRegistrationPage);
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/gallery', (req, res) => {
    res.render('gallery');
})
app.get('/', (req, res) => {
    res.render('CustomerList');
});

app.get('/dashboard', authMiddleware, (req, res) => {
    res.render('dashboard'); // Render the create user view
});
app.get('/serviceoffer', authMiddleware, (req, res) => {
    res.render('serviceoffer'); // Render the service offer view
});

app.get('/reset-password/:username', authMiddleware, (req, res) => {
    const userId = req.params.username;
    res.render('reset-password', { userId }); // Pass userId to the view
});
app.get('/adsmanager', authMiddleware, (req, res) => {
    res.render('adsmanager'); // Render the advertisement view
});
// Alias for older link casing/paths
// Legacy aliases for Advertisement (case variants)
app.get(['/Advertisement', '/advertisement', '/Ads-Manager', '/Ads-Manager'], authMiddleware, (req, res) => {
    res.render('adsmanager'); // Render the advertisement view (alias)
});
app.get('/services/createServiceType', authMiddleware, (req, res) => {
    res.render('services/createServiceType'); // Render the create service type view
});
app.get('/SericeOffered', authMiddleware, (req, res) => {
    res.render('services/listofservice'); // Render the list of services view
});
app.use('/Institution', instrouter);
app.get('/Institution', authMiddleware, institutionController.getCreateForm);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));