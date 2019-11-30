var Campground    = require("../models/campground"),
    Comment       = require("../models/comment"),
    middlewareObj = {}; //Middleware goes here

middlewareObj.checkCampgroundOwnership = function(req,res,next){
 //is user logged in
 if(req.isAuthenticated()){    
    Campground.findById(req.params.id,function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground Not Found.");
            res.redirect("back")
        } else {
            //does user own campground?
            if(foundCampground.author.id.equals(req.user._id)){
                next();
            } else{
                req.flash("error", "Permission denied");
                res.redirect("back");
            }
            
        }
    });
}else {
    req.flash("error", "You need to be logged in to do that.")
    res.redirect("back"); //takes user to previous page they were on.
}
}

middlewareObj.checkCommentOwnership = function(req,res,next){
 //is user logged in
 if(req.isAuthenticated()){    
    Comment.findById(req.params.comment_id,function(err, foundComment){
        if(err || !foundComment){
            res.redirect("back")
        } else {
            //does user own comment?
            if(foundComment.author.id.equals(req.user._id)){ //cant do === because its a mongoose model
                next();
            } else{
                req.flash("error", "You don't have permissions.");
                res.redirect("back");
            }
        }
    });
}else {
    req.flash("error", "Need to be logged in.");
    res.redirect("back"); //takes user to previous page they were on.
}
}
//middleware Authentication
middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that."); //flash("key which is success or error", "messageToDisplay")
    res.redirect("/login");
};

module.exports = middlewareObj;