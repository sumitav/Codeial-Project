const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
//used for session cookie 
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const MongoStore = require('connect-mongo')(session);
const saasMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

app.use(saasMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));

/******************************************************Middlewares******************************/ 

app.use(express.urlencoded());
app.use(cookieParser());

/**********************************************use the assets folder for static files ******************/

app.use(express.static('./assets'));

/**********************make the uploads available for the browser*************/

app.use('/uploads',express.static(__dirname + '/uploads'));
/************************ Use express layouts************************/
app.use(expressLayouts);


/*******************8extract style and scripts from sub pages into the layout*************/

app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

/**************************set up the view engine****************************/
app.set('view engine','ejs');
app.set('views', './views');


/***********************mongo store is used to stroe the session cookie in the db*********************/


app.use(session({
    name: 'codeial',
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000*60*100)
    },
    store: new MongoStore(
        {
            mongooseConnection: db,
            autoRemove: 'disabled'
        },
        function(err){
            console.log(err || 'connect-mongodb setup ok');
        }
    )
})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);
app.use("/",require('./routes'));


app.listen(port,function(err){
    if(err)
        console.log("Error starting the server");
    
    console.log('Server Started');
});

