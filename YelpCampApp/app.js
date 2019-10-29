var express = require('express');
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var campgrounds =[
    {name: "Salmon Creek", image: "https://pixabay.com/get/54e6dc414a57a414f6da8c7dda793f7f1636dfe2564c704c722d78dc914ec259_340.jpg"},
    {name: "Little Bear Mt.", image: "https://pixabay.com/get/54e8d64a4a5baf14f6da8c7dda793f7f1636dfe2564c704c722d78dc914ec259_340.jpg"},
    {name: "YellowFish Woods", image: "https://pixabay.com/get/5ee1d14b484fad0bffd8992ccf2934771438dbf85254764b76277dd7904c_340.jpg"}
];

app.get("/", function(req,res){
    res.render("landing");
});

app.get("/campgrounds", function(req,res){

    res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req,res){

    //get data from form and add to campgrounds array
    let name = req.body.name; //name value comes from name attribute in form
    let image = req.body.image; //image value comes from image attribute in form
    let newCampground = {name: name, image: image}; //create new object
    campgrounds.push(newCampground); //push newCampground
    //redirect back to campgrounds page
    res.redirect("/campgrounds");
});

//CAMPGROUNDS FORM
app.get("/campgrounds/new", function(req,res){
    res.render("new.ejs");
});


app.listen(3000, function(){
    console.log("YelpCamp Server Started!");
});