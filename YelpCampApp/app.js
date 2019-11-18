var express    = require('express'),
	app        = express(),
	bodyParser = require("body-parser"),
	mongoose   = require("mongoose"); 

//connect DB & fix dependency issues
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String
});

//Model Setup
var Campground = mongoose.model("Campground", campgroundSchema);


// Campground.create({
// 	name: "Salmon Creek", 
// 	image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?cs=srgb&dl=photo-of-pitched-dome-tents-overlooking-mountain-ranges-1687845.jpg&fm=jpg"}, function(err,campground){
// 	if(err){
// 		console.log(err);
// 	}else {
// 		console.log("Newly created campground");
// 		console.log(campground);
// 	}
// })



app.get("/", function(req,res){
    res.render("landing");
});

app.get("/campgrounds", function(req,res){
//Get all campgrounds
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		}else {
		 res.render("campgrounds", {campgrounds: allCampgrounds});
		}
	})
});

app.post("/campgrounds", function(req,res){

    //get data from form and add to campgrounds array
    let name = req.body.name; //name value comes from name attribute in form
    let image = req.body.image; //image value comes from image attribute in form
    let newCampground = {name: name, image: image}; //create new object
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

//CAMPGROUNDS FORM
app.get("/campgrounds/new", function(req,res){
    res.render("new.ejs");
});


app.listen(3000, function(){
    console.log("YelpCamp Server Started!");
});