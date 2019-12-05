var express = require('express'),
    router  = express.Router(),
    passport = require('passport'),
    User = require('../models/user'),
    async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto'), //apart of node and does not need to be installed
    xoauth2 = require('xoauth2'),
    Campground = require('../models/campground'); 

    

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
    var newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
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

//LOGOUT ROUTE
router.get("/logout", function(req,res){
    req.logOut();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

//FORGOT PASSWORD
router.get("/forgot", function(req,res){
    res.render("forgot");
});
router.post("/forgot", function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){ //create 20 length byte
                var token = buf.toString('hex');
                done(err, token); //create token that will be sent along with the url for password reset.
            });
        },
        function(token, done){
            User.findOne({ email: req.body.email}, function(err, user){
                if (!user){
                    req.flash('error', 'No account with that email address exists.'); //flash error message
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token; //sets the vars equal to each other. 
                user.resetPasswordExpires = Date.now() + 3600000; //set token to expire in an hour.

                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({ //nodemailer package used to send mail
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                service: 'gmail',
                auth: {
                    xoauth2: xoauth2.createXOAuth2Generator({
                        type: 'OAuth2',
                        user: 'chozen92@gmail.com',
                        clientId: '733682057081-dmbop2eeg7c1p3fjrtfh5sjpqn8qoe7q.apps.googleusercontent.com',
                        clientSecret: 'F6Z4v62F4Vwm-8_etRSNRLlQ',
                        refreshToken: '1//04R4j7RV5_zsMCgYIARAAGAQSNwF-L9IrwA1sBT8CATgUpjsYtcbHsjri3dZNbqzaBVfLWRSY2tdDYOi6UDYoDIT4UlPCuNIG1Cw',
                        accessToken: 'ya29.Il-zB4aQfGfzKMyTdCAJwCRGa1aUyl03BbuoDxo1dixhtSZg5b9txLUzUV713mvtifWm-HdOSe_yZI4g-emgCQEqn2NrOMpiPGtcdoNl0x4UCaCcKADW-CnctXPdpLLpRw'
                    }),    
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'chozen92@gmail.com',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the resetting of your password' + 
                    'Please click on the following link, or paste this into your browser to complete the process' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' + 
                    'If you did not request this, please ignore this email and your password will remain unchanged.'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.')
                done(err, 'done');
            })
        }
    ], function(err){
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

//RESET PASSWORD FORM
router.get('/reset/:token', function(req,res){ 
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },function(err, user){
        if (!user){
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token}); //renders reset view, passing in token
    });
});
//NEW PASSWORD & CONFIRMS PASSWORD
router.post('/reset/:token', function(req,res){
    async.waterfall([
        function(done){
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){ //make sure password expires is greater than the current date
                if (!user){
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, function(err){ //mongoose method to set pw
                        user.resetPasswordToken = undefined; 
                        user.resetPasswordExpires = undefined;
                        
                        user.save(function(err){
                            req.logIn(user, function(err){ //login with user
                                done(err, user); //invoke done
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match."); //error handling
                    return res.redirect('back'); 
                }
            });
        }, //send confirmation emails
        function(user, done){
            var smtpTransport = nodemailer.createTransport({ //gotta fix
                service: 'gmail',
                auth: {
                    xoauth2: xoauth2.createXOAuth2Generator({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,                        
                        type: 'OAuth2',
                        user: 'chozen92@gmail.com',
                        clientId: '733682057081-dmbop2eeg7c1p3fjrtfh5sjpqn8qoe7q.apps.googleusercontent.com',
                        clientSecret: 'F6Z4v62F4Vwm-8_etRSNRLlQ',
                        refreshToken: '1//04R4j7RV5_zsMCgYIARAAGAQSNwF-L9IrwA1sBT8CATgUpjsYtcbHsjri3dZNbqzaBVfLWRSY2tdDYOi6UDYoDIT4UlPCuNIG1Cw',
                        accessToken: 'ya29.Il-zB4aQfGfzKMyTdCAJwCRGa1aUyl03BbuoDxo1dixhtSZg5b9txLUzUV713mvtifWm-HdOSe_yZI4g-emgCQEqn2NrOMpiPGtcdoNl0x4UCaCcKADW-CnctXPdpLLpRw'
                    }), 
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'chozen92@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello, \n\n' +
                    'THis is a confirmation that the password for your account ' + user.email + ' has just been reset.'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err){
        res.redirect('/campgrounds');
    });
});

//USER PROFILE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if (err){
            req.flash(error, "Something went wrong");
            res.redirect("/campgrounds");
        } else{
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
                if (err){
                    req.flash(error, "Something went wrong");
                    res.redirect("/campgrounds");
                }  
                res.render("users/show", {user: foundUser, campgrounds: campgrounds});              
            })
        }
    });
});

module.exports = router;