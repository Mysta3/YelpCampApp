var express = require('express'),
    router  = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"); //if you require a directory the index.js file will auto be required
    var multer = require('multer');
    var storage = multer.diskStorage({
      filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
      }
    });
    var imageFilter = function (req, file, cb) {
        // accept image files only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    };
    var upload = multer({ storage: storage, fileFilter: imageFilter})
    
    var cloudinary = require('cloudinary');
    cloudinary.config({ 
      cloud_name: 'yelpcampytest', 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET
    });     

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
    router.post("/campgrounds", middleware.isLoggedIn, upload.single('image'), function(req, res) {    
        cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
            if(err) {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // add image's public_id to campground object
            req.body.campground.imageId = result.public_id;
            // add author to campground
            req.body.campground.author = {
              id: req.user._id,
              username: req.user.username
            }
            Campground.create(req.body.campground, function(err, campground) {
              if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
              }
              res.redirect('/campgrounds/' + campground.id);
            });
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
    router.put("/campgrounds/:id", upload.single('image'), function(req,res){
        //find and updagte campground
        Campground.findByIdAndUpdate(req.params.id, async function(err, campground) {
            if(err){
                req.flash("error", err.message);
                console.log(err.message);
                res.redirect("back");
            } else {
                if (req.file){
                    try{
                     await  cloudinary.v2.uploader.destroy(campground.imageId);
                        var result = cloudinary.v2.uploader.upload(req.file.path);
                        campground.imageId = result.public_id;
                        campground.image = result.secure_url;   
                    } catch(err){
                        req.flash("error", err.message);
                        console.log(err.message);
                        return res.redirect("back");
                    }                        
                }
                campground.name = req.body.campground.name;
                campground.description = req.body.campground.description;
                campground.save();
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
                }
             });
        });


    //DESTROY ROUTE
    router.delete('campgrounds/:id', function(req, res) {
        Campground.findById(req.params.id, async function(err, campground) {
          if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          try {
              await cloudinary.v2.uploader.destroy(campground.imageId);
              campground.remove();
              req.flash('success', 'Campground deleted successfully!');
              res.redirect('/campgrounds');
          } catch(err) {
              if(err) {
                req.flash("error", err.message);
                return res.redirect("back");
              }
          }
        });
      });

    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    module.exports = router;