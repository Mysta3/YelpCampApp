var express = require('express'),
    router  = express.Router(),
    passport = require('passport'),
    User = require('../models/user'); 

router.get("/", function(req,res){
    res.render("landing");
});


//AUTH ROUTES
//SIGN UP
//show register form
router.get("/register", function(req,res){
    res.render("register");
});

//handle SIGN UP logic
router.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === 'TheChoz3ns'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render('register', {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to the Community " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN ROUTES
//show login form
router.get("/login", function(req,res){
    res.render("login");
});

//handling login logic
//app.post("/login", middleware, callback);
router.post("/login",passport.authenticate("local", 
        {
         successRedirect: "/campgrounds",
         failureRedirect: "/login"
    }), function(req,res){
    
});

//logOut Route
router.get("/logout", function(req,res){
    req.logOut();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});


module.exports = router;