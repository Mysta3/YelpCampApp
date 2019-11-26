//////////////////////////////////////////
// COMMENT ROUTES
/////////////////////////////////////////
var express = require('express'),
    router  = express.Router({mergeParams: true}),
    Campground = require('../models/campground'),
    Comment = require('../models/comment'); 

router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        }else {
            res.render("comments/new", {campground: campground});
        }
    })
})

router.post("/campgrounds/:id/comments", isLoggedIn, function(req,res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //add username & id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username; 
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect campground show page
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};
module.exports = router;