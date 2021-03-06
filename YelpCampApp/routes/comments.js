//////////////////////////////////////////
// COMMENT ROUTES
/////////////////////////////////////////
var express = require('express'),
    router  = express.Router({mergeParams: true}),
    Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    middleware = require("../middleware"); 

router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        }else {
            res.render("comments/new", {campground: campground});
        }
    })
})

router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req,res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
                //create new comment
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong.");
                    console.log(err);
                } else {
                    //add username & id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username; 
                    //save comment
                    comment.save();
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect campground show page
                    res.redirect("/campgrounds/" + campground._id);
                    // req.flash("success", "Comment added successfully.");
                }
            })
        }
    });
    
})

//EDIT COMMENT
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.isLoggedIn, middleware.checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    })

});

//UPDATE COMMENT

router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
        if(err){
            res.redirect("back");
        }else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
});

//DELETE COMMENTS
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else{
            req.flash("success", "Comment Deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
    
})


module.exports = router;