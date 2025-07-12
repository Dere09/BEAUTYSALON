const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const Connectdb = require('./db');
const registerRoutes = require('./routes/registerRoutes'); //serviceTypeRoute
//const serviceRoutes = require('./routes/serviceRoute/serviceTypeRoute'); 
const userRoutes = require('./routes/userRoutes'); // Import customer service routes
//const serviceTypeRoute = require('./routes/serviceRoute/serviceTypeRoute');
const servicesRoutes = require('./routes/servicesRoutes');
dotenv.config();
Connectdb();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use('/', servicesRoutes);
app.use('/', registerRoutes);
app.use('/', userRoutes); 

app.get('/createUser', (req, res) => {
    res.render('createUser');
});
app.get('/member', (req, res) =>{
    res.render('member');
})
app.get('/registration', (req, res) =>{
    res.render('registration');
})
app.get('/home', (req, res) =>{
    res.render('home');
});
app.get('/gallery', (req, res) =>{
    res.render('gallery');
})
app.get('/', (req,res) =>{
    res.render('CustomerList');
});
app.get('/userslist', (req, res) => {
    res.render('userslist'); // Render the user list view
});
app.get('/dashboard', (req, res) =>{
    res.render('dashboard'); // Render the create user view
});
app.get('/serviceoffer', (req, res) => {
    res.render('serviceoffer'); // Render the service offer view
});
app.get('/login', (req, res) => {
 
    res.render('login'); // Pass registrationId to the view
});
app.get('/reset-password/:username', (req, res) => {
    const userId = req.params.username;
    res.render('reset-password', { userId }); // Pass userId to the view
});
app.get('/services/createServiceType', (req, res) => {
    res.render('services/createServiceType'); // Render the create service type view
}); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));