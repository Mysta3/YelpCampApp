var express = require('express'),
    router  = express.Router(),
    Campground = require("../models/campground");

//INDEX route
router.get("/campgrounds", function(req,res){
    //Get all campgrounds
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            }else {
             res.render("campgrounds/index", {campgrounds: allCampgrounds});
            }
        })
    });
    
    
    //CREATE route 
    router.post("/campgrounds", isLoggedIn, function(req,res){
    
        //get data from form and add to campgrounds array
        let name = req.body.name; //name value comes from name attribute in form
        let image = req.body.image; //image value comes from image attribute in form
        let desc = req.body.description; //description from form 
        let author = {
            id: req.user._id,
            username: req.user.username
        };
        let newCampground = {name: name, image: image, description: desc, author: author}; //create new object
         //Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            }else {
                    //redirect back to campgrounds page
                res.redirect("/campgrounds");
            }
       })
    });
    
    //NEW route- CAMPGROUNDS FORM
    router.get("/campgrounds/new", isLoggedIn, function(req,res){
        res.render("campgrounds/new.ejs");
    });
    
    //SHOW route - displays more info for 1 item.
    router.get("/campgrounds/:id", function(req,res){
        //find campground by ID using id param
        Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
            if(err){
                console.log(err);
            }else{
                 //show more information
                res.render("campgrounds/show", {campground: foundCampground});
            }
        });
    });

    //EDIT CAMPGROUND ROUTE
    router.get("/campgrounds/:id/edit", function(req,res){
        Campground.findById(req.params.id,function(err, foundCampground){
            if(err){
                res.redirect("/campgrounds")
            } else {
                res.render("campgrounds/edit", {campground: foundCampground});
            }
        })
    });

    //UPDATE CAMPGROUND ROUTE
    router.put("/campgrounds/:id", function(req,res){
        //find and updagte campground
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
            if(err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds/" + req.params.id);
            }
        })
    }); 

    //DESTROY ROUTE
    router.delete("/campgrounds/:id", function(req,res){
        Campground.findByIdAndRemove(req.params.id, function(err){
            if(err){
                res.redirect("/campgrounds");
            } else{
                res.redirect("/campgrounds");
            }
            Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect("/campgrounds");
            });
        })
    })


    function isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect("/login");
    };

    module.exports = router;