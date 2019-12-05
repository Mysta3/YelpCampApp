var express = require('express'),
    router  = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"); //if you require a directory the index.js file will auto be required
     

//INDEX route - show all campgrounds
router.get("/campgrounds", function(req,res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    //search all campgrounds - fuzzy search
    Campground.find({name: regex}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            if(allCampgrounds.length < 1){
                noMatch = "Nothing Matched Your Search";
            }   
         res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
        }
    });
    }else {
    //Get all campgrounds
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else {
         res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
        }
    })
    }

    });
    
    
    //CREATE route 
    router.post("/campgrounds", middleware.isLoggedIn, function(req,res){
    
        //get data from form and add to campgrounds array
        let name = req.body.name; //name value comes from name attribute in form
        let price = req.body.price;
        let image = req.body.image; //image value comes from image attribute in form
        let desc = req.body.description; //description from form 
        let author = {
            id: req.user._id,
            username: req.user.username
        };

        let newCampground = {name: name, price: price, image: image, description: desc, author: author}; //create new object
         //Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            }else {
                    //redirect back to campgrounds page
                res.redirect("/campgrounds");
            }
        });
       });
    
    //NEW route- CAMPGROUNDS FORM
    router.get("/campgrounds/new", middleware.isLoggedIn, function(req,res){
        res.render("campgrounds/new.ejs");
    });
    
    //SHOW route - displays more info for 1 item.
    router.get("/campgrounds/:id", function(req,res){
        //find campground by ID using id param
        Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
            if(err || !foundCampground){
                console.log(err);
            }else{
                 //show more information
                res.render("campgrounds/show", {campground: foundCampground});
            }
        });
    });

    //EDIT CAMPGROUND ROUTE
    router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership, function(req,res){
            Campground.findById(req.params.id,function(err, foundCampground){
                res.render("campgrounds/edit", {campground: foundCampground});
    });
});


    //UPDATE CAMPGROUND ROUTE
    router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res){

        
        //find and updagte campground
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
            if(err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds/" + req.params.id);
            }
             });
        });


    //DESTROY ROUTE
    router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res){
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
    });

    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    module.exports = router;