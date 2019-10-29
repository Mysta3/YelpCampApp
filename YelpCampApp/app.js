var express = require('express');
var app = express();

app.set("view engine", "ejs");

app.get("/", function(req,res){
    res.render("landing");
});

app.get("/campgrounds", function(req,res){
    var campgrounds =[
        {name: "Salmon Creek", image: "https://pixabay.com/get/54e6dc414a57a414f6da8c7dda793f7f1636dfe2564c704c722d78dc914ec259_340.jpg"},
        {name: "Little Bear Mt.", image: "https://pixabay.com/get/54e8d64a4a5baf14f6da8c7dda793f7f1636dfe2564c704c722d78dc914ec259_340.jpg"},
        {name: "YellowFish Woods", image: "https://pixabay.com/get/5ee1d14b484fad0bffd8992ccf2934771438dbf85254764b76277dd7904c_340.jpg"}
    ];
    res.render("campgrounds", {campgrounds: campgrounds});
});


app.listen(3000, function(){
    console.log("YelpCamp Server Started!");
})