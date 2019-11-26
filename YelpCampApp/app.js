var express       = require('express'),
	app           = express(),
	bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    passport      = require('passport'),
    LocalStrategy = require('passport-local'),
    Campground    = require("./models/campground"),
    Comment       = require("./models/comment"),
    User          = require('./models/user'),
    methodOverride = require('method-override'),
    seedDB        = require("./seeds");

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

//connect DB & fix dependency issues
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); //Serve public directory. __dirname points to directory the script lives in.
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Naruto is better than Sasuke",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use(campgroundRoutes); 
app.use(commentRoutes);



app.listen(3000, function(){
    console.log("YelpCamp Server Started!");
});