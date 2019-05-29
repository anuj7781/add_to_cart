const express = require('express');
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passportLocal = require('./config/passport');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);//requires session argument because you need to store the session information in the database


const app = express()

mongoose.connect('mongodb://localhost/shopping');

app.use(express.urlencoded());

app.use(express.static('./assets'));

app.use(expressLayouts);

// extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({
    name: 'codeial',
    secret: 'blahsomething',
    saveUninitialized: false,//whenever there is a request which is not initialized,which means a session that is not initialized,which further means that the user has not logged in do i want to store extra data in the cookie? 
    resave: false,//when identity is established or some sort of data is present in session cookie(session data),do i want to rewrite even if has not changed?
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store:new MongoStore({
            mongooseConnection:mongoose.connection,
            autoRemove:'disabled'
    },
    //callback function incase connnection is not established
    function(err){
        console.log(err || 'connect-mongodb setup okay');
    } 
    )
    
}));

app.use(validator());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session =  req.session;
    next();
});


// use express router
app.use('/', require('./routes'));


app.listen(port, function (err) {
    if (err) {
        console.log(`Error in running the server : ${err}`);
        return;
    }
    console.log(`Server is running on port ${port}`);
});

